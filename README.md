# AuthorshipExtractor

A multi-dimensional scientific authorship framework — both a paper describing the approach and a live, interactive demonstration of it.

## What is this?

The traditional author list compresses complex, multi-dimensional contributions into a single ordered sequence of names. **AuthorshipExtractor** reimagines this by letting readers explore contributions along multiple axes simultaneously:

- **CRediT roles** — 14 standardized contributor roles with effort levels (lead / major / minor)
- **Section-level attribution** — inline highlights showing who contributed to each part of the text
- **Dynamic sorting** — re-order authors by name, career stage, CRediT role, institution, or join date
- **Collaboration graph** — network visualization of shared contributions
- **Timeline** — when each contributor joined the project
- **Rich profiles** — ORCID, affiliations, funding, social links, techniques

The website renders a real academic paper about this framework while simultaneously demonstrating it.

## Live demo

Deployed via GitHub Pages:
**https://AllenNeuralDynamics.github.io/AuthorshipExtractor/**

## Quick start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Production build
npm run build
```

Requires **Node.js 18+**.

## Project structure

```
public/
  paper.yaml              # Paper metadata (title, abstract, sections, figures)
  paper.md                # Full article text with section/figure markers
  contributors/           # Real contributor YAML profiles
    simulated/            # Fictional demo contributors
  figures/                # Generated figure data (YAML)
src/
  components/             # React components (PaperBody, AuthorshipPanel, etc.)
  data/                   # Loaders for YAML contributors + paper metadata
  types/                  # TypeScript interfaces
figures/                  # Python scripts for generating figure data
CONTRIBUTING.md           # How to add yourself as a contributor
```

## Adding yourself as a contributor

This project practices what it preaches — you can become a real contributor by opening a pull request with your YAML profile. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- YAML-based content loaded at runtime (no build-time content pipeline)

## License

[MIT](LICENSE)
