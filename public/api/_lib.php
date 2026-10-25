<?php
declare(strict_types=1);

/* Shared helpers for the GRIP menu backend (flat JSON file storage, no database needed). */

const MENU_SECTIONS = ['new', 'beef', 'chicken', 'sides', 'sweet', 'drinks'];

function root_dir(): string { return dirname(__DIR__); }

/** Private storage folder (created on first use, blocked from the web by .htaccess). */
function data_dir(): string {
    $d = root_dir() . '/data';
    if (!is_dir($d)) { @mkdir($d, 0755, true); }
    $h = $d . '/.htaccess';
    if (!is_file($h)) {
        @file_put_contents($h, "Require all denied\n<IfModule !mod_authz_core.c>\nDeny from all\n</IfModule>\n");
    }
    return $d;
}

function upload_dir(): string {
    $d = root_dir() . '/uploads/menu';
    if (!is_dir($d)) { @mkdir($d, 0755, true); }
    $h = root_dir() . '/uploads/.htaccess';
    if (!is_file($h)) {
        @file_put_contents($h, "<FilesMatch \"\\.(php|phtml|phar|pl|py|cgi)$\">\nRequire all denied\n</FilesMatch>\nOptions -ExecCGI -Indexes\n");
    }
    return $d;
}

/** Run $fn while holding an exclusive lock so two edits can't overwrite each other. */
function with_lock(callable $fn) {
    $lock = fopen(data_dir() . '/.lock', 'c');
    flock($lock, LOCK_EX);
    try { return $fn(); } finally { flock($lock, LOCK_UN); fclose($lock); }
}

function normalize_menu(array $m): array {
    $by = [];
    foreach (($m['sections'] ?? []) as $s) {
        if (isset($s['id'])) { $by[$s['id']] = is_array($s['items'] ?? null) ? array_values($s['items']) : []; }
    }
    $out = [];
    foreach (MENU_SECTIONS as $id) { $out[] = ['id' => $id, 'items' => $by[$id] ?? []]; }
    return ['version' => 1, 'updated' => (int)($m['updated'] ?? time()), 'sections' => $out];
}

function load_menu(): array {
    $f = data_dir() . '/menu.json';
    if (!is_file($f)) {
        $seed = __DIR__ . '/menu.seed.json';
        $m = is_file($seed) ? json_decode((string)file_get_contents($seed), true) : null;
        $m = normalize_menu(is_array($m) ? $m : []);
        save_menu($m);
        return $m;
    }
    $m = json_decode((string)file_get_contents($f), true);
    return normalize_menu(is_array($m) ? $m : []);
}

function save_menu(array $m): void {
    $f = data_dir() . '/menu.json';
    $m['updated'] = time();
    if (is_file($f)) { @copy($f, $f . '.bak'); }
    $tmp = $f . '.tmp';
    file_put_contents($tmp, json_encode($m, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT), LOCK_EX);
    rename($tmp, $f);
}

function clean_price($v): ?string {
    $v = trim(str_replace(',', '.', (string)$v));
    if ($v === '' || !is_numeric($v)) { return null; }
    $n = (float)$v;
    if ($n < 0 || $n > 9999) { return null; }
    return number_format($n, 3, '.', '');
}

function clean_text($v, int $max = 400): string {
    $v = trim((string)$v);
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $v) ?? '';
    return mb_substr($v, 0, $max);
}

function new_id(): string { return 'i' . bin2hex(random_bytes(5)); }

function json_out($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
