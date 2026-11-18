# RASHX Self-Hosted Fonts Directory

Place licensed `Ping AR + LT` font files in this folder with the following exact filenames:

- `PingAR+LT-Regular.woff2` (and/or `PingAR+LT-Regular.otf`)
- `PingAR+LT-Medium.woff2` (and/or `PingAR+LT-Medium.otf`)
- `PingAR+LT-Bold.woff2` (and/or `PingAR+LT-Bold.otf`)
- `PingAR+LT-ExtraBold.woff2` (and/or `PingAR+LT-ExtraBold.otf`)

### Automatic Activation:
The moment these files are placed in this folder, `@font-face` in `globals.css` will immediately serve them.
When not present, the system automatically uses the local system installation (if installed on Mac/Windows) or falls back to Next.js's optimized `Noto Kufi Arabic` and `Inter`.
