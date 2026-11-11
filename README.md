# Second Brain — Neural Edition

The neural edition of Sundowna’s Second Brain collection. A black, colorful concept map carries information tokens through three app synapses into a central brain. Built as a static website with HTML, CSS, SVG, and JavaScript.

The original version 1.0 lives at https://sundowna.github.io/sundowna/. This repository keeps the neural design separately.

## Publish on GitHub Pages

In this repository’s **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source. The included **Deploy Second Brain to GitHub Pages** workflow publishes on pushes to `main`. If enabling Pages after the initial push, open **Actions → Deploy Second Brain to GitHub Pages → Run workflow**.

Expected URL after successful deployment: https://sundowna.github.io/sb/

If workflow creation is restricted by your GitHub connection, this is also a buildless site: in **Settings → Pages**, choose **Deploy from a branch**, branch **main**, folder **/ (root)**, and save. No build tools are needed.

## What’s included

- A responsive neural hero with separate desktop and mobile layouts.
- 25 input icons: Office, Google, Apple, Signal, ChatGPT, Codex, Claude, Anthropic, Proton Lumo, Gemini, voice, images, links, shares, and files.
- Native SVG motion carries icons through app junctions into Second Brain; pause/resume, reduced motion, and hidden-tab suspension are included.
- The diagram is a concept map, not a list of supported app integrations.
- Responsive app collection, original CSS illustrations, and clear availability labels.
- Accessible native dialogs with setup instructions, keyboard support, and reduced-motion handling.
- Real project and release links, copyable collection and individual app links, with manual copy fallback.
- AI ChatBridge and OneNote Style: available desktop Obsidian plugins.
- Brain Capture: private Android proof of concept, no public download. Its preview is explicitly labeled as a concept.

## Edit

- `index.html`: page copy, app cards, FAQ, metadata.
- `styles.css`: layout, colors, responsive rules, original UI illustrations.
- `app.js`: app setup guides, project links, and sharing.
- `assets/favicon.svg`: site icon.
- `assets/icons/`: information-source product and generic icons.
- `assets/ICON-SOURCES.md`: product icon source information.

The Google Fonts stylesheet supplies Archivo and Instrument Serif. System fonts are used if the font service is unavailable. No analytics, build step, or application backend.

Open `index.html` in a browser for a quick local view. Clipboard sharing requires HTTPS or localhost; elsewhere, the manual-copy dialog appears.

The product previews are illustrative. This landing page does not run the plugins or access notes, AI accounts, or the microphone.
