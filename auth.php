<?php
session_start();
header('Content-Type: application/json');

$usersFile = 'users.json';

// Load existing users or initialize empty array
if (file_exists($usersFile)) {
    $users = json_decode(file_get_contents($usersFile), true);
    if (!is_array($users)) {
        $users = [];
    }
} else {
    $users = [];
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

$action = $_GET['action'] ?? '';

if ($action === 'register') {
    // Register user
    $username = trim($input['username'] ?? '');
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';

    if (!$username || !$email || !$password) {
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        exit;
    }

    // Check if email or username already exists
    foreach ($users as $user) {
        if ($user['email'] === $email) {
            echo json_encode(['success' => false, 'message' => 'Email already registered']);
            exit;
        }
        if ($user['username'] === $username) {
            echo json_encode(['success' => false, 'message' => 'Username already taken']);
            exit;
        }
    }

    // Hash password
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    // Save new user
    $users[] = [
        'username' => $username,
        'email' => $email,
        'password' => $passwordHash,
    ];

    file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));

    echo json_encode(['success' => true, 'message' => 'Registration successful']);
    exit;

} elseif ($action === 'login') {
    // Login user
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';

    if (!$email || !$password) {
        echo json_encode(['success' => false, 'message' => 'Email and password required']);
        exit;
    }

    // Find user by email
    $foundUser = null;
    foreach ($users as $user) {
        if ($user['email'] === $email) {
            $foundUser = $user;
            break;
        }
    }

    if (!$foundUser) {
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }

    // Verify password
    if (!password_verify($password, $foundUser['password'])) {
        echo json_encode(['success' => false, 'message' => 'Incorrect password']);
        exit;
    }

    // Successful login - create session
    $_SESSION['user'] = [
        'username' => $foundUser['username'],
        'email' => $foundUser['email']
    ];

    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'token' => session_id()
    ]);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid endpoint']);
