# StreamLens logo package — direction 1b "Focus"

Every SVG is outlined: the wordmark is paths, not text, so nothing depends on Archivo being installed.
Archivo Expanded (SIL Open Font License) was used only to draw it.

## What to use where

| Need | File |
|---|---|
| Navbar, in-app | `react/StreamLensLogo.component.tsx` (or `svg/logo-horizontal-dark.svg`) |
| Splash, empty states, About | `svg/logo-stacked-*.svg` |
| Avatar slots, loaders, anything square | `svg/symbol-*.svg` |
| Anything under 32 px | `svg/symbol-small-*.svg` (teal focus dot replaces the S) |
| Light backgrounds | `*-light.svg` |
| Single-colour (print, embroidery, watermark) | `*-mono-ivory` / `*-mono-ember` (on amber) / `*-mono-black` |
| Icon masters for future sizes | `svg/app-icon-*.svg`, `svg/maskable-ember.svg` |

## Web (`web/` → `public/`)
`favicon.ico` (16/32/48), `favicon.svg`, `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`,
`icon-maskable-512.png`, `og-image.png` (1200×630), `site.webmanifest`. Paste `head-snippet.html` into `index.html`.

## iOS (`ios/AppIcon.appiconset/`)
Drop the folder into `Assets.xcassets`, replacing the existing `AppIcon.appiconset`. It holds a single 1024 icon (Xcode 15+ generates every size),
plus the iOS 18 dark and tinted appearances. The light and tinted PNGs have no alpha channel, as App Store Connect requires.

## Android (`android/res/`)
Merge into `app/src/main/res/`. The adaptive icon (API 26+) uses a vector foreground that sits inside the 66 dp safe zone, an
ember background colour, and a monochrome layer for Android 13 themed icons. The density PNGs are fallbacks for older devices.
`play-store-icon-512.png` goes in the Play Console listing. Leave the corners square, because Play applies its own mask.

## Rules
- **Clear space:** a quarter of the symbol height on every side.
- **Minimum size:** horizontal lockup 140 px wide, symbol 16 px. Below 32 px, use the small-symbol variant.
- Don't add a border or box around the logo, since the viewfinder already frames it. Don't recolour STREAM and LENS separately in the mono versions, and don't stretch the logo or set the wordmark in live text.
