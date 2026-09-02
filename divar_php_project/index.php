<?php
require __DIR__ . '/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

// گرفتن کلمات کلیدی و شهر از فرم
$keyword = $_POST['keyword'] ?? '';
$city_id = $_POST['city_id'] ?? '1'; // پیش‌فرض تهران

if (!$keyword) {
    die("کلمه کلیدی وارد نشده");
}

// ارسال درخواست به دیوار
$url = "https://api.divar.ir/v8/postlist/web/search";
$payload = json_encode([
    "city_ids" => [$city_id],
    "source_view" => "SEARCH",
    "search_data" => ["query" => $keyword]
]);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
$widgets = $data['list_widgets'] ?? [];

// ساخت فایل اکسل
$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();
$sheet->setCellValue('A1', 'عنوان');
$sheet->setCellValue('B1', 'منطقه');
$sheet->setCellValue('C1', 'شهر');
$sheet->setCellValue('D1', 'قیمت');
$sheet->setCellValue('E1', 'لینک');

$row = 2;
foreach ($widgets as $widget) {
    if ($widget['widget_type'] !== 'POST_ROW') continue;
    $d = $widget['data'];
    $title = $d['title'] ?? '';
    $price = $d['middle_description_text'] ?? '';
    $token = $d['token'] ?? '';
    $web_info = $d['action']['payload']['web_info'] ?? [];
    $district = $web_info['district_persian'] ?? '';
    $city = $web_info['city_persian'] ?? '';
    $slug = rawurlencode(str_replace(' ', '-', $title));
    $url = "https://divar.ir/v/$slug/$token";

    $sheet->setCellValue("A$row", $title);
    $sheet->setCellValue("B$row", $district);
    $sheet->setCellValue("C$row", $city);
    $sheet->setCellValue("D$row", $price);
    $sheet->setCellValue("E$row", $url);
    $row++;
}

$writer = new Xlsx($spreadsheet);
$writer->save("divar_data.xlsx");
echo "✅ فایل divar_data.xlsx با موفقیت ایجاد شد.";
?>
