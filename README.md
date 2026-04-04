# AuthorshipExtractor

A multi-dimensional scientific authorship framework, both a paper describing the approach and a live, interactive demonstration of it. Built with [MyST](https://mystmd.org/).

## What is this?

The traditional author list compresses complex, multi-dimensional contributions into a single ordered sequence of names. **AuthorshipExtractor** reimagines this by letting readers explore contributions along multiple axes simultaneously:

- **CRediT roles** — 14 standardized contributor roles with effort levels (lead / equal / supporting)
- **Section & figure attribution** — who contributed to the work described in each section and figure
- **Dynamic sorting** — re-order authors by name, CRediT role, number of roles, join date, or institution
- **Collaboration views** — chord diagram of shared roles, plus circle-of-circles views grouping authors by institution, role, or section & figure
- **Timeline** — when each contributor joined the project
- **Rich profiles** — ORCID, affiliations, CRediT roles
- **Dataset switcher** — switch between a small simulated team, a large simulated team (50 authors), and real contributors

The site renders a real academic paper about this framework while simultaneously demonstrating it via an interactive anywidget plugin.

## Live demo

Deployed via GitHub Pages:
**https://AllenNeuralDynamics.github.io/AuthorshipExtractor/**

## Quick start

```bash
# Install MyST CLI (requires Node.js 18+)
npm install -g mystmd

# Start dev server
myst start

# Production build
myst build
```

## Project structure

```
article.md                # Full paper in MyST Markdown
myst.yml                  # MyST project configuration
authors.yml               # Simulated contributor data (7 fictional authors)
authors-large.yml          # Simulated large team (50 fictional authors)
authors-real.yml           # Real contributor data
authorship-plugin.mjs      # MyST plugin: directive + transform
authorship-widget.mjs      # Interactive widget (vanilla JS, anywidget)
authorship-widget.css      # Widget styles
references.bib             # Bibliography
gen_figure.py              # Script to regenerate the author-count figure
author-count-growth.yaml   # Source data for the figure
author-count-growth.png    # Pre-rendered figure
CONTRIBUTING.md            # How to add yourself as a contributor
```

## Adding yourself as a contributor

This project practices what it preaches — you can become a real contributor by adding your profile to `authors-real.yml` and opening a pull request. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

## Tech stack

- [MyST](https://mystmd.org/) — Markedly Structured Text for scientific publishing
- [anywidget](https://anywidget.dev/) — Interactive widget framework
- Vanilla JavaScript (no React/bundler required)
- YAML-based contributor data

## License

[MIT](LICENSE)
