<?php
declare(strict_types=1);
require __DIR__ . '/_auth.php';

if (!is_admin()) { json_out(['error' => 'Please sign in again.'], 401); }

$action = $_GET['action'] ?? '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!hash_equals($_SESSION['csrf'], (string)($_SERVER['HTTP_X_CSRF'] ?? ''))) {
        json_out(['error' => 'Session expired. Refresh the page.'], 403);
    }
}

$body = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action !== 'upload') {
    $body = json_decode((string)file_get_contents('php://input'), true);
    if (!is_array($body)) { $body = []; }
}

/** Find an item by id; returns [sectionIndex, itemIndex] or null. */
function find_item(array $m, string $id): ?array {
    foreach ($m['sections'] as $si => $s) {
        foreach ($s['items'] as $ii => $it) { if (($it['id'] ?? '') === $id) { return [$si, $ii]; } }
    }
    return null;
}

switch ($action) {
    case 'list':
        json_out(load_menu());

    case 'save': // add or update one product
        $in = $body['item'] ?? [];
        $sec = (string)($body['section'] ?? '');
        if (!in_array($sec, MENU_SECTIONS, true)) { json_out(['error' => 'Choose a category.'], 422); }
        $name = clean_text($in['name'] ?? '', 120);
        if ($name === '') { json_out(['error' => 'Product name is required.'], 422); }
        $price = clean_price($in['price'] ?? '');
        if ($price === null) { json_out(['error' => 'Enter a valid price, e.g. 2.300'], 422); }
        $image = clean_text($in['image'] ?? '', 200);
        if ($image !== '' && !preg_match('#^/(img|uploads)/[A-Za-z0-9._/-]+$#', $image)) { $image = ''; }
        $item = [
            'id' => clean_text($in['id'] ?? '', 40),
            'name' => $name,
            'name_ar' => clean_text($in['name_ar'] ?? '', 120),
            'price' => $price,
            'ing_en' => clean_text($in['ing_en'] ?? '', 500),
            'ing_ar' => clean_text($in['ing_ar'] ?? '', 500),
            'image' => $image,
            'hidden' => !empty($in['hidden']),
        ];
        $out = with_lock(function () use ($item, $sec) {
            $m = load_menu();
            $at = $item['id'] !== '' ? find_item($m, $item['id']) : null;
            if ($at) {
                [$si, $ii] = $at;
                if ($m['sections'][$si]['id'] === $sec) {
                    $m['sections'][$si]['items'][$ii] = $item;
                } else { // moved to another category
                    array_splice($m['sections'][$si]['items'], $ii, 1);
                    foreach ($m['sections'] as &$s) { if ($s['id'] === $sec) { $s['items'][] = $item; } }
                    unset($s);
                }
            } else {
                $item['id'] = new_id();
                foreach ($m['sections'] as &$s) { if ($s['id'] === $sec) { $s['items'][] = $item; } }
                unset($s);
            }
            save_menu($m);
            return load_menu();
        });
        json_out($out);

    case 'price': // quick price edit
        $price = clean_price($body['price'] ?? '');
        if ($price === null) { json_out(['error' => 'Enter a valid price, e.g. 2.300'], 422); }
        $id = (string)($body['id'] ?? '');
        $out = with_lock(function () use ($id, $price) {
            $m = load_menu();
            if ($at = find_item($m, $id)) { $m['sections'][$at[0]]['items'][$at[1]]['price'] = $price; save_menu($m); }
            return load_menu();
        });
        json_out($out);

    case 'hide': // hide / show on the website
        $id = (string)($body['id'] ?? '');
        $hide = !empty($body['hidden']);
        $out = with_lock(function () use ($id, $hide) {
            $m = load_menu();
            if ($at = find_item($m, $id)) { $m['sections'][$at[0]]['items'][$at[1]]['hidden'] = $hide; save_menu($m); }
            return load_menu();
        });
        json_out($out);

    case 'delete':
        $id = (string)($body['id'] ?? '');
        $out = with_lock(function () use ($id) {
            $m = load_menu();
            if ($at = find_item($m, $id)) {
                $img = (string)($m['sections'][$at[0]]['items'][$at[1]]['image'] ?? '');
                array_splice($m['sections'][$at[0]]['items'], $at[1], 1);
                save_menu($m);
                if (strpos($img, '/uploads/menu/') === 0) { @unlink(root_dir() . $img); } // only our own uploads
            }
            return load_menu();
        });
        json_out($out);

    case 'move': // order within a category
        $id = (string)($body['id'] ?? '');
        $dir = ($body['dir'] ?? '') === 'up' ? -1 : 1;
        $out = with_lock(function () use ($id, $dir) {
            $m = load_menu();
            if ($at = find_item($m, $id)) {
                [$si, $ii] = $at;
                $j = $ii + $dir;
                $items = &$m['sections'][$si]['items'];
                if ($j >= 0 && $j < count($items)) { [$items[$ii], $items[$j]] = [$items[$j], $items[$ii]]; save_menu($m); }
                unset($items);
            }
            return load_menu();
        });
        json_out($out);

    case 'upload':
        if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) { json_out(['error' => 'Upload failed. Try a smaller image.'], 422); }
        $f = $_FILES['file'];
        if ($f['size'] > 8 * 1024 * 1024) { json_out(['error' => 'Image is too large (max 8 MB).'], 422); }
        $info = @getimagesize($f['tmp_name']);
        $types = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp'];
        if (!$info || !isset($types[$info[2]])) { json_out(['error' => 'Use a JPG, PNG or WEBP image.'], 422); }
        $dir = upload_dir();
        $name = 'item-' . bin2hex(random_bytes(6));
        $done = false;
        if (function_exists('imagecreatefromstring') && function_exists('imagejpeg')) {
            $img = @imagecreatefromstring((string)file_get_contents($f['tmp_name']));
            if ($img) {
                $w = imagesx($img); $h = imagesy($img);
                $max = 900;
                if (max($w, $h) > $max) {
                    $r = $max / max($w, $h);
                    $nw = (int)round($w * $r); $nh = (int)round($h * $r);
                    $res = imagecreatetruecolor($nw, $nh);
                    imagecopyresampled($res, $img, 0, 0, 0, 0, $nw, $nh, $w, $h);
                    imagedestroy($img); $img = $res;
                } else {
                    $res = imagecreatetruecolor($w, $h);
                    imagecopy($res, $img, 0, 0, 0, 0, $w, $h);
                    imagedestroy($img); $img = $res;
                }
                $bg = imagecreatetruecolor(imagesx($img), imagesy($img)); // flatten transparency on white
                imagefill($bg, 0, 0, imagecolorallocate($bg, 255, 255, 255));
                imagecopy($bg, $img, 0, 0, 0, 0, imagesx($img), imagesy($img));
                $ext = 'jpg';
                $done = imagejpeg($bg, "$dir/$name.$ext", 86);
                imagedestroy($img); imagedestroy($bg);
            }
        }
        if (!$done) {
            $ext = $types[$info[2]];
            $done = move_uploaded_file($f['tmp_name'], "$dir/$name.$ext");
        }
        if (!$done) { json_out(['error' => 'Could not save the image.'], 500); }
        json_out(['path' => "/uploads/menu/$name.$ext"]);

    case 'password':
        $cur = (string)($body['current'] ?? '');
        $new = (string)($body['new'] ?? '');
        if (!password_verify($cur, admin_hash())) { json_out(['error' => 'Current password is wrong.'], 422); }
        if (strlen($new) < 10) { json_out(['error' => 'New password must be at least 10 characters.'], 422); }
        admin_set_password($new);
        json_out(['ok' => true]);

    default:
        json_out(['error' => 'Unknown action'], 400);
}
