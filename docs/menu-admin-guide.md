# GRIP menu manager

Admin panel for the **Menu page only**: change prices, add / edit products, hide or delete products, upload photos, reorder.

- Admin: `https://gripburger.om/admin/`
- Public feed the site reads: `https://gripburger.om/api/menu.php`

## First-time setup (right after deploying)
1. Open `https://gripburger.om/admin/` immediately. The first visitor chooses the admin password (10+ characters). Do this yourself before anyone else can.
2. Sign in. The 34 current products are already loaded.
3. Share the link and password with the client through a safe channel.

## Everyday use
- **Price**: type in the price box next to a product; it saves when you leave the box.
- **Hide / Show**: takes a product off (or back onto) the website without deleting it.
- **Edit**: name (English + optional Arabic), category, price, ingredients (EN + AR), photo.
- **+ Add product**: pick the category, fill in the form, upload a photo (square works best).
- **Delete**: permanent. Prefer Hide.
- **Up / Down arrows**: change the order inside a category.
- Changes show on the website immediately (refresh the page).

## How it works
- Data lives in `data/menu.json` on the server (backup copy `menu.json.bak` on every save). Uploaded photos are in `uploads/menu/`.
- These two folders are NOT in GitHub, so a Git deploy never overwrites the client's changes.
- If the feed is unreachable, the website falls back to the built-in menu so the page never goes blank.
- Requires PHP 7.4+ (Hostinger Premium has it). No database needed.

## Security notes
- Password is stored hashed; 6 wrong attempts lock that IP for 15 minutes.
- `/admin/` and `/data/` are blocked in robots.txt; `data/` is blocked from the web by `.htaccess`.
- Backup: download `data/menu.json` and `uploads/` from Hostinger File Manager now and then.
