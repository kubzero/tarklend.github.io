# GitHub Pages site

Basic static site for GitHub Pages.

## Structure

- **`index.html`** – Main page (Coming soon)
- **`css/`** – Stylesheets (`main.css`)
- **`js/`** – Scripts (`main.js`)
- **`images/`** – Image assets
- **`fonts/`** – Custom fonts

## Custom domain

To use a custom domain later:

1. Add a `CNAME` file in the repo root with your domain (e.g. `www.example.com`).
2. Configure DNS for your domain as per [GitHub Pages custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).

## Local preview

Serve the folder with any static server, for example:

```bash
python3 -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000`.
