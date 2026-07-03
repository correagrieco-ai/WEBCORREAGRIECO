<?php
/* ============================================================
   crear-preferencia.php — Backend de pagos de Correa Grieco
   El Access Token de Mercado Pago vive SOLO acá (lado servidor),
   nunca se envía al navegador. PHP se ejecuta en el servidor,
   así que el visitante jamás puede leer este archivo.
   ============================================================ */

header('Content-Type: application/json; charset=utf-8');

// Solo aceptar POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// 🔒 El Access Token se carga desde config.php (fuera del control de versiones / no va a GitHub).
$configPath = __DIR__ . '/config.php';
if (!file_exists($configPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Falta el archivo config.php en el servidor']);
    exit;
}
require $configPath;
if (empty($ACCESS_TOKEN)) {
    http_response_code(500);
    echo json_encode(['error' => 'El Access Token de Mercado Pago no está configurado']);
    exit;
}

// Leer datos enviados desde la tienda
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['items']) || !is_array($input['items'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos del pedido inválidos']);
    exit;
}

// Armar la preferencia. Las URLs y la config sensible se definen acá.
$preference = [
    'items' => $input['items'],
    'payer' => isset($input['payer']) ? $input['payer'] : null,
    'back_urls' => [
        'success' => 'https://correagrieco.com/?pago=ok',
        'failure' => 'https://correagrieco.com/?pago=error',
        'pending' => 'https://correagrieco.com/?pago=pendiente',
    ],
    'auto_return' => 'approved',
    'statement_descriptor' => 'CORREA GRIECO',
    'external_reference' => isset($input['external_reference'])
        ? $input['external_reference']
        : ('CG-' . time()),
    'notification_url' => 'https://correagrieco.com/',
];

// Llamar a la API de Mercado Pago desde el servidor
$ch = curl_init('https://api.mercadopago.com/checkout/preferences');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $ACCESS_TOKEN,
    ],
    CURLOPT_POSTFIELDS     => json_encode($preference),
    CURLOPT_TIMEOUT        => 20,
]);

$response = curl_exec($ch);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión con Mercado Pago']);
    curl_close($ch);
    exit;
}

$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$data = json_decode($response, true);

/* Envía los mails del pedido desde la casilla del dominio (info@correagrieco.com) */
function enviarMailPedido($order) {
    if (empty($order) || empty($order['email'])) return;

    $owner = 'info@correagrieco.com';
    $from  = 'Correa Grieco <info@correagrieco.com>';

    $money = function ($n) { return '$' . number_format((float)$n, 0, ',', '.'); };
    $nombre  = htmlspecialchars($order['nombre']  ?? '', ENT_QUOTES, 'UTF-8');
    $email   = filter_var($order['email'] ?? '', FILTER_SANITIZE_EMAIL);
    $tel     = htmlspecialchars($order['tel']     ?? '', ENT_QUOTES, 'UTF-8');
    $dir     = htmlspecialchars($order['dir']     ?? '', ENT_QUOTES, 'UTF-8');
    $cp      = htmlspecialchars($order['cp']      ?? '', ENT_QUOTES, 'UTF-8');
    $ciudad  = htmlspecialchars($order['ciudad']  ?? '', ENT_QUOTES, 'UTF-8');
    $resumen = htmlspecialchars($order['resumen'] ?? '', ENT_QUOTES, 'UTF-8');
    $transp  = htmlspecialchars($order['transporte'] ?? '', ENT_QUOTES, 'UTF-8');
    if (!$email) return;

    $subtotal = $money($order['subtotal'] ?? 0);
    $iva      = $money($order['iva'] ?? 0);
    $envio    = !empty($order['envio']) ? $money($order['envio']) : 'A coordinar';
    $total    = $money($order['total'] ?? 0);
    $destino  = $dir . ', CP ' . $cp . ($ciudad ? ', ' . $ciudad : '');

    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: $from\r\n";

    // Mail para el comprador
    $bodyCliente = "<div style='font-family:Arial,sans-serif;color:#222;line-height:1.6'>
        <h2 style='color:#7a2535'>¡Gracias por tu pedido, $nombre!</h2>
        <p>Recibimos tu pedido en <strong>Correa Grieco</strong>. Este es el detalle:</p>
        <p><strong>Productos:</strong> $resumen</p>
        <p>Subtotal (sin IVA): $subtotal<br>
           IVA (21%): $iva<br>
           Envío ($transp): $envio<br>
           <strong>Total: $total</strong></p>
        <p><strong>Envío a:</strong> $destino<br>Teléfono: $tel</p>
        <p>Te vamos a contactar para coordinar el envío. ¡Gracias por elegirnos!</p>
        <p style='color:#888;font-size:12px'>Correa Grieco — Bodega familiar de Mendoza</p>
    </div>";

    // Mail para la bodega
    $bodyOwner = "<div style='font-family:Arial,sans-serif;color:#222;line-height:1.6'>
        <h2 style='color:#7a2535'>🍷 Nuevo pedido en la tienda</h2>
        <p><strong>Cliente:</strong> $nombre<br>
           <strong>Email:</strong> $email<br>
           <strong>Teléfono:</strong> $tel</p>
        <p><strong>Productos:</strong> $resumen</p>
        <p>Subtotal: $subtotal · IVA: $iva · Envío ($transp): $envio<br>
           <strong>Total: $total</strong></p>
        <p><strong>Dirección de envío:</strong> $destino</p>
    </div>";

    @mail($email, 'Tu pedido en Correa Grieco', $bodyCliente, $headers);
    @mail($owner, "Nuevo pedido de $nombre", $bodyOwner, $headers . "Reply-To: $email\r\n");
}

if ($httpCode >= 200 && $httpCode < 300 && !empty($data['init_point'])) {
    // Enviar los mails del pedido (comprador + bodega)
    if (!empty($input['order'])) {
        enviarMailPedido($input['order']);
    }
    // Solo devolvemos lo necesario al navegador
    echo json_encode([
        'init_point' => $data['init_point'],
        'id'         => isset($data['id']) ? $data['id'] : null,
    ]);
} else {
    http_response_code(502);
    echo json_encode([
        'error'   => 'No se pudo crear la preferencia de pago',
        'detalle' => isset($data['message']) ? $data['message'] : null,
    ]);
}
