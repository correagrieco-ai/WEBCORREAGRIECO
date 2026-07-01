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

if ($httpCode >= 200 && $httpCode < 300 && !empty($data['init_point'])) {
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
