<?php
declare(strict_types=1);
require __DIR__ . '/_lib.php';

/* Public menu feed used by the website: visible products only. */
$m = load_menu();
$sections = [];
foreach ($m['sections'] as $s) {
    $items = [];
    foreach ($s['items'] as $it) {
        if (!empty($it['hidden'])) { continue; }
        $items[] = [
            'id' => (string)($it['id'] ?? ''),
            'name' => (string)($it['name'] ?? ''),
            'name_ar' => (string)($it['name_ar'] ?? ''),
            'price' => (string)($it['price'] ?? ''),
            'ing_en' => (string)($it['ing_en'] ?? ''),
            'ing_ar' => (string)($it['ing_ar'] ?? ''),
            'image' => (string)($it['image'] ?? ''),
        ];
    }
    $sections[] = ['id' => $s['id'], 'items' => $items];
}

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');
echo json_encode(['updated' => $m['updated'], 'sections' => $sections], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
