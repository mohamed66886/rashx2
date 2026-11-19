# RASHX Self-Hosted Fonts Directory (Dual-Weight Architecture)

Active `Ping AR + LT` font files:

- `PingAR+LT-Light.otf` (Light / Regular / Normal — Weights 100–500)
- `PingAR+LT-Bold.otf` (Bold / ExtraBold / SemiBold — Weights 600–900)

### Automatic Activation:
These files are loaded directly via `@font-face` in `globals.css`.
When not present on client networks, the system falls back to the local system installation (if installed on Mac/Windows) or Next.js's optimized `Noto Kufi Arabic` and `Inter`.

