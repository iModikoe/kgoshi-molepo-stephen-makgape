# Noko Funerals Family Link

Standalone memorial website for Kgoshi Molepo Stephen Makgape. HTML, CSS and browser JavaScript only. No dependencies, installation, environment variables or build step are required.

## GitHub and Vercel

1. Create a new GitHub repository and upload the contents of this folder, with `index.html` and `vercel.json` at the repository root.
2. Import that repository into Vercel as a new project.
3. Use Framework Preset **Other**, Root Directory **./**, no Build Command, no Install Command, and Output Directory **.**. The included `vercel.json` sets these values.
4. Deploy, then share the production HTTPS URL. Check that it opens without a Vercel login before sending it to family.

If using the existing Noko website repository instead, select **Family Link** as the Vercel Root Directory and create a separate Vercel project for this memorial. Do not replace the original website's project settings.

The ZIP prepared alongside this project contains these files at its root. Extract it before uploading the contents to GitHub; uploading the ZIP itself will not publish the website.

## Files

- `index.html`: page structure and fixed wording.
- `premium.css`: responsive design and animations.
- `funeral.js`: personal details, obituary, photo list and programme paths.
- `app.js` and `experience.js`: rendering, calendar, photo viewer, programme viewer and sharing.
- `Images/`: photographs, awards image and original programme PDF.
- `assets/`: decorative background, Noko team photograph and four programme page previews.
- `fonts/`, `WHite logo.png` and the main portrait: files used by the page.

## Updating

Edit `funeral.js` for funeral details and photographs. Dates use YYYY-MM-DD; times use HH:MM in South African time. If replacing the PDF, update its path and regenerate the corresponding programme preview images.

Open `index.html` locally to preview. Sharing becomes available at a public HTTPS address. The page requests no search indexing; this is not access control. The memorial does not collect or submit visitor messages. Local storage is used only to remember motion preferences.

Arrow icons are inline SVGs from Lucide, avoiding emoji rendering on phones. The Lucide/Feather license is included in `assets/lucide-LICENSE`.
