# Osama Khan — Portfolio

A dark, premium personal portfolio built with React, React Router and Tailwind CSS.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

## Project structure

```
src/
├── components/
│   ├── Navbar.jsx        Sticky, responsive nav with active-route indicator
│   ├── Hero.jsx           Home hero — animated "code editor" signature visual
│   ├── Button.jsx         Reusable button (primary / secondary / ghost, link or action)
│   ├── ProjectCard.jsx    Project card: placeholder thumbnail, tags, demo/GitHub links
│   ├── SkillCard.jsx      Category card used on the About page
│   ├── ContactForm.jsx    Validated contact form with loading/success/error states
│   └── Footer.jsx
├── pages/
│   ├── Home.jsx           Hero only, per the site spec
│   ├── About.jsx
│   ├── Projects.jsx
│   └── Contact.jsx
├── data/
│   ├── skills.js          Edit this to add/remove skills
│   └── projects.js        Edit this to add real project links/images
├── App.jsx                 Routes + layout shell
├── main.jsx
└── index.css
```

## Things to fill in before shipping

- `src/data/projects.js` — add real `liveUrl` / `githubUrl` values per project (buttons show "soon" until then).
- `src/pages/Contact.jsx` — swap the placeholder email/LinkedIn/GitHub links for your real ones.
- `src/components/Footer.jsx` — swap the placeholder social `href="#"` links for your real ones.
- `src/components/ContactForm.jsx` — the submit handler currently simulates a network call. Wire it up to an email service (e.g. EmailJS, Formspree, or your own API route) when you're ready.

## Design tokens

Colors, fonts and animation timings are all defined in `tailwind.config.js` — change them there and they'll propagate everywhere (background, gold accents, card/border colors, Fraunces/Inter/JetBrains Mono fonts).
