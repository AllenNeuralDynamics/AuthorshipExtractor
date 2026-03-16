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

### 2. Create your contributor file

Copy the template below into a new file at:

```
public/contributors/<your-name>.yaml
```

For example: `public/contributors/jane-doe.yaml`

### 3. Fill in your profile

Use the template below. All fields under `profile` describe who you are.
All fields under `contribution` describe what you contributed to this project.

<details>
<summary><strong>Full contributor YAML template</strong> (click to expand)</summary>

```yaml
profile:
  id: author-janedoe          # Unique ID — use author-firstname-lastname
  firstName: Jane
  lastName: Doe
  pronouns: she/her           # Optional
  orcid: "0000-0000-0000-0000" # Optional — wrap in quotes
  careerStage: Postdoctoral Researcher
  # Career stage options:
  #   Undergraduate, Graduate Student, PhD Candidate,
  #   Postdoctoral Researcher, Research Scientist,
  #   Assistant Professor, Associate Professor, Full Professor,
  #   Lab Manager, Research Engineer, Industry Researcher, Emeritus
  bio: >
    One or two sentences about your research interests and expertise.
  affiliations:
    - institution: University of Example
      department: Department of Something
      role: Postdoctoral Fellow
      country: USA
      isCurrent: true
  socialLinks:
    - platform: github
      url: https://github.com/janedoe
      username: janedoe
    # Platform options: orcid, google-scholar, twitter, github,
    #   website, bluesky, mastodon, researchgate, linkedin
  techniques:
    - name: Python
      category: computational   # experimental, computational, analytical, clinical, imaging
      proficiency: expert       # expert, proficient, familiar
  fundingSources: []            # Optional — see existing files for format
  visibility:
    showPronouns: true
    showBio: true
    showFunding: false
    showMetrics: false
    showSocialLinks: true
    showTechniques: true
    showCareerStage: true

contribution:
  # ─── CRediT Roles ───
  # Pick the roles that describe your contribution and set the level.
  # Roles:
  #   Conceptualization, Methodology, Software, Validation,
  #   Formal Analysis, Investigation, Resources, Data Curation,
  #   Writing – Original Draft, Writing – Review & Editing,
  #   Visualization, Supervision, Project Administration,
  #   Funding Acquisition
  # Levels: lead, equal, supporting
  creditRoles:
    - role: Software
      level: supporting
    - role: "Writing – Review & Editing"
      level: supporting

  # ─── Section Contributions ───
  # Which sections of the paper did you contribute to?
  # Available section IDs:
  #   intro, bg-credit, bg-limits, bg-team,
  #   fw-model, fw-sort, fw-viz, fw-api,
  #   impl-inline, impl-matrix, impl-timeline,
  #   discussion, references
  #   Effort levels: lead, major, minor
  sectionContributions:
    - sectionId: discussion
      description: Reviewed and improved the discussion section
      effortLevel: minor    # lead, major, or minor

  figureContributions: []   # Optional

  contributionStatement: >
    Brief free-text summary of what you contributed.

  timeline:
    joinedDate: "2026-03-15"   # When you started contributing
    milestones:
      - date: "2026-03-15"
        event: First pull request

  isCorresponding: false
```

</details>

### 4. Register your file in the manifest

Open `public/contributors/_index.yaml` and **add your filename** to the list:

```yaml
contributors:
  - jerome-lecoq.yaml
  - jane-doe.yaml        # ← add your file here
```

### 5. Test locally

```bash
npm install
npm run dev
```

Switch to **"Real contributors"** mode using the toggle at the top of the page.
Verify your profile appears and your contributions display correctly.

### 6. Open a pull request

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

## File format reference

Each contributor file is YAML with two top-level keys:

- **`profile`** — Your identity and metadata (follows the `AuthorProfile` type)
- **`contribution`** — What you contributed (follows the `AuthorContribution` type)

The app loads these files at runtime from the `public/contributors/` folder.
No TypeScript compilation is needed — just edit YAML and push.

## Questions?

Open an issue or reach out to the project maintainers.
