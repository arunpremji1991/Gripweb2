<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/api/_lib.php';

header('X-Robots-Tag: noindex, nofollow');
header('X-Frame-Options: DENY');
header('Referrer-Policy: same-origin');

$https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
session_name('grip_admin');
session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'secure' => $https, 'httponly' => true, 'samesite' => 'Lax']);
session_start();
if (empty($_SESSION['csrf'])) { $_SESSION['csrf'] = bin2hex(random_bytes(16)); }

function admin_file(): string { return data_dir() . '/admin.json'; }
function admin_exists(): bool { return is_file(admin_file()); }
function admin_hash(): string {
    $a = json_decode((string)@file_get_contents(admin_file()), true);
    return is_array($a) ? (string)($a['hash'] ?? '') : '';
}
function admin_set_password(string $pw): void {
    file_put_contents(admin_file(), json_encode(['hash' => password_hash($pw, PASSWORD_DEFAULT), 'changed' => time()]), LOCK_EX);
}
function is_admin(): bool { return !empty($_SESSION['ok']); }

/* Simple brute-force guard: 6 failures per IP -> 15 minute lockout */
function throttle_file(): string { return data_dir() . '/login-attempts.json'; }
function throttle_state(): array {
    $all = json_decode((string)@file_get_contents(throttle_file()), true);
    $all = is_array($all) ? $all : [];
    $ip = $_SERVER['REMOTE_ADDR'] ?? '?';
    $now = time();
    $rec = $all[$ip] ?? ['n' => 0, 't' => $now];
    if ($now - (int)$rec['t'] > 900) { $rec = ['n' => 0, 't' => $now]; }
    return [$all, $ip, $rec];
}
function login_locked(): bool { [, , $rec] = throttle_state(); return (int)$rec['n'] >= 6; }
function login_fail(): void {
    [$all, $ip, $rec] = throttle_state();
    $rec['n'] = (int)$rec['n'] + 1;
    $all[$ip] = $rec;
    @file_put_contents(throttle_file(), json_encode($all), LOCK_EX);
    usleep(600000);
}
function login_ok(): void {
    [$all, $ip] = throttle_state();
    unset($all[$ip]);
    @file_put_contents(throttle_file(), json_encode($all), LOCK_EX);
}
