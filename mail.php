<?php

// Validate the submit data
if (empty($_POST['email']) || empty($_POST['message'])) {
    http_response_code(400);
    exit;
}

$email = $_POST['email'];
$message = $_POST['message'];

// Email validation
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    exit;
}

// Message validation
if (mb_strlen($message) < 20) {
    http_response_code(400);
    exit;
}

// Try to send the email
$to = "";  // The email to which the message will arrive
$subject = "Contact from the spinwheel";  // The email subject
$mail = "Email: $email\nMessage: $message";

$send = mail($to, $subject, $mail);

if (!$send) {
    http_response_code(400);
    exit;
}

http_response_code(200);