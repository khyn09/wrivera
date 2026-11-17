# R_KHYN

A responsive, static professional profile for Wilson Rivera. It runs directly in a browser and has no build step or runtime dependencies.

## Run locally

Open `index.html` directly, or run `py serve.py` and visit `http://127.0.0.1:8000/`. The custom local server binds to loopback, sends security headers, disables directory listings, and blocks hidden/internal files. Avoid `py -m http.server` because it serves the project root without those restrictions.

## Edit your content

Edit `archive-data.js` to update the profile, work chronology, learning records, education, skills, social links, and resume path. Certificate records can show a local PDF with `certificateFile`, an image badge with `certificateImage`, or an official `verificationUrl` / `verificationCode`.

The resume, certificate PDFs and generated previews, and DICT badge are stored in `Resume/`, `Certificate/Preview/`, `Certificate/`, and `DICT-Recognized Badge/`. Update those paths if files are renamed. The TESDA Level III record is based on the information supplied; add its certificate or official verification details when available.

## Security

`index.html` uses a self-only Content Security Policy with no inline scripts or styles. The site has no external scripts or stylesheets, so SRI is not needed. Archive fields are static source data; dynamic values are escaped before template rendering, and profile/contact values use DOM text nodes. There are no forms or runtime user inputs.

Copy, cut, selection, and the context menu are disabled as a casual deterrent only. Public content remains retrievable through browser tools, source/network requests, screenshots, and assistive technology; this is not access control or DRM.

`serve.py` sets CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and COOP locally, and blocks hidden folders, source maps, backups, and directory listings. It intentionally does not set HSTS or redirect localhost to HTTPS. `.htaccess` provides equivalent Apache headers, an HTTP-to-HTTPS redirect, and HSTS only when HTTPS is active; Apache `mod_headers` and `mod_rewrite` must be enabled. Other hosts need equivalent server/header configuration. The HTML meta CSP cannot set `frame-ancestors`, HSTS, or response headers.

The resume, certificates, email, and profile are public static files. Do not put secrets in `archive-data.js`; a secure editor or protected content requires a backend and authentication. Anti-spam controls are not applicable because the site has no form.

## Content management

This static site has no authenticated editor or CMS. A secure content-management interface requires a backend, identity provider, and deployment configuration, none of which are included in this standalone project. Content is editable in the source data file.
