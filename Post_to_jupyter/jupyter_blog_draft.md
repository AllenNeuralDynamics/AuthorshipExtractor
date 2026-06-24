# Making Contributions Visible: An Interactive Authorship Explorer Built on MyST

**Subtitle:** How we used MyST to build an interactive widget that lets readers explore who did what in a scientific collaboration.

---

## How it started

At the Allen Institute, most of our science is deeply collaborative — engineers building data pipelines alongside experimentalists, data scientists, and project managers. When it comes time to write a paper, we often have 10, 20, or even 50 people who made essential contributions. The question we kept running into: how do we make the breadth of that teamwork apparent to readers?

A linear sequence of names can't convey who built the infrastructure, who designed the experiments, who wrote the analysis code. We wanted to find a way to make team science more visible — to give readers (and contributors themselves) a richer picture of how a collaboration actually works.

That search led us to MyST.

## What we built

The [Authorship Explorer](https://github.com/AllenNeuralDynamics/AuthorshipExtractor) is a MyST plugin that takes structured contribution data (stored as simple YAML files) and renders an interactive, multi-view widget directly in your document. You can try it live here: [allenneuraldynamics.github.io/AuthorshipExtractor](https://allenneuraldynamics.github.io/AuthorshipExtractor/).

Instead of a static name list, readers get six tabs they can explore. The **Collaboration Network** is a force-directed graph where people who share roles cluster together — click anyone to see their connections, or click a role in the legend to highlight a subgroup. The **CRediT Matrix** shows a colored grid of who led, equally contributed, or supported each of the 14 CRediT roles. The **Sections** tab maps who contributed to which part of the paper, including figures. The **Timeline** reveals when people joined the project and what phases they were part of. The **Sorted List** lets you re-sort authors by any role, institution, or join date — showing that there are many valid ways to look at a collaboration. And **Profiles** gives full author cards with ORCID, affiliations, and photos.

The design principle is straightforward: **a collaboration has many dimensions, so let the reader explore them**. A hiring committee might sort by "Software." A student might look at the timeline. A potential collaborator might explore the network.

## How it works under the hood

The plugin has two layers:

**At build time**, a Python MyST plugin reads your YAML author files, validates the schema, walks the document AST to find section headings, and injects everything as a widget node. This is the only piece that's MyST-specific.

**At render time**, a self-contained ES module (~2,500 lines of vanilla JavaScript and SVG) takes a JSON payload and builds the entire interactive UI in the browser. It lives inside a Shadow DOM so it doesn't mess with your theme's styles.

A few engineering choices worth highlighting. The collaboration network uses **force-directed physics** — nodes repel each other, but shared CRediT roles pull people together, so collaborators naturally cluster. For the edges, we use **minimum spanning trees** instead of drawing lines between every pair of collaborators (which gets unreadable fast); we compute a spanning tree per role, which is much cleaner. The widget has **zero dependencies** — no React, no D3, no build toolchain, just vanilla JS and SVG, which keeps it small and embeddable anywhere. And it's **anywidget compatible**, so the same widget works in Jupyter notebooks too, not just MyST documents.

One more thing worth mentioning: this project — the plugin, the widget, and the paper — was built collaboratively with Claude (Anthropic) as a coding agent in VS Code. We provided the architecture and direction; the AI handled much of the implementation. It was a productive pairing.

## Why MyST

This project exists in the MyST ecosystem specifically because MyST's extensibility made it possible.

One `{authorship-explorer}` directive is all it takes to drop this into any document — MyST's plugin system made that straightforward. The anywidget spec bridges MyST and Jupyter, so the same interactive component works in both contexts. There's no lock-in: the widget itself is just JavaScript, so if another platform wants to host it, they can — the MyST part is only the build-time glue. And the data model is YAML-based, meaning authors fill in simple text files, track them in Git, and the build takes care of the rest.

MyST turned out to be not just a document format but a platform for building new kinds of scholarly experiences.

## Give it a spin

Here's how to try it in your own MyST project:

```bash
pip install myst-authorship-explorer
```

### 2. Define your contribution data

Create a YAML file for each author with their CRediT roles, contribution levels, and metadata:

```yaml
name: Jane Smith
orcid: 0000-0001-2345-6789
affiliations:
  - name: University of Example
    ror: https://ror.org/example
credit_roles:
  - role: Software
    level: lead
  - role: Data curation
    level: equal
  - role: Methodology
    level: supporting
timeline:
  joined: 2024-03
  milestones:
    - date: 2024-06
      description: Built data pipeline
```

### 3. Add the directive to your document

```markdown
:::{authorship-explorer}
:data: authors/
:::
```

### 4. Build your MyST site

```bash
myst build
```

The interactive authorship explorer will appear in place of the traditional author list.

## See it live

The paper itself is the best demo: [Making contributions visible: An interactive authorship viewer for team science](https://allenneuraldynamics.github.io/AuthorshipExtractor/). It has 7 contributors across 8 institutions — click around the tabs and you'll quickly get a feel for how it works. We especially recommend clicking on individual authors in the Collaboration view to see how the ego-centric network reconfigures.

## What's next

This is still early days and we welcome input from the community. Try it on your own paper — even a small team of 3–4 people looks interesting in the collaboration view, and we're curious how it works for different team sizes and disciplines. If you work on a publishing platform and are interested in embedding it, reach out — the widget is platform-agnostic. We're also thinking about ORCID integration: structured contribution records could feed into author profiles, building contribution portfolios rather than just publication lists. Feedback and PRs are welcome — the project is fully open source on [GitHub](https://github.com/AllenNeuralDynamics/AuthorshipExtractor).

## Acknowledgments

This work comes out of the Allen Institute. Thanks to Chris Holdgraf for encouraging this post and for connecting us with others in the MyST/Jupyter community working on related problems, and to the MyST team for building a platform that made this kind of experimentation possible.

---

## Submission Checklist (for your reference)

Per the [Jupyter blog submission process](https://jupyter.org/media_submissions#blog-submission-process-blogjupyterorg):

- [ ] Get draft reviewed on Google Docs (Chris offered to do light editing)
- [ ] Create a Medium account ([instructions](https://help.medium.com/hc/en-us/articles/115004915268-Sign-in-or-sign-up-to-Medium))
- [ ] Email jupyter-media-strategy@googlegroups.com with your Medium handle to be added as a writer
- [ ] Submit story on Medium ([how-to](https://help.medium.com/hc/en-us/articles/213904978-Add-a-draft-or-post-to-publication))
- [ ] Email JMS confirming submission + provide:
  - Social media text (max 500 chars for Mastodon, 280 for X)
  - Representative image (the collaboration network visualization would work great)
  - Social handles to @mention

### Suggested social media text

**Mastodon (500 char max):**
> What if you could actually *explore* who did what in a scientific paper? We built a @mystmarkdown plugin that turns author contribution data into an interactive widget — collaboration networks, CRediT roles, timelines — right in the document. Would love feedback from the community! Try it → allenneuraldynamics.github.io/AuthorshipExtractor/ #MyST #OpenScience #TeamScience

**X (280 char max):**
> We built a @mystmarkdown plugin that makes scientific contributions explorable — collaboration networks, CRediT roles, timelines, right in the doc. Try it → allenneuraldynamics.github.io/AuthorshipExtractor/ #MyST #OpenScience
