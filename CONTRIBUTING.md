# Contributing to AuthorshipExtractor

This project is itself a proof of concept for multi-dimensional scientific authorship.
**You can become a real contributor** by adding your profile via a pull request.

---

## How to add yourself as a contributor

### 1. Fork and clone the repository

```bash
git clone https://github.com/<your-username>/AuthorshipExtractor.git
cd AuthorshipExtractor
```

### 2. Add your entry to `authors-real.yml`

Open `authors-real.yml` and add a new contributor block under `project.contributors`.
Use the template below — all fields under the `# Extended fields` comment are read
by the widget plugin and power the interactive visualizations.

<details>
<summary><strong>Full contributor YAML template</strong> (click to expand)</summary>

```yaml
    - id: author-janedoe          # Unique ID — use author-firstname-lastname
      name: Jane Doe
      orcid: "0000-0000-0000-0000"
      email: jane@example.org
      corresponding: false
      roles:
        - Software
        - "Writing – review & editing"
      affiliations:
        - example-uni              # Must match an id in the affiliations block

      # --- Extended fields (read by our plugin) ---
      first_name: Jane
      last_name: Doe
      avatar_url: https://example.com/photo.jpg  # Optional — URL to a profile photo
      career_stage: Postdoctoral Researcher
      # Career stage options:
      #   Undergraduate, Graduate Student, PhD Candidate,
      #   Postdoctoral Researcher, Research Scientist,
      #   Assistant Professor, Associate Professor, Full Professor,
      #   Lab Manager, Research Engineer, Industry Researcher, Emeritus
      credit_levels:
        - role: Software
          level: supporting        # lead, equal, or supporting
        - role: "Writing – Review & Editing"
          level: supporting
      section_contributions:
        # Available section IDs:
        #   intro, bg-credit, bg-limits, bg-team,
        #   fw-model, fw-sort, fw-viz,
        #   impl-inline, impl-matrix, impl-timeline,
        #   discussion, references
        - section: discussion
          description: Reviewed and improved the discussion section
          effort: minor            # lead, equal, or supporting
      figure_contributions: []     # Optional
      contribution_statement: >
        Brief free-text summary of what you contributed.
      timeline:
        joined: "2026-04-01"       # When you started contributing
        milestones:
          - date: "2026-04-01"
            event: First pull request
      social_links:
        - platform: github
          url: https://github.com/janedoe
        # Platform options: orcid, github, google-scholar, twitter,
        #   bluesky, linkedin, website, email
```

</details>

### 3. Add your affiliation (if new)

If your institution isn't already listed in the `affiliations` block at the bottom
of `authors-real.yml`, add it:

```yaml
  affiliations:
    - id: example-uni
      name: University of Example
      department: Department of Something
      ror: https://ror.org/0000000000   # Optional — find yours at https://ror.org
      city: Example City
      region: EX
      country: US
```

### 4. Test locally

```bash
# Requires Node.js 18+
npm install -g mystmd
npm install yaml
npx mystmd start
```

Switch to **"Real contributors"** mode using the toggle at the top of the widget.
Verify your profile appears and your contributions display correctly.

### 5. Open a pull request

Push your branch and open a PR. In the PR description, briefly describe
what you contributed to the project.

---

## What counts as a contribution?

Any meaningful contribution to this project qualifies. Examples:

| What you did | CRediT roles to use |
|---|---|
| Wrote or edited paper text | Writing – Original Draft, Writing – Review & Editing |
| Built UI components or fixed bugs | Software |
| Designed the visual layout | Visualization |
| Reviewed the conceptual framework | Conceptualization, Methodology |
| Tested the application | Validation |
| Provided feedback on the approach | Writing – Review & Editing |
| Added data or references | Data Curation, Investigation |

---

## CRediT roles reference

The 14 standardized CRediT roles with three effort levels (lead, equal, supporting):

Conceptualization, Methodology, Software, Validation,
Formal Analysis, Investigation, Resources, Data Curation,
Writing – Original Draft, Writing – Review & Editing,
Visualization, Supervision, Project Administration,
Funding Acquisition

## Questions?

Open an issue or reach out to the project maintainers.
