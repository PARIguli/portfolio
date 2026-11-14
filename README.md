# Parigul Ziad — Portfolio Website

A responsive personal portfolio built with plain HTML, CSS and JavaScript. It includes a public-facing portfolio and a private Supabase-powered admin dashboard.

## Project structure

- `index.html` — public portfolio
- `styles.css` — visual design and responsive layout
- `script.js` — navigation and public data loading
- `config.js` — Supabase public project settings (fill in locally)
- `admin/` — private dashboard
- `database/setup.sql` — database, storage bucket and row-level security setup
- `assets/images/` — add local assets here if needed

## 1. Preview locally

Open `index.html` in a browser. For best results use the VS Code Live Server extension.

## 2. Connect Supabase

1. Create a project at https://supabase.com/
2. Open SQL Editor and run `database/setup.sql`.
3. In Authentication settings, turn off public sign-ups.
4. Create your own user in Authentication > Users.
5. Copy your user's UUID from Authentication > Users.
6. In `database/setup.sql`, replace every `YOUR_AUTH_USER_UUID` with that UUID, then run the SQL script. (If you already ran the earlier SQL, drop the old policies first or use a fresh project.)
7. If your portfolio table already exists, run `database/add_publication_category.sql` once to enable publication uploads.
7. Copy the Project URL and public anon/publishable key from Project Settings > API.
8. Add those values to `config.js`:

```js
window.PORTFOLIO_CONFIG = {
  SUPABASE_URL: "https://YOUR-PROJECT.supabase.co",
  SUPABASE_ANON_KEY: "YOUR_PUBLIC_ANON_KEY"
};
```

Never put a Supabase `service_role` key in browser JavaScript or GitHub.

## 3. Admin dashboard

After Supabase is configured and your user has been created, visit `/admin/`.
Sign in with the email and password you created in Supabase.

The dashboard can upload images, create portfolio items, publish/draft them, list items and delete them.

## Important security note

This project uses Supabase Auth and Row Level Security, and does not expose a service-role key. The SQL setup includes owner-UUID checks: replace the placeholder with your own Auth user UUID before running the SQL. Disable public sign-ups and never share your login. Review the policies before launch.

## 4. Deploy free with Cloudflare Pages

1. Push this folder to a GitHub repository.
2. In Cloudflare Dashboard, open Workers & Pages > Create > Pages > Connect to Git.
3. Select the repository. For plain static HTML, leave build command blank and set output directory to `/`.
4. Deploy. Cloudflare will provide a `*.pages.dev` address.
5. In Pages > Custom domains, add your registered domain and follow the DNS instructions.

The website hosting can be free. The custom domain registration normally has a yearly fee.

## 5. Before public launch

- Add artwork, design samples, project images, certificates and publications through the dashboard. The hero uses a code-led visual and does not require a portrait.
- Review all project descriptions for accuracy.
- Add your own art, designs and certificate images through the dashboard.
- Review the email, GitHub, Instagram, project and art website links shown on the home page.
- Tighten the SQL owner policies to your Auth user UUID.
- Test login, upload, delete and public visibility.
