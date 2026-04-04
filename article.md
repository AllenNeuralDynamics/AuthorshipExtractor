---
title: >
  Making contributions visible: An interactive authorship viewer
  for team science
abstract: >
  The scientific author list has remained a linear, ordered sequence of names
  for over three centuries, despite radical changes in how research is conducted.
  This compression of multi-dimensional contributions into a one-dimensional
  ranking creates well-documented tensions: authorship disputes, gift
  authorship, invisibility of infrastructure contributors, and incentive
  structures that actively hinder collaborative team science. We present a
  multi-dimensional authorship framework that allows readers, institutions,
  and metrics systems to explore contributions along multiple axes
  simultaneously. Building on the CRediT (Contributor Roles Taxonomy)
  standard, our framework extends attribution with section-level
  contributions, project timelines, and rich author profiles. Critically,
  we reject the premise that any single author ordering is definitive. Instead,
  the reader can dynamically re-sort by alphabetical order, CRediT roles,
  or project join date. This paper simultaneously describes the framework
  and serves as a live demonstration: the interactive authorship display
  illustrates how rethinking author display can bring transparency, reduce 
  conflict, and properly credit the diverse contributions that make modern 
  science possible.
---

```{authorship-explorer}
:authors: ./authors.yml
:authors-alt: ./authors-large.yml
:alt-label: Simulated large team
:authors-alt2: ./authors-real.yml
:alt2-label: Real contributors
:height: 800px
```

# Introduction

The author byline has served as the primary unit of academic credit for over three centuries. Despite radical transformation in how science is conducted, from the solitary natural philosopher to hundred-person collaborations spanning continents, the format of authorship attribution has remained essentially unchanged: a linear, ordered list of names.

This compression of multi-dimensional contributions into a one-dimensional sequence creates well-documented tensions. Early-career researchers depend on first-author publications for career advancement. Principal investigators expect last-author or corresponding-author designations to signal intellectual leadership. Middle authors, often building critical infrastructure, contributing specialized techniques, or performing essential validation, receive minimal credit differentiation.

The consequences are not merely symbolic. Authorship disputes are among the leading causes of research misconduct complaints {cite}`rennie1997`. Junior researchers report delaying publications and avoiding collaborations to protect their authorship position {cite}`sauermann2017`. The incentive structures that flow from linear author lists actively hinder the collaborative, interdisciplinary team science that modern challenges demand {cite}`wuchty2007`.

We propose a fundamentally different approach. Rather than compressing contributions into a single ordered list, we present a multi-dimensional authorship framework that allows readers, institutions, and metrics systems to explore contributions along multiple axes simultaneously. This framework builds on the CRediT (Contributor Roles Taxonomy) standard while extending it with section-level contributions, project timelines, and rich author profiles. Critically, we reject the premise that any single ordering of authors is definitive. Using our tool, the reader can dynamically re-sort the author list by alphabetical order, number of CRediT roles, specific role contributions, project join date, or institution.

This paper serves simultaneously as a description of the framework and as a live demonstration. Built with MyST (Markedly Structured Text), the interactive authorship display above illustrates how rethinking author display can bring transparency, reduce conflict, and properly credit the diverse contributions that make modern science possible.

## The CRediT taxonomy

The Contributor Roles Taxonomy (CRediT), developed by the Consortia Advancing Standards in Research Administration Information (CASRAI) and first published in 2015 {cite}`brand2015`, defines fourteen distinct contributor roles: Conceptualization, Methodology, Software, Validation, Formal Analysis, Investigation, Resources, Data Curation, Writing—Original Draft, Writing—Review & Editing, Visualization, Supervision, Project Administration, and Funding Acquisition. For each role, contributors can be assigned a degree of contribution: lead, equal, or supporting.

CRediT has gained nominal adoption. Many submission platforms now include CRediT fields {cite}`mcnutt2018`, and publishers such as Elsevier encourage authors to provide a CRediT author statement. In practice, however, these statements typically appear as a brief, unstructured paragraph at the end of the paper. They list role names per author without indicating contribution levels, without machine-readable structure, and without any prominence in the article layout. Some publishers, including Springer Nature, do not use CRediT at all, relying instead on free-text author contribution statements. The gap between the taxonomy's potential and its current implementation underscores the need for richer, reader-facing attribution tools {cite}`allen2014,lariviere2016`.

## Limitations of current approaches

Current authorship display suffers from several interconnected limitations. First, the linear ordering implies a ranking that may not exist. In team science, contributions are often orthogonal: the person who built the data infrastructure, the person who designed the experiments, the person who wrote the theoretical framework, and the person who led the experimental work each contribute indispensably but along entirely different dimensions. Compressing these into positions 1 through N forces a false hierarchy.

Second, the convention of "first author did most work" and "last author is the PI" is not universal. In mathematics and high-energy physics, authors are traditionally listed alphabetically. Readers from different disciplines routinely misinterpret authorship signals from other fields {cite}`birnholtz2006`.

Third, the static nature of the author list conceals the temporal dynamics of contributions. Projects increasingly involve contributors who participate intensely during one phase but not others. A publication often begins with a key conceptual insight, followed by intensive experimental design and execution, and later by data curation and analysis: each phase potentially led by different people. The byline flattens this rich temporal structure into a single snapshot, hiding who contributed when and to what phase of the work.

## Team science and rising author lists

The average number of authors per paper has grown steadily across virtually all scientific fields {cite}`wuchty2007`. In biomedicine, papers with more than fifty authors are no longer unusual, and in fields like particle physics and climate science, author lists routinely exceed one thousand names. Even in traditionally small-team fields like psychology and economics, the median author count has roughly doubled in the past two decades.

:::{figure} author-count-growth.png
:label: fig-author-growth
:align: center

Mean number of authors per paper in biomedical sciences (2003–2025). Data from OpenAlex API, filtered to journal articles in Medicine and Biology. Sample of 200 highly-cited articles per year.
:::

:::{dropdown} Figure generation code (`gen_figure.py`)

```{literalinclude} gen_figure.py
:language: python
```
:::

:::{dropdown} Source data (`author-count-growth.yaml`)

```{literalinclude} author-count-growth.yaml
:language: yaml
```
:::

This growth reflects a genuine change in how research happens. Modern scientific problems, from understanding complex systems to building research infrastructure, require deep specialization in design, analysis, engineering, data management, and domain knowledge that no individual or small group possesses. The question is not whether to do team science but how to credit it fairly.

Current systems fail team science in specific, quantifiable ways: infrastructure contributors (e.g. engineers or data curators) are often listed in the "author positions of least credit" {cite}`lariviere2016`. Trainees who make crucial but bounded contributions face pressure to negotiate for first-author status {cite}`sauermann2017`. The proliferation of workarounds (co-first authors, co-second authors, co-senior authors, equal-contribution footnotes) reveals how strained the linear model has become: teams are inventing ad hoc mechanisms to inject dimensionality into a format that was never designed for it. A richer attribution framework would reduce these tensions by making the nature and extent of each contribution transparent {cite}`rennie1997,holcombe2019`.

## Data model

Our framework extends the CRediT vocabulary {cite}`brand2015` with three additional layers of contribution information. The first layer is section-level contributions: for each section of the manuscript, we record which authors contributed and in what capacity. This mapping reflects the reality of collaborative writing: different authors draft different sections, contribute domain-specific methodology, or provide revisions to particular portions of the text.

The second layer is figure-level contributions, documenting who generated data, created visualizations, or designed the presentation for each figure and table. Figures often represent the most labor-intensive elements of a paper and the elements most often reused and cited. Attributing them individually adds significant granularity to the contribution record.

The third layer is a project timeline: when each contributor joined the project, key milestones in their participation, and optionally when their active contribution ended. This temporal dimension makes visible the trajectory of a project and the different phases of contribution that characterize modern collaborative research.

Each author profile includes structured metadata aligned with ORCID standards {cite}`vasilevsky2021`: institutional affiliations (linked to ROR IDs where available) and persistent identifiers. Critically, we focus on permanent, publication-relevant data: the facts about contributions that form part of the scholarly record.

## Interactive display

A central design principle is that there is no single correct author ordering. The system supports dynamic re-sorting along multiple dimensions: alphabetical, number of CRediT roles, project join date, institution, and by any specific CRediT role. A reader interested in who led the conceptualization can sort by that role; a hiring committee can sort by Software; a student can sort by Methodology. By making re-sorting immediate, we shift the message from "these authors are ranked" to "these authors contributed along multiple dimensions that you can explore."

The interactive panel also allows the reader to switch between multiple datasets: for this paper, a simulated small team, a simulated large team of fifty authors, and the real contributor data. This makes it possible to explore how the framework scales and adapts to different team sizes.

The framework presents authorship information through six complementary views, accessible via tabs in the interactive panel above:

The **Collaboration** tab visualizes the collaboration network. In its default Authors mode, a chord diagram shows all authors as arcs along a perimeter, with chords connecting authors who share CRediT roles—thicker chords indicate more shared roles. This immediately reveals the social topology of a research team: tightly connected clusters, bridging individuals, and independent contributors. The tab also offers three circle-of-circles views that group authors By Institution, By Role, or By Section & Figure. In each, a large circle represents the group (an institution, a CRediT role, or a manuscript section or figure) and the authors who belong to it appear as smaller circles inside. These views make visible the organizational structure of collaboration that a linear author list cannot convey.

The **CRediT** tab encodes the fourteen-role contribution landscape as a colored grid, with lead, equal, and supporting contributions distinguished by intensity. This makes immediately apparent what the byline obscures: a "middle author" might lead three critical roles that no one else contributed to.

The **Sections** tab shows which authors contributed to which manuscript sections and figures, enabling readers to identify the relevant expert for any part of the paper.

The **Timeline** reveals the temporal dynamics of collaboration. Scientific projects are dynamic, with contributors entering and leaving at different stages. The designer who created the visual system may have completed her work a year before publication; the engineer who built interactive components contributed during a bounded period. Each of these contributions was essential; none is captured by a static author list.

The **Sorted List** tab presents the traditional author list but with the ability to dynamically re-sort: by alphabetical order, number of CRediT roles, any individual CRediT role, project join date, or institution. This view makes explicit that author ordering is a choice, not a fact, and that different orderings highlight different contributions.

The **Profiles** view displays structured author metadata (affiliation, CRediT roles, and ORCID identifiers), offering far more context than a name in a byline.

# Methods

The framework is implemented as a MyST (Markedly Structured Text) plugin, leveraging the MyST ecosystem for scientific publishing. MyST extends Markdown with structured roles and directives designed for technical and scholarly content, supporting cross-references, citations, mathematical notation, and, critically for this work, executable and interactive components embedded directly in the document.

Contribution data is stored in YAML files that follow a schema extending the CRediT taxonomy. Each author entry includes standard metadata (name, affiliation, ORCID), CRediT roles with contribution levels (lead, equal, supporting), section-level contributions with free-text descriptions, figure-level attributions, and a timeline with join date and milestones. This structured format is both human-readable and machine-parseable, making it straightforward for authors to maintain and for downstream tools to consume.

The interactive display is implemented as a custom MyST directive (`{authorship-explorer}`) backed by an anywidget-compatible ESM module. At build time, the plugin reads the YAML author files, validates the schema, walks the document AST to extract section heading labels, and injects the structured data into the document as a widget node. At render time, the widget constructs the full interactive interface (collaboration chord and circle-of-circles diagrams, contribution matrix, section map, sorted author list, profile cards, and timeline) entirely in the browser using vanilla JavaScript and SVG, with no external dependencies beyond the MyST theme's anywidget renderer.

The implementation renders inside a Shadow DOM to isolate widget styles from the host document, ensuring consistent appearance across different MyST themes. The widget also injects minimal styles into the host document to relocate itself into the article's frontmatter region and hide the default linear author list, replacing it with the interactive display.

# Discussion

The framework presented here addresses a structural problem in scholarly communication that has been recognized for decades. As early as 1997, Rennie, Yank, and Emanuel argued in JAMA that traditional authorship was failing and proposed replacing it with explicit contributorship {cite}`rennie1997`. Their core insight, that a single byline cannot meaningfully represent the diverse roles within a research team, remains as urgent today as it was then, perhaps more so given the continued growth of team science documented by Wuchty, Jones, and Uzzi {cite}`wuchty2007`.

Institutional momentum has been building. The call by Allen et al. in Nature to move "beyond authorship" toward transparent attribution {cite}`allen2014`, the cross-publisher consensus statement by McNutt et al. on CRediT adoption {cite}`mcnutt2018`, and Holcombe's argument that CRediT should replace traditional authorship entirely {cite}`holcombe2019` have established a clear direction. Yet none of these efforts have changed what the reader actually sees.

On the technical side, efforts by Vasilevsky et al. on the Contributor Role Ontology (CRO) have made CRediT machine-readable and linked to ORCID identifiers {cite}`vasilevsky2021`, and the FORCE11 community has advocated for structured scholarly metadata {cite}`force11_2016`. A few publishers, notably PLOS and eLife, have moved beyond flat text to display structured contribution data on their article pages, but these remain exceptions rather than the norm.

What distinguishes the present work from these prior efforts is its focus on the reader-facing display and interaction layer. The existing literature overwhelmingly addresses how to collect structured contribution data; comparatively little work has addressed what the reader actually sees. Our framework closes this gap by making contribution data the organizing principle of the authorship display itself, with dynamic re-sorting and the explicit design choice that no single author ordering is privileged.

Several implications deserve emphasis. First, this framework makes visible the contributions of individuals who are systematically under-credited in current systems. Data curators, engineers, research coordinators, and technical specialists are increasingly essential to modern science but remain largely invisible in traditional author lists {cite}`lariviere2016`. Students and postdocs fare little better: their contributions are routinely compressed into an ambiguous middle-author position that tells a hiring committee almost nothing. A student who led the entire data analysis pipeline is indistinguishable from one who ran a handful of experiments. Technicians and research staff face an even starker version of this problem, often excluded from the author list entirely or relegated to a position that signals minimal involvement regardless of how essential their work was. Structured contribution records change this. A technician who maintained a critical animal colony or a student who built the software infrastructure can point to a documented, machine-readable record of exactly what they did. When a reader can sort by "Data Curation" or "Software" and see who led these contributions, the value of this work becomes self-evident. This gives early-career researchers and support staff a concrete artifact they can present to hiring committees, fellowship panels, and promotion boards.

Second, the framework reduces the stakes of author ordering by making position less consequential. When every contribution is transparently documented and can be viewed from multiple angles, the specific position in the byline matters less. This alone could significantly reduce authorship disputes, which remain among the most common and corrosive sources of friction in collaborative research {cite}`rennie1997`.

Third, rather than pressuring teams to restrict author lists, this framework allows them to grow. When the only way to credit someone is a position in a linear ranking, every addition dilutes the signal for everyone else, creating an incentive to exclude contributors whose roles are harder to categorize. With structured contribution data, adding an author costs nothing: their specific roles are documented, and no one else's credit is diminished. This removes a perverse gatekeeping mechanism and encourages teams to include everyone who contributed.

Fourth, the machine-readable nature of the contribution data opens new possibilities for research evaluation {cite}`vasilevsky2021,force11_2016`. Funding agencies, hiring committees, and promotion panels currently rely on crude proxies such as author position and journal prestige. Structured contribution data enables genuinely nuanced evaluation, crediting researchers for the specific roles they performed.

Limitations of this framework include the documentation burden on authors, the need for journal and publisher adoption, and the challenge of verifying self-reported contributions. We believe these limitations are addressable: modern submission systems already collect CRediT data {cite}`mcnutt2018`, section-level contributions map naturally to the collaborative writing process with tools like Google Docs and Overleaf that track per-author edits, and the transparency of public contribution records itself serves as a check on misrepresentation. The contribution data itself is stored in simple YAML files that any researcher can edit in a text editor, version-control with Git, and validate without specialized tools. This low barrier to entry means adoption does not depend on any particular publishing platform.

Moreover, the documentation effort is modest compared to the time researchers already spend negotiating authorship order. In our experience, these conversations can consume hours of discussion, generate lasting resentment, and occasionally derail collaborations entirely. Filling out a structured contribution record takes minutes. More importantly, the process itself can diffuse tensions: when contributors see their specific roles documented transparently, the pressure to fight for a particular byline position diminishes. The documentation is not an added cost but a replacement for a far more expensive and corrosive process. Structured contribution records turn a source of conflict into an opportunity for recognition.

Adoption does not require journals to migrate to MyST or any particular publishing platform. The interactive display demonstrated here is implemented entirely in standard JavaScript and SVG, with no framework dependencies. Any journal website that can embed a script tag can host an interactive contribution viewer alongside the traditional article layout. Journals already routinely embed interactive figures, supplementary viewers, and altmetric widgets. An authorship explorer is no different in kind. Rather than treating authorship disputes as an inevitable cost of publication, journals could provide structured contribution tools as part of the submission process, helping authors document and resolve attribution questions before they become conflicts. The workflow is straightforward: each author fills in their own contributions in parallel, the tool aggregates the entries and flags discrepancies, and the team reviews and approves the final record together. This is a solvable engineering problem, not a conceptual one. In an era where large language models make building interactive web components faster than ever, the barrier to creating polished submission-side contribution editors is lower than it has been at any point in the history of scholarly publishing.

The future of scientific authorship must evolve to match the reality of scientific practice. Team science is here to stay and growing {cite}`wuchty2007`. The question is whether our attribution systems will continue to compress multi-dimensional contributions into a format designed for solo scholars, or whether we will build tools that celebrate the collaborative nature of discovery and give every contributor the credit they deserve. 