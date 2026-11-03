# AuthorshipExtractor

A multi-dimensional scientific authorship framework, both a paper describing the approach and a live, interactive demonstration of it. Built with [MyST](https://mystmd.org/).

## What is this?

The traditional author list compresses complex, multi-dimensional contributions into a single ordered sequence of names. **AuthorshipExtractor** reimagines this by letting readers explore contributions along multiple axes simultaneously:

- **CRediT roles** — 14 standardized contributor roles with effort levels (lead / equal / supporting)
- **Section & figure attribution** — who contributed to the work described in each section and figure
- **Dynamic sorting** — re-order authors by name, CRediT role, number of roles, join date, or institution
- **Collaboration network** — force-directed layout where proximity reflects collaboration strength, with per-role edge visualization and ego-centric views on click
- **Timeline** — when each contributor joined the project
- **Rich profiles** — ORCID, affiliations, CRediT roles, and optional profile photos
- **Dataset switcher** — optionally configure multiple author lists (e.g. different teams or project phases) and switch between them

The site renders a real academic paper about this framework while simultaneously demonstrating it via an interactive anywidget plugin.

## Live demo

Deployed via GitHub Pages:
**https://AllenNeuralDynamics.github.io/AuthorshipExtractor/**

## Use the plugin in another MyST project

Downstream projects can load the standalone plugin directly from the latest
GitHub release. No plugin fork, copied JavaScript, CSS, or npm dependency is
required.

```yaml
# myst.yml
project:
	plugins:
		- https://github.com/AllenNeuralDynamics/AuthorshipExtractor/releases/latest/download/authorship-plugin.mjs
```

Add the directive to a MyST Markdown document and keep the project-specific
author data in that repository:

````markdown
:::{authorship-explorer}
:authors: ./authors.yml
:height: 800px
:::
````

The `authors` path is relative to the Markdown document. The alternate dataset
options `authors-alt`, `alt-label`, `authors-alt2`, and `alt2-label` are also
available, as shown in [article.md](article.md). For reproducible builds, replace
`latest` with a release tag, for example:

```yaml
- https://github.com/AllenNeuralDynamics/AuthorshipExtractor/releases/download/v0.1.3/authorship-plugin.mjs
```

MyST downloads and executes the remote plugin during the build, so builds using
the URL require network access.

The release bundle and its emitted browser assets carry the full MIT notice, so
consuming repositories do not need a separate third-party notice file solely for
AuthorshipExtractor.

## Static contribution tables

Static exports use the same contributor snapshot as the widget. They retain exact
section names and recorded contribution levels without grouping or aggregation.
Missing values are blank; a role without an effort level is marked separately.
Repeated section records retain all reported levels as split cells, rather than
being reduced to a highest or inferred level.
By default, authors remain in source order and split into readable column blocks
(17 authors by default). `--layout compact` uses full-name author rows instead,
allowing up to 40 authors in each table without repeated name headers.
`--author-order alphabetical` sorts by surname without changing the source data.
Explicit family-name fields take precedence; compound surname particles are
retained when deriving the sort key from a full name.

Export vector PDF and SVG files from a checkout:

```bash
npm ci
npm run export:static -- --authors ./authors.yml --out ./_build/authorship-static
```

Options include `--format svg|pdf|both`, `--tables credit,sections`, and
`--authors-per-block 17`. Use `--font /path/to/font.ttf` (and optionally
`--bold-font /path/to/bold.ttf`) for Unicode names beyond the standard PDF font.
The PDF contains selectable text and author metadata. A provenance file records
the input checksum and every exported cell. No browser or screenshot is required.

For a compact, alphabetically ordered paper:

```bash
npm run export:static -- --authors ./authors.yml --layout compact --author-order alphabetical
```

For native static MyST figures, use:

````markdown
:::{authorship-tables}
:authors: ./authors.yml
:tables: credit,sections
:authors-per-block: 17
:::
````

The interactive directive can instead expose static figures to a print adapter
without changing its browser UI:

````markdown
:::{authorship-explorer}
:authors: ./authors.yml
:print-tables: credit,sections
:print-authors-per-block: 17
:::
````

For PDF-only opt-in, put `authorship-extractor.json` alongside the PDF project's
`myst.yml`, leaving the HTML project unchanged:

```json
{
	"print": {
		"tables": ["credit", "sections"],
		"authorsPerBlock": 40,
		"layout": "compact",
		"authorOrder": "alphabetical"
	}
}
```

The corresponding directive options are `layout` / `author-order` on
`authorship-tables`, or `print-layout` / `print-author-order` on the interactive
directive. Omit these options to retain source ordering and the column layout.

The widget remains interactive. Its `model.staticFigures` JSON field contains a
versioned `{ "version": 1, "items": [...] }` list of generated SVG paths and alt
text for the PDF adapter. The adapter can replace its visible author block with
those native image nodes while retaining the author names in PDF metadata.
Static files are content-addressed under `_build/.authorship-extractor/static/`.
Without opt-in, existing plugin behavior is unchanged.

## Quick start

```bash
# Install MyST CLI (requires Node.js 18+)
npm install -g mystmd

# Start dev server
myst start

# Production build
myst build
```

## Publishing a plugin release

Maintainers: see
[CONTRIBUTING.md](CONTRIBUTING.md#publishing-a-plugin-release) for the release
procedure.

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
scripts/                   # Build and standalone-bundle tests
references.bib             # Bibliography
gen_figure.py              # Script to regenerate the author-count figure
author-count-growth.yaml   # Source data for the figure
author-count-growth.png    # Pre-rendered figure
CONTRIBUTING.md            # How to add yourself as a contributor
```

## Adding yourself as a contributor

You can become a real contributor by adding your profile to `authors-real.yml` and opening a pull request. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

## Tech stack

- [MyST](https://mystmd.org/) — Markedly Structured Text for scientific publishing
- [anywidget](https://anywidget.dev/) — Interactive widget framework
- Vanilla JavaScript (no React/bundler required)
- YAML-based contributor data

## License

[MIT](LICENSE)
