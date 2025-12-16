# Lab Form (Vite + React + TypeScript + Tailwind)

This project is a small two-step form built with Vite, React, TypeScript, and Tailwind CSS. It includes a custom slider with expressive faces and persists submissions to `localStorage`.

## Scripts

- `npm run dev` – start the dev server
- `npm run build` – type-check and build production assets to `dist`
- `npm run preview` – preview the production build locally

## Deploy to GitHub Pages

This repo is configured to deploy automatically to GitHub Pages using GitHub Actions.

What’s already set up:
- Vite `base` is set to `/lab-form/` in `vite.config.ts` so assets resolve correctly on Pages.
- A workflow at `.github/workflows/deploy.yml` builds the site and deploys to Pages on pushes to `main`.

Steps to publish:
1. Create a GitHub repository named `lab-form` under your account (or confirm it exists).
2. Initialize git locally (if not already), commit, and push the `main` branch:
   ```bash
   git init
   git add -A
   git commit -m "chore: init and configure GitHub Pages"
   git branch -M main
   git remote add origin git@github.com:<YOUR_GITHUB_USERNAME>/lab-form.git
   git push -u origin main
   ```
3. The GitHub Actions workflow will run automatically. You can watch progress under the Actions tab.
4. Once it finishes, your site will be available at:
   `https://<YOUR_GITHUB_USERNAME>.github.io/lab-form/`

Notes:
- Ensure the repository name matches `lab-form` or update `base` in `vite.config.ts` to `/<REPO_NAME>/`.
- In Settings → Pages, the source should be “GitHub Actions.” This is set automatically when the workflow deploys.
- If you plan to use a custom domain, add a `CNAME` file under `public/` or configure it in Pages settings.

## Tech
- Vite + React + TypeScript
- Tailwind CSS v4 (via `@tailwindcss/postcss`)
- GitHub Actions for deployment
