<?php
declare(strict_types=1);
require __DIR__ . '/_auth.php';

$err = '';

if (isset($_GET['logout'])) {
    $_SESSION = [];
    session_destroy();
    header('Location: /admin/');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !is_admin()) {
    if (!hash_equals($_SESSION['csrf'], (string)($_POST['csrf'] ?? ''))) {
        $err = 'Session expired. Please try again.';
    } elseif (!admin_exists()) {
        // first run: the very first visitor chooses the password
        $pw = (string)($_POST['password'] ?? '');
        if (strlen($pw) < 10) { $err = 'Use at least 10 characters.'; }
        elseif ($pw !== (string)($_POST['password2'] ?? '')) { $err = 'The two passwords do not match.'; }
        else {
            admin_set_password($pw);
            session_regenerate_id(true);
            $_SESSION['ok'] = true;
            header('Location: /admin/');
            exit;
        }
    } elseif (login_locked()) {
        $err = 'Too many attempts. Please wait 15 minutes.';
    } elseif (password_verify((string)($_POST['password'] ?? ''), admin_hash())) {
        login_ok();
        session_regenerate_id(true);
        $_SESSION['ok'] = true;
        header('Location: /admin/');
        exit;
    } else {
        login_fail();
        $err = 'Wrong password.';
    }
}

$csrf = $_SESSION['csrf'];
$first = !admin_exists();
?><!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>GRIP · Menu manager</title>
<style>
:root { --orange:#F04E24; --cream:#FFF3EA; --ink:#1A0B06; --line:#E8D6C8; --ok:#1f8a4c; --bad:#c0392b; }
* { box-sizing: border-box; }
body { margin:0; font:16px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; background:var(--cream); color:var(--ink); }
button, input, select, textarea { font:inherit; }
.top { background:var(--orange); color:#fff; padding:14px 20px; display:flex; align-items:center; gap:14px; position:sticky; top:0; z-index:5; }
.top h1 { font-size:20px; margin:0; flex:1; letter-spacing:.02em; }
.top a, .top button { color:#fff; background:rgba(255,255,255,.18); border:0; padding:8px 14px; border-radius:999px; text-decoration:none; cursor:pointer; font-size:14px; }
.wrap { max-width:980px; margin:0 auto; padding:20px; }
.card { background:#fff; border:1px solid var(--line); border-radius:16px; padding:22px; }
.login { max-width:420px; margin:12vh auto; }
.login h1 { margin:0 0 6px; color:var(--orange); }
label { display:block; font-size:13px; font-weight:600; margin:12px 0 4px; }
input[type=text], input[type=password], input[type=number], select, textarea { width:100%; padding:11px 12px; border:1px solid var(--line); border-radius:10px; background:#fff; }
textarea { min-height:70px; resize:vertical; }
.btn { background:var(--orange); color:#fff; border:0; padding:11px 18px; border-radius:999px; font-weight:700; cursor:pointer; }
.btn.ghost { background:#fff; color:var(--ink); border:1px solid var(--line); }
.btn.danger { background:var(--bad); }
.btn.sm { padding:7px 12px; font-size:14px; }
.err { background:#fde8e5; color:var(--bad); padding:10px 12px; border-radius:10px; margin:10px 0; }
.sec { margin:26px 0 8px; display:flex; align-items:center; gap:12px; }
.sec h2 { margin:0; font-size:18px; flex:1; }
.row { display:grid; grid-template-columns:56px 1fr auto auto; gap:12px; align-items:center; background:#fff; border:1px solid var(--line); border-radius:14px; padding:10px 12px; margin-bottom:8px; }
.row.is-hidden { opacity:.55; }
.row img { width:56px; height:56px; object-fit:cover; border-radius:10px; background:#f3e6da; }
.nm { font-weight:700; }
.nm small { display:block; font-weight:400; color:#7a6a60; }
.price { display:flex; align-items:center; gap:6px; }
.price input { width:96px; text-align:right; }
.acts { display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end; }
.tag { font-size:12px; background:#eee; border-radius:999px; padding:2px 8px; margin-inline-start:6px; }
.switch { display:inline-flex; align-items:center; gap:6px; font-size:13px; cursor:pointer; user-select:none; }
.switch input { width:18px; height:18px; accent-color:var(--orange); }
dialog { border:0; border-radius:18px; padding:0; width:min(560px, 94vw); box-shadow:0 20px 60px rgba(0,0,0,.35); }
dialog::backdrop { background:rgba(26,11,6,.55); }
dialog form { padding:22px; }
.g2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.imgbox { display:flex; gap:12px; align-items:center; }
.imgbox img { width:84px; height:84px; object-fit:cover; border-radius:12px; background:#f3e6da; }
.foot { display:flex; gap:10px; justify-content:flex-end; margin-top:18px; }
#toast { position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:var(--ink); color:#fff; padding:10px 18px; border-radius:999px; opacity:0; transition:.25s; pointer-events:none; z-index:20; }
#toast.on { opacity:1; } #toast.bad { background:var(--bad); }
.hint { color:#7a6a60; font-size:14px; }
@media (max-width:640px) {
  .row { grid-template-columns:48px 1fr; }
  .row img { width:48px; height:48px; }
  .price, .acts { grid-column:1 / -1; justify-content:space-between; }
  .g2 { grid-template-columns:1fr; }
}
</style>
</head>
<body>
<?php if (!is_admin()): ?>
  <div class="card login">
    <h1>GRIP Menu manager</h1>
    <p class="hint"><?= $first ? 'First time here: choose a strong admin password (10+ characters). Keep it safe.' : 'Sign in to edit products and prices.' ?></p>
    <?php if ($err): ?><div class="err"><?= htmlspecialchars($err) ?></div><?php endif; ?>
    <form method="post" autocomplete="off">
      <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf) ?>">
      <label for="password"><?= $first ? 'New password' : 'Password' ?></label>
      <input type="password" id="password" name="password" required autofocus>
      <?php if ($first): ?>
        <label for="password2">Repeat password</label>
        <input type="password" id="password2" name="password2" required>
      <?php endif; ?>
      <div class="foot"><button class="btn" type="submit"><?= $first ? 'Create password' : 'Sign in' ?></button></div>
    </form>
  </div>
<?php else: ?>
  <div class="top">
    <h1>GRIP · Menu manager</h1>
    <a href="/menu/" target="_blank" rel="noopener">View menu page</a>
    <button type="button" id="pwBtn">Password</button>
    <a href="/admin/?logout=1">Sign out</a>
  </div>
  <div class="wrap">
    <p class="hint">Changes go live on the website straight away. Use <b>Hide</b> to take a product off the menu without deleting it.</p>
    <div id="app"><p>Loading…</p></div>
  </div>

  <dialog id="dlg">
    <form id="form" method="dialog">
      <h2 id="dlgTitle" style="margin:0 0 4px">Product</h2>
      <input type="hidden" id="f_id"><input type="hidden" id="f_image">
      <div class="g2">
        <div><label for="f_name">Name (English)</label><input type="text" id="f_name" maxlength="120" required></div>
        <div><label for="f_name_ar">Name (Arabic, optional)</label><input type="text" id="f_name_ar" dir="rtl" maxlength="120"></div>
      </div>
      <div class="g2">
        <div><label for="f_section">Category</label>
          <select id="f_section">
            <option value="new">New</option><option value="beef">Beef burgers</option><option value="chicken">Chicken burgers</option>
            <option value="sides">Sides</option><option value="sweet">Sweet</option><option value="drinks">Drinks</option>
          </select></div>
        <div><label for="f_price">Price (OMR)</label><input type="text" id="f_price" inputmode="decimal" placeholder="2.300" required></div>
      </div>
      <label for="f_ing_en">Ingredients (English, comma separated)</label>
      <textarea id="f_ing_en" maxlength="500"></textarea>
      <label for="f_ing_ar">Ingredients (Arabic)</label>
      <textarea id="f_ing_ar" dir="rtl" maxlength="500"></textarea>
      <label>Photo</label>
      <div class="imgbox"><img id="f_prev" alt=""><div><input type="file" id="f_file" accept="image/jpeg,image/png,image/webp"><div class="hint">JPG, PNG or WEBP. Square photos look best.</div></div></div>
      <label class="switch" style="margin-top:14px"><input type="checkbox" id="f_hidden"> Hide this product on the website</label>
      <div class="foot">
        <button type="button" class="btn ghost" id="cancel">Cancel</button>
        <button type="submit" class="btn" id="save">Save</button>
      </div>
    </form>
  </dialog>

  <dialog id="pwDlg">
    <form id="pwForm" method="dialog">
      <h2 style="margin:0 0 4px">Change password</h2>
      <label for="p_cur">Current password</label><input type="password" id="p_cur" required>
      <label for="p_new">New password (10+ characters)</label><input type="password" id="p_new" required minlength="10">
      <div class="foot"><button type="button" class="btn ghost" id="pwCancel">Cancel</button><button type="submit" class="btn">Change</button></div>
    </form>
  </dialog>
  <div id="toast" role="status"></div>

<script>
const CSRF = <?= json_encode($csrf) ?>;
const NAMES = { new: 'New', beef: 'Beef burgers', chicken: 'Chicken burgers', sides: 'Sides', sweet: 'Sweet', drinks: 'Drinks' };
const $ = (s) => document.querySelector(s);
let MENU = null;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function toast(msg, bad) { const t = $('#toast'); t.textContent = msg; t.className = 'on' + (bad ? ' bad' : ''); clearTimeout(toast.t); toast.t = setTimeout(() => (t.className = ''), 2600); }

async function api(action, body, raw) {
  const opt = body === undefined ? {} : { method: 'POST', headers: { 'X-CSRF': CSRF, ...(raw ? {} : { 'Content-Type': 'application/json' }) }, body: raw ? body : JSON.stringify(body) };
  const r = await fetch('/admin/action.php?action=' + action, opt);
  let j = {}; try { j = await r.json(); } catch (e) {}
  if (r.status === 401) { location.reload(); throw new Error('signed out'); }
  if (!r.ok) { toast(j.error || 'Something went wrong', true); throw new Error(j.error || r.status); }
  return j;
}

function draw() {
  $('#app').innerHTML = MENU.sections.map((s) => `
    <div class="sec"><h2>${NAMES[s.id]} <span class="tag">${s.items.length}</span></h2><button class="btn sm" data-add="${s.id}">+ Add product</button></div>
    ${s.items.length ? s.items.map((it, i) => `
      <div class="row ${it.hidden ? 'is-hidden' : ''}" data-id="${esc(it.id)}">
        <img src="${esc(it.image || '/brand/badge-grip-round.png')}" alt="" loading="lazy" onerror="this.src='/brand/badge-grip-round.png'">
        <div class="nm">${esc(it.name)}${it.hidden ? '<span class="tag">Hidden</span>' : ''}<small>${esc(it.name_ar)}</small></div>
        <div class="price"><small>OMR</small><input type="text" inputmode="decimal" value="${esc(it.price)}" data-price="${esc(it.id)}" aria-label="Price"></div>
        <div class="acts">
          <button class="btn ghost sm" data-move="up|${esc(it.id)}" ${i === 0 ? 'disabled' : ''} aria-label="Move up">↑</button>
          <button class="btn ghost sm" data-move="down|${esc(it.id)}" ${i === s.items.length - 1 ? 'disabled' : ''} aria-label="Move down">↓</button>
          <button class="btn ghost sm" data-hide="${esc(it.id)}">${it.hidden ? 'Show' : 'Hide'}</button>
          <button class="btn ghost sm" data-edit="${esc(it.id)}">Edit</button>
          <button class="btn danger sm" data-del="${esc(it.id)}">Delete</button>
        </div>
      </div>`).join('') : '<p class="hint">No products here yet.</p>'}
  `).join('');
}

function find(id) { for (const s of MENU.sections) for (const it of s.items) if (it.id === id) return [s.id, it]; return null; }
async function run(p, ok) { try { MENU = await p; draw(); if (ok) toast(ok); } catch (e) { /* toast shown */ } }

document.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.add) return openForm(b.dataset.add);
  if (b.dataset.edit) { const [sec, it] = find(b.dataset.edit); return openForm(sec, it); }
  if (b.dataset.hide) { const [, it] = find(b.dataset.hide); return run(api('hide', { id: it.id, hidden: !it.hidden }), it.hidden ? 'Shown on website' : 'Hidden from website'); }
  if (b.dataset.del) { const [, it] = find(b.dataset.del); if (confirm('Delete "' + it.name + '" permanently?\n(Use Hide if you may want it back.)')) return run(api('delete', { id: it.id }), 'Deleted'); }
  if (b.dataset.move) { const [d, id] = b.dataset.move.split('|'); return run(api('move', { id, dir: d })); }
});
document.addEventListener('change', (e) => {
  const i = e.target.closest('[data-price]'); if (!i) return;
  run(api('price', { id: i.dataset.price, price: i.value }), 'Price updated').then(draw);
});

/* ---- add / edit dialog ---- */
const dlg = $('#dlg');
function openForm(section, it) {
  it = it || {};
  $('#dlgTitle').textContent = it.id ? 'Edit product' : 'Add product';
  $('#f_id').value = it.id || '';
  $('#f_image').value = it.image || '';
  $('#f_prev').src = it.image || '/brand/badge-grip-round.png';
  $('#f_name').value = it.name || '';
  $('#f_name_ar').value = it.name_ar || '';
  $('#f_section').value = section;
  $('#f_price').value = it.price || '';
  $('#f_ing_en').value = it.ing_en || '';
  $('#f_ing_ar').value = it.ing_ar || '';
  $('#f_hidden').checked = !!it.hidden;
  $('#f_file').value = '';
  dlg.showModal();
}
$('#cancel').onclick = () => dlg.close();
$('#f_file').onchange = async (e) => {
  const f = e.target.files[0]; if (!f) return;
  const fd = new FormData(); fd.append('file', f);
  try { const r = await api('upload', fd, true); $('#f_image').value = r.path; $('#f_prev').src = r.path; toast('Photo uploaded'); } catch (err) { e.target.value = ''; }
};
$('#form').onsubmit = async (e) => {
  e.preventDefault();
  const item = { id: $('#f_id').value, name: $('#f_name').value, name_ar: $('#f_name_ar').value, price: $('#f_price').value, ing_en: $('#f_ing_en').value, ing_ar: $('#f_ing_ar').value, image: $('#f_image').value, hidden: $('#f_hidden').checked };
  try { MENU = await api('save', { item, section: $('#f_section').value }); draw(); dlg.close(); toast('Saved'); } catch (err) {}
};

/* ---- password ---- */
$('#pwBtn').onclick = () => $('#pwDlg').showModal();
$('#pwCancel').onclick = () => $('#pwDlg').close();
$('#pwForm').onsubmit = async (e) => {
  e.preventDefault();
  try { await api('password', { current: $('#p_cur').value, new: $('#p_new').value }); $('#pwDlg').close(); $('#pwForm').reset(); toast('Password changed'); } catch (err) {}
};

api('list').then((m) => { MENU = m; draw(); });
</script>
<?php endif; ?>
</body>
</html>
