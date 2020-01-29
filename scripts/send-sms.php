<?php
// Account details
$apiKey = urlencode('qKH5qA7FkRE-uobioVjbnMlWvDMZjBKsue5GZ0y0VO');
$json = file_get_contents('./convokeList.json');
$json_data = json_decode($json, true);
$numbers = [];
foreach ($json_data as $value) {
    $number = $value['contact'];
    if (trim($number) == "") {
        continue;
    }
    array_push($numbers, "91"+$number);
    echo "\n";
}
array_push($numbers, "919789096037");
// print_r($json_data);
// // Message details
// $numbers = array(918123456789, 918987654321);
$sender = urlencode('TXTLCL');
// ARCS'19 : Convoke
// Venue : Homi bhabha (SJT 4th floor)
// Time : 2:00 pm
// If not present ODs will not be given.
$message = rawurlencode("Dear participant, please report to Homi Bhabha Gallery(SJT 4th floor) at 2:00 pm for Convoke'19. Your kits(Tshirts, goodies) will be provided there.");

$numbers = implode(',', $numbers);

// Prepare data for POST request
$data = array('apikey' => $apiKey, 'numbers' => $numbers, "sender" => $sender, "message" => $message);

// Send the POST request with cURL
$ch = curl_init('https://api.textlocal.in/send/');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

// Process your response here
echo $response;
