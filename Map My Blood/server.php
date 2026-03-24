<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$host = 'sql100.infinityfree.com';
$db_user = 'if0_40991164';
$db_pass = '1Ik6dViwia3PFbY';
$db_name = 'if0_40991164_bloodbank4';

$conn = new mysqli($host, $db_user, $db_pass, $db_name);
if ($conn->connect_error) {
    echo json_encode(['message' => 'Database connection failed.']);
    exit(1);
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

function generateJWT($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload_enc = json_encode($payload);
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload_enc));
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, 'my_super_secret_blood_app_key_2026', true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

$json_input = file_get_contents('php://input');
$body = json_decode($json_input, true);

switch ($action) {
    case 'register-user':
        $user_name = $body['user_name'] ?? '';
        $email = $body['email'] ?? '';
        $phone = $body['phone'] ?? '';
        $pass_word = $body['pass_word'] ?? '';

        $stmt = $conn->prepare("SELECT email FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($res->num_rows > 0) {
            http_response_code(400);
            echo json_encode(['message' => 'A user with this email already exists!']);
            break;
        }

        $hashedPassword = password_hash($pass_word, PASSWORD_BCRYPT);
        $stmt = $conn->prepare("INSERT INTO users (user_name, email, phone, pass_word) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $user_name, $email, $phone, $hashedPassword);
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(['message' => 'User registered successfully.']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to save user to database.']);
        }
        break;

    case 'register-emergency-user':
        $user_name = $body['user_name'] ?? '';
        $phone     = $body['phone']     ?? '';
        $aadhar    = $body['aadhar']    ?? '';

        if (!$user_name || !$phone || !$aadhar) {
            http_response_code(400);
            echo json_encode(['message' => 'Name, phone, and Aadhar are required.']);
            break;
        }

        $clean_phone  = preg_replace('/\D/', '', $phone);
        $clean_aadhar = preg_replace('/\D/', '', $aadhar);
        $auto_email = 'emergency_' . $clean_phone . '_' . $clean_aadhar . '@mapmyblood.emergency';

        $stmt = $conn->prepare("SELECT id FROM users WHERE phone = ? OR email = ?");
        $stmt->bind_param("ss", $phone, $auto_email);
        $stmt->execute();
        $res = $stmt->get_result();

        if ($res->num_rows > 0) {
            http_response_code(200);
            echo json_encode(['message' => 'User already exists.', 'already_registered' => true]);
            break;
        }

        $hashedPassword = password_hash($aadhar, PASSWORD_BCRYPT);

        $stmt = $conn->prepare("INSERT INTO users (user_name, email, phone, pass_word) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $user_name, $auto_email, $phone, $hashedPassword);
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(['message' => 'Emergency user registered successfully.']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to register emergency user.']);
        }
        break;

    case 'login-user':
        $email = $body['email'] ?? '';
        $password = $body['password'] ?? '';

        $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($res->num_rows == 0) {
            http_response_code(401);
            echo json_encode(['message' => 'Invalid email or password.']);
            break;
        }

        $user = $res->fetch_assoc();
        if (password_verify($password, $user['pass_word'])) {
            $token = generateJWT(['id' => $user['id'], 'email' => $user['email']]);
            http_response_code(200);
            echo json_encode([
                'message' => 'Login successful!',
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'user_name' => $user['user_name'],
                    'email' => $user['email'],
                    'phone' => $user['phone']
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['message' => 'Invalid email or password.']);
        }
        break;

    case 'update-user-profile':
        $email = $body['email'] ?? '';
        $user_name = $body['user_name'] ?? '';
        $phone = $body['phone'] ?? '';

        if (!$email || !$user_name || !$phone) {
            http_response_code(400);
            echo json_encode(['message' => 'All fields are required.']);
            break;
        }

        $stmt = $conn->prepare("UPDATE users SET user_name = ?, phone = ? WHERE email = ?");
        $stmt->bind_param("sss", $user_name, $phone, $email);
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(['message' => 'Profile updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to update user profile.']);
        }
        break;

    case 'register-bloodbank':
        $regNo = $body['REG_NO'] ?? '';
        $org_name = $body['org_name'] ?? '';
        $email = $body['email'] ?? '';
        $phone = $body['phone'] ?? '';
        $pass_word = $body['pass_word'] ?? '';
        $lat = $body['Latitude'] ?? 0;
        $lng = $body['Longitude'] ?? 0;
        $landmark = $body['landmark'] ?? '';
        $state = $body['state'] ?? '';
        $address = $body['address'] ?? '';
        $city = $body['city'] ?? '';
        $pincode = $body['pincode'] ?? '';

        $stmt = $conn->prepare("SELECT REG_NO FROM bloodbank WHERE REG_NO = ?");
        $stmt->bind_param("i", $regNo);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($res->num_rows > 0) {
            http_response_code(400);
            echo json_encode(['message' => 'A Blood Bank with this Registration Number already exists!']);
            break;
        }

        $hashedPassword = password_hash($pass_word, PASSWORD_BCRYPT);
        $stmt = $conn->prepare("INSERT INTO bloodbank (REG_NO, org_name, email, phone, pass_word, Latitude, Longitude, landmark, state, address, city, pincode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("issssdsssssi", $regNo, $org_name, $email, $phone, $hashedPassword, $lat, $lng, $landmark, $state, $address, $city, $pincode);
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(['message' => 'Blood bank registered successfully.']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to save to database.']);
        }
        break;

    case 'login-bloodbank':
        $regNo = $body['REG_NO'] ?? '';
        $pass_word = $body['pass_word'] ?? '';

        $stmt = $conn->prepare("SELECT * FROM bloodbank WHERE REG_NO = ?");
        $stmt->bind_param("i", $regNo);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($res->num_rows == 0) {
            http_response_code(401);
            echo json_encode(['message' => 'Invalid Registration Number or Password.']);
            break;
        }

        $user = $res->fetch_assoc();
        if (password_verify($pass_word, $user['pass_word'])) {
            http_response_code(200);
            echo json_encode(['message' => 'Login successful!']);
        } else {
            http_response_code(401);
            echo json_encode(['message' => 'Invalid Registration Number or Password.']);
        }
        break;

    case 'bloodbank-profile':
        $regNo = $_GET['regNo'] ?? '';
        $stmt = $conn->prepare("SELECT org_name, email, phone, address, REG_NO FROM bloodbank WHERE REG_NO = ?");
        $stmt->bind_param("i", $regNo);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($res->num_rows == 0) {
            http_response_code(404);
            echo json_encode(['message' => 'Blood bank not found.']);
        } else {
            http_response_code(200);
            echo json_encode($res->fetch_assoc());
        }
        break;

    case 'update-bloodbank-profile':
        $regNo   = $body['regNo']    ?? '';
        $org_name = $body['org_name'] ?? '';
        $email   = $body['email']    ?? '';
        $phone   = $body['phone']    ?? '';
        $address = $body['address']  ?? '';

        if (!$regNo || !$org_name || !$email || !$phone) {
            http_response_code(400);
            echo json_encode(['message' => 'Required fields missing.']);
            break;
        }

        $stmt = $conn->prepare("UPDATE bloodbank SET org_name=?, email=?, phone=?, address=? WHERE REG_NO=?");
        $stmt->bind_param("ssssi", $org_name, $email, $phone, $address, $regNo);
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(['message' => 'Profile updated successfully.']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to update profile.']);
        }
        break;

    case 'inventory':
        $regNo = $_GET['regNo'] ?? '';
        $stmt = $conn->prepare("SELECT blood_group_name, quantity FROM inventory WHERE center_id = ?");
        $stmt->bind_param("i", $regNo);
        $stmt->execute();
        $res = $stmt->get_result();
        $data = [];
        while ($row = $res->fetch_assoc()) {
            $data[] = $row;
        }
        http_response_code(200);
        echo json_encode($data);
        break;

    case 'inventory-update':
        $regNo = $body['regNo'] ?? '';
        $bloodType = $body['bloodType'] ?? '';
        $units = $body['units'] ?? 0;
        $act = $body['action'] ?? '';

        $stmt = $conn->prepare("SELECT quantity FROM inventory WHERE center_id = ? AND blood_group_name = ?");
        $stmt->bind_param("is", $regNo, $bloodType);
        $stmt->execute();
        $res = $stmt->get_result();
        
        $currentQuantity = 0;
        $isExistingRow = false;

        if ($res->num_rows > 0) {
            $row = $res->fetch_assoc();
            $currentQuantity = $row['quantity'];
            $isExistingRow = true;
        }

        $newQuantity = ($act === 'add') ? $currentQuantity + $units : $currentQuantity - $units;
        if ($newQuantity < 0) $newQuantity = 0;

        if ($isExistingRow) {
            $stmt = $conn->prepare("UPDATE inventory SET quantity = ? WHERE center_id = ? AND blood_group_name = ?");
            $stmt->bind_param("iis", $newQuantity, $regNo, $bloodType);
        } else {
            $stmt = $conn->prepare("INSERT INTO inventory (quantity, center_id, blood_group_name) VALUES (?, ?, ?)");
            $stmt->bind_param("iis", $newQuantity, $regNo, $bloodType);
        }
        
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(['message' => 'Stock updated successfully', 'newQuantity' => $newQuantity]);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to update stock.']);
        }
        break;

    case 'search-blood':
        $group = $_GET['group'] ?? '';
        if (!$group) {
            http_response_code(400);
            echo json_encode(['message' => 'Blood group is required']);
            break;
        }

        $stmt = $conn->prepare("SELECT b.REG_NO, b.org_name, b.phone, b.address, b.city, b.Latitude, b.Longitude FROM bloodbank b 
        LEFT JOIN inventory i ON b.REG_NO = i.center_id AND i.blood_group_name = ? 
        WHERE i.blood_group_name = ? OR (SELECT COUNT(*) FROM inventory WHERE center_id = b.REG_NO) = 0");
        $stmt->bind_param("ss", $group, $group);
        $stmt->execute();
        $res = $stmt->get_result();
        $data = [];
        while ($row = $res->fetch_assoc()) {
            $data[] = $row;
        }
        http_response_code(200);
        echo json_encode($data);
        break;

    case 'check-emergency-usage':
        $phone = $body['phone'] ?? '';
        if (!$phone) {
            http_response_code(400);
            echo json_encode(['message' => 'Phone number is required.']);
            break;
        }
        $stmtUsage = $conn->prepare("SELECT COUNT(*) as usage_count FROM requests WHERE contact_no = ? AND DATE(request_TIME) = CURDATE()");
        $stmtUsage->bind_param("s", $phone);
        $stmtUsage->execute();
        $resUsage = $stmtUsage->get_result();
        $rowUsage = $resUsage->fetch_assoc();
        $usageCount = (int)$rowUsage['usage_count'];
        http_response_code(200);
        echo json_encode([
            'count'         => $usageCount,
            'limit'         => 2,
            'limit_reached' => $usageCount >= 2
        ]);
        break;

    case 'request-blood':
        $patient = $body['patient'] ?? '';
        $req_blood_group = $body['req_blood_group'] ?? '';
        $contact_no = $body['contact_no'] ?? '';
        $identity_nu = $body['identity_nu'] ?? '';
        $bb_REG_NO = $body['bb_REG_NO'] ?? '';

        if (!$patient || !$req_blood_group || !$contact_no || !$identity_nu || !$bb_REG_NO) {
            http_response_code(400);
            echo json_encode(['message' => 'All fields are required.']);
            break;
        }

        $stmtCheck = $conn->prepare("SELECT COUNT(*) as req_count FROM requests WHERE contact_no = ? AND DATE(request_TIME) = CURDATE()");
        $stmtCheck->bind_param("s", $contact_no);
        $stmtCheck->execute();
        $resCheck = $stmtCheck->get_result();
        $rowCheck = $resCheck->fetch_assoc();
        
        if ($rowCheck['req_count'] >= 3) {
            http_response_code(403);
            echo json_encode(['message' => 'This phone number has reached the maximum limit of 3 blood requests per day.']);
            break;
        }

        $stmt = $conn->prepare("INSERT INTO requests (patient, req_blood_group, contact_no, identity_nu, bb_REG_NO) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssi", $patient, $req_blood_group, $contact_no, $identity_nu, $bb_REG_NO);
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(['message' => 'Blood request submitted successfully!']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Database error while saving request.']);
        }
        break;

    case 'bloodbank-requests':
        $regNo = $_GET['regNo'] ?? '';
        $stmt = $conn->prepare("SELECT patient, identity_nu, req_blood_group, contact_no, request_TIME FROM requests WHERE bb_REG_NO = ? ORDER BY request_TIME DESC");
        $stmt->bind_param("i", $regNo);
        $stmt->execute();
        $res = $stmt->get_result();
        $data = [];
        while ($row = $res->fetch_assoc()) {
            $data[] = $row;
        }
        http_response_code(200);
        echo json_encode($data);
        break;

    default:
        http_response_code(404);
        echo json_encode(['message' => 'Endpoint not found.']);
        break;
}
$conn->close();
?>
