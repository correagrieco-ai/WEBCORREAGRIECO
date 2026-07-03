<?php
/* ============================================================
   contacto.php — Envía las consultas del formulario "Hablemos
   de vino" directo a info@correagrieco.com (sin abrir el mail
   del visitante). Se ejecuta en el servidor (DonWeb).
   ============================================================ */

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$nombre  = trim($input['nombre']  ?? '');
$email   = trim($input['email']   ?? '');
$mensaje = trim($input['mensaje'] ?? '');

if ($nombre === '' || $email === '' || $mensaje === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Datos incompletos o email inválido']);
    exit;
}

$owner = 'info@correagrieco.com';
$from  = 'Correa Grieco <info@correagrieco.com>';

$safeNombre  = htmlspecialchars($nombre, ENT_QUOTES, 'UTF-8');
$safeEmail   = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$safeMensaje = nl2br(htmlspecialchars($mensaje, ENT_QUOTES, 'UTF-8'));

$body = "<div style='font-family:Arial,sans-serif;color:#222;line-height:1.6'>
    <h2 style='color:#7a2535'>Nueva consulta desde el sitio web</h2>
    <p><strong>Nombre:</strong> $safeNombre<br>
       <strong>Email:</strong> $safeEmail</p>
    <p><strong>Mensaje:</strong><br>$safeMensaje</p>
</div>";

$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: $from\r\n";
$headers .= "Reply-To: $safeNombre <$email>\r\n";

$ok = @mail($owner, "Consulta desde el sitio web - $safeNombre", $body, $headers);

echo json_encode(['ok' => (bool)$ok]);
