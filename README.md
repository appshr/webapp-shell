# WebApp Shell

A tiny, offline-first **PWA shell** that renders self-contained HTML pages encoded
directly into the URL. It's a successor to opening `data:text/html;base64,…` URLs
from iOS Shortcuts — but on a real, persistent origin.

**Live:** https://appshr.github.io/webapp-shell/

## What it does

1. Open the shell. Paste a self-contained HTML page into the builder.
2. It encodes your HTML (base64url, optionally gzip-compressed) into a link like:
   ```
   https://appshr.github.io/webapp-shell/#app=<base64url>
   https://appshr.github.io/webapp-shell/#appz=<gzip+base64url>
   ```
3. Opening that link renders your page full-screen inside the shell.

## Why it beats raw `data:` URLs

| | `data:` URL | WebApp Shell |
|---|---|---|
| Runs offline | yes | yes (service worker) |
| Persistent `localStorage` / `IndexedDB` | ❌ opaque origin | ✅ real origin, survives launches |
| Add to Home Screen (full-screen) | ❌ | ✅ |
| Stable, shareable URL | ❌ | ✅ |

## The payload lives in the URL **hash** (`#`), on purpose

- The hash is **never sent to GitHub's servers**, so there are no URL-length or
  routing limits, and the service worker always matches the cached shell —
  meaning **any generated link works fully offline** after the first load.
- Encoding is **base64url** (`-`/`_`, no padding) so it's URL-safe everywhere.
- With gzip (Safari 16.4+) the link stays much shorter.

## Using it from Shortcuts

1. Generate a link in the builder and **Copy** it.
2. Add an **“Open URLs”** action in Shortcuts and paste the link.
3. Running the shortcut opens your app in Safari — offline, with its data intact.

> Shortcuts opens URLs in Safari (with its minimal toolbar). iOS does **not**
> allow Shortcuts to launch directly into a chrome-free standalone window — that's
> an OS limitation, not something a web page can change.

## True full-screen (no Safari chrome)

1. Open your app link, then in Safari tap **Share → Add to Home Screen → Add**.
2. The icon launches your app full-screen, offline, with its own storage.

The shell auto-injects `apple-mobile-web-app-capable` and a `viewport` meta if your
page is missing them, so any pasted page becomes full-screen-capable.

## Why not `webapp://`?

Custom URL schemes can only be claimed by **native** apps on iOS (via Info.plist).
A web page / PWA cannot register `webapp://`, so it can never be launched that way.
The `https://` links this tool generates do everything that scheme was meant to do.

## Offline guarantee

The first online load caches the shell permanently via a service worker. After that
the shell and every link work with no network. Your app only needs the internet if
**its own code** fetches something external — keep pages self-contained to stay 100% offline.

## ⚠️ Security note

Anything you load runs on the `appshr.github.io` origin with full access to its
storage. Only open links you created or trust: a malicious page could read or wipe
the data of your other shell apps.

## Files

- `index.html` — the shell (renderer + builder UI)
- `sw.js` — service worker (offline cache)
- `manifest.webmanifest` — PWA manifest
- `icon.svg`, `icon-192.png`, `icon-512.png` — icons
