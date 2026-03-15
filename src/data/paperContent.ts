// Full paper body text organized by section, for rendering with inline author highlights.
// Each section's sectionId matches the Paper.sections and contribution.sectionContributions mapping.

export interface PaperSection {
  id: string;
  title: string;
  level: 1 | 2;
  paragraphs: string[];
}

export const PAPER_BODY: PaperSection[] = [
  {
    id: 'intro',
    title: 'Introduction',
    level: 1,
    paragraphs: [
      `The author byline has served as the primary unit of academic credit for over three centuries. Despite radical transformation in how science is conducted—from the solitary natural philosopher to hundred-person collaborations spanning continents—the format of authorship attribution has remained essentially unchanged: a linear, ordered list of names.`,

      `This compression of multi-dimensional contributions into a one-dimensional sequence creates well-documented tensions. Early-career researchers depend on first-author publications for career advancement. Principal investigators expect last-author or corresponding-author designations to signal intellectual leadership. Middle authors—often including those who built critical infrastructure, contributed specialized techniques, or performed essential validation—receive minimal credit differentiation regardless of the significance of their contributions.`,

      `The consequences are not merely symbolic. Authorship disputes are among the leading causes of research misconduct complaints. Gift authorship and ghost authorship persist because the byline carries too much weight while communicating too little information. Junior researchers report delaying publications and avoiding collaborations to protect their authorship position. The incentive structures that flow from linear author lists actively hinder the collaborative, interdisciplinary team science that modern challenges demand.`,

      `We propose a fundamentally different approach. Rather than compressing contributions into a single ordered list, we present a multi-dimensional authorship framework that allows readers, institutions, and metrics systems to explore contributions along multiple axes simultaneously. The framework builds on the CRediT (Contributor Roles Taxonomy) standard while extending it with section-level contributions, project timelines, and rich author profiles. Critically, we reject the premise that any single ordering of authors is definitive—the reader can dynamically re-sort the author list by alphabetical order, career stage, number of CRediT roles, specific role contributions, institutional grouping, or project join date.`,

      `This paper serves simultaneously as a description of the framework and as a live demonstration. The interactive authorship display above, and the contribution highlights embedded throughout this text, illustrate how rethinking author display can bring transparency, reduce conflict, and properly credit the diverse contributions that make modern science possible.`,
    ],
  },
  {
    id: 'bg-credit',
    title: 'The CRediT Taxonomy',
    level: 2,
    paragraphs: [
      `The Contributor Roles Taxonomy (CRediT), developed by the Consortia Advancing Standards in Research Administration Information (CASRAI) and first published by Brand et al. (2015), defines fourteen distinct contributor roles: Conceptualization, Methodology, Software, Validation, Formal Analysis, Investigation, Resources, Data Curation, Writing—Original Draft, Writing—Review & Editing, Visualization, Supervision, Project Administration, and Funding Acquisition. Each contributor can be assigned a degree of contribution—lead, equal, or supporting—for each applicable role.`,

      `CRediT has gained remarkable adoption. Over 5,000 journals now require or encourage CRediT disclosure, and major publishers including Elsevier, Springer Nature, and Cell Press have integrated CRediT into their submission workflows. The taxonomy has been particularly valuable for making visible the contributions of individuals whose work falls outside traditional "author" roles—data curators, software engineers, lab managers, and research administrators.`,

      `However, CRediT adoption has not fundamentally changed how authorship is displayed. In most implementations, CRediT information appears as a static table at the end of the paper—an afterthought rather than a central organizing principle. The byline at the top remains unchanged: a linear list that implies a ranking. The rich contribution metadata exists but is structurally disconnected from the reading experience.`,
    ],
  },
  {
    id: 'bg-limits',
    title: 'Limitations of Current Approaches',
    level: 2,
    paragraphs: [
      `Current authorship display suffers from several interconnected limitations. First, the linear ordering implies a ranking that may not exist. In team science, contributions are often orthogonal: the person who built the data infrastructure, the person who designed the visualization, the person who wrote the theoretical framework, and the person who led the implementation each contribute indispensably but along entirely different dimensions. Compressing these into positions 1 through N forces a false hierarchy.`,

      `Second, the convention of "first author did most work" and "last author is the PI" is not universal. In mathematics, authors are traditionally listed alphabetically. In economics, ordering conventions vary by subfield. In high-energy physics, collaborations list hundreds of authors alphabetically. Readers from different disciplines routinely misinterpret authorship signals from other fields.`,

      `Third, the static nature of the author list conceals the temporal dynamics of contributions. Projects increasingly involve contributors who participate intensely during one phase but not others—a designer who creates the visual system, an engineer who builds critical components, a policy expert who provides essential guidance. These bounded but essential contributions are invisible in the byline.`,
    ],
  },
  {
    id: 'bg-team',
    title: 'Team Science and Rising Author Lists',
    level: 2,
    paragraphs: [
      `The average number of authors per paper has grown steadily across virtually all scientific fields. In biomedicine, papers with more than fifty authors are no longer unusual, and in fields like particle physics and climate science, author lists routinely exceed one thousand names. Even in traditionally small-team fields like psychology and economics, the median author count has roughly doubled in the past two decades.`,

      `This growth reflects a genuine change in how research happens. Modern scientific problems—from understanding complex systems to building research infrastructure—require deep specialization in design, analysis, engineering, data management, and domain knowledge that no individual or small group possesses. The question is not whether to do team science but how to credit it fairly.`,

      `Current systems fail team science in specific, quantifiable ways: infrastructure contributors (software engineers, data curators, designers) are often listed in the "author positions of least credit." Trainees who make crucial but bounded contributions face pressure to negotiate for first-author status. Senior collaborators who provide essential theoretical guidance cannot be differentiated from those added through gift authorship. A richer attribution framework would reduce these tensions by making the nature and extent of each contribution transparent.`,
    ],
  },
  {
    id: 'fw-model',
    title: 'Data Model',
    level: 2,
    paragraphs: [
      `Our framework extends the CRediT vocabulary with three additional layers of contribution information. The first layer is section-level contributions: for each section of the manuscript, we record which authors contributed and in what capacity. This mapping reflects the reality of collaborative writing—different authors draft different sections, contribute domain-specific methodology, or provide revisions to particular portions of the text.`,

      `The second layer is figure-level contributions, documenting who generated data, created visualizations, or designed the presentation for each figure and table. Given that figures often represent the most labor-intensive elements of a paper—and the elements most often reused and cited—attributing them individually adds significant granularity to the contribution record.`,

      `The third layer is a project timeline: when each contributor joined the project, key milestones in their participation, and optionally when their active contribution ended. This temporal dimension makes visible the trajectory of a project and the different phases of contribution that characterize modern collaborative research.`,

      `Each author profile includes structured metadata aligned with ORCID standards: institutional affiliations (linked to ROR IDs where available), career stage, technical competencies, and persistent identifiers. Critically, authors control the visibility of their own profile elements—from pronouns and career stage to funding sources and publication metrics—respecting individual privacy preferences while enabling rich displays for those who opt in.`,
    ],
  },
  {
    id: 'fw-sort',
    title: 'Multi-Dimensional Ordering',
    level: 2,
    paragraphs: [
      `The central design principle of our framework is that there is no single correct author ordering. Instead, the system supports dynamic re-sorting along multiple dimensions: alphabetical (forward and reverse), career seniority (both directions), number of CRediT roles, number of section contributions, number of figure contributions, project join date (both directions), institutional grouping, and—critically—by any specific CRediT role.`,

      `This last capability is particularly powerful. A reader interested in who led the conceptualization can sort by that role and immediately see the relevant contributors ranked by lead, equal, and supporting levels. A hiring committee evaluating a candidate's software contributions can sort by the Software role. A student looking for methodological expertise can sort by Methodology. Each sort dimension reveals a different facet of the contribution landscape.`,

      `By making re-sorting immediate and effortless, we shift the implicit message from "these authors are ranked" to "these authors contributed along multiple dimensions that you can explore." The default alphabetical ordering reinforces this philosophy: when no ordering is privileged, readers naturally engage with the sort controls to explore the multi-dimensional contribution space.`,
    ],
  },
  {
    id: 'fw-viz',
    title: 'Visualization Architecture',
    level: 2,
    paragraphs: [
      `The framework presents authorship information through four complementary views, each optimized for different informational needs:`,

      `The Profiles view displays structured author metadata: affiliation, career stage, CRediT roles, ORCID identifiers, and technical expertise. This view serves as the primary "who are these researchers?" interface, offering far more context than a name in a byline.`,

      `The CRediT Matrix provides a grid visualization of all fourteen contributor roles across all authors, with contribution levels encoded through color intensity. This enables immediate visual comparison—revealing, for instance, that a paper's fourth-listed author actually led three critical roles that no other author contributed to.`,

      `The Section Map shows which authors contributed to which manuscript sections, enabling readers to identify the relevant expert for any part of the paper. This is particularly valuable for readers seeking to contact the person who actually performed a specific analysis or wrote about a specific method.`,

      `The Timeline view displays each author's engagement with the project over time, including milestones, making visible the temporal structure that the linear byline completely hides. A reader can see at a glance who was involved from the beginning, who joined for a specific phase, and how the team evolved over the project's lifetime.`,
    ],
  },
  {
    id: 'fw-api',
    title: 'Machine-Readable API',
    level: 2,
    paragraphs: [
      `All contribution metadata is available through a structured API returning JSON-LD compatible responses. This enables integration with institutional repositories, bibliometric systems, research information management platforms, and digital CV tools. Funding agencies can automatically extract contribution data for grant reporting. Research evaluation systems can disaggregate contributions rather than treating all co-authored papers identically.`,

      `The API exposes endpoints for retrieving complete paper metadata with contributions, individual author profiles, specific contribution records, and aggregate statistics. Each endpoint supports content negotiation, returning JSON for programmatic access and rendered HTML for human consumption. The schema is designed for extension—new contribution dimensions can be added without breaking existing integrations.`,
    ],
  },
  {
    id: 'impl-inline',
    title: 'Inline Contribution Highlighting',
    level: 2,
    paragraphs: [
      `This article itself serves as a demonstration of inline contribution highlighting. Throughout the text, colored indicators in the margin identify which authors were primary contributors to each section. These annotations are derived from the same structured contribution data visible in the authorship panel above, creating a consistent and machine-readable record of who contributed to each part of the paper.`,

      `The color coding uses a consistent author-specific palette throughout all views, allowing readers to build familiarity with each contributor's visual identity. The indicators show not just presence but degree—lead contributors are marked prominently, while supporting contributors appear with subtler indicators. This visual hierarchy communicates the same information as the CRediT level system but integrates it directly into the reading experience.`,

      `Hovering over any author indicator reveals their specific contribution description for that section. Clicking navigates to their full profile. This creates a layered information architecture: the casual reader sees colored dots indicating "multiple people contributed here"; the curious reader can hover for details; the thorough reader can click through to full contribution records.`,
    ],
  },
  {
    id: 'impl-matrix',
    title: 'Contribution Matrix',
    level: 2,
    paragraphs: [
      `The CRediT contribution matrix (accessible via the "CRediT Matrix" tab in the authorship panel above) visually encodes the fourteen-role contribution landscape as a colored grid. Lead contributions appear with deep coloring, equal contributions with medium intensity, and supporting contributions with lighter coloring. Empty cells indicate no contribution to a given role.`,

      `This visualization makes immediately apparent what the linear byline obscures: the actual distribution of work across a research team. A "middle author" might lead three roles that no one else contributed to. The most prolific contributor in terms of CRediT roles might not be the first or last author. The visualization encourages readers to appreciate the full scope of contributions rather than relying on position-based assumptions.`,
    ],
  },
  {
    id: 'impl-timeline',
    title: 'Project Timeline',
    level: 2,
    paragraphs: [
      `The timeline view reveals the temporal dynamics of collaboration that are invisible in traditional author lists. In the present paper, contributions spanned from January 2023 (project conception by the senior author) through early 2026 (final publication), with different team members joining at different phases and some completing their contributions well before the manuscript was finished.`,

      `This temporal view makes visible a reality that every researcher knows but that the byline hides: scientific projects are dynamic, with contributors entering and leaving at different stages. The designer who created the visual system may have completed her work a year before publication. The policy advisor who shaped the theoretical framework joined midway through. The engineer who built interactive components contributed during a bounded period. Each of these contributions was essential; none of them is captured by a static author list.`,
    ],
  },
  {
    id: 'discussion',
    title: 'Discussion',
    level: 1,
    paragraphs: [
      `The framework presented here addresses a structural problem in scholarly communication that has been recognized for decades. As early as 1997, Rennie, Yank, and Emanuel argued in JAMA that traditional authorship was failing and proposed replacing it with explicit contributorship [1]. Their core insight—that a single byline cannot meaningfully represent the diverse roles within a research team—remains as urgent today as it was then, perhaps more so given the continued growth of team science documented by Wuchty, Jones, and Uzzi [2].`,

      `Our framework builds directly on the CRediT (Contributor Roles Taxonomy) standard introduced by Brand et al. in 2015 [3], which defined fourteen structured contributor roles that have since been adopted by over 5,000 journals. The call by Allen et al. in Nature to move "beyond authorship" toward transparent attribution [4] and the cross-publisher consensus statement by McNutt et al. on CRediT adoption [5] established the institutional foundation on which our work rests. Holcombe went further, arguing that CRediT should replace—not merely supplement—traditional authorship entirely [6]. We share this aspiration.`,

      `The empirical evidence for why such a shift is needed is compelling. Larivière et al. quantified how contributions actually distribute across research teams, revealing patterns far more complex than author position implies [7]. Studies have estimated that over 20% of biomedical publications involve honorary or ghost authorship [8], while Sauermann and Haeussler showed that authorship credit allocation actively shapes—and distorts—collaboration decisions [9]. Birnholtz documented how different disciplines use author ordering as fundamentally different signals, creating systematic misinterpretation across fields [10].`,

      `On the technical side, efforts by Vasilevsky et al. on the Contributor Role Ontology (CRO) have made CRediT machine-readable and linked to ORCID identifiers [11], and the FORCE11 community has driven broader adoption of structured scholarly metadata [12]. Publishers including PLOS, eLife, and Cell Press have experimented with richer author metadata displays in their article pages.`,

      `What distinguishes the present work from these prior efforts is its focus on the reader-facing display and interaction layer. The existing literature overwhelmingly addresses how to collect structured contribution data; comparatively little work has addressed what the reader actually sees. In nearly all current implementations, CRediT data appears as a static table appended to the end of an article—an afterthought disconnected from the reading experience. The byline at the top remains unchanged: a linear list that implies a ranking. Our framework closes this gap by making contribution data the organizing principle of the authorship display itself—with dynamic re-sorting, inline section-level attribution, and the explicit design choice that no single author ordering is privileged.`,

      `Several implications deserve emphasis. First, this framework makes visible the contributions of individuals who are systematically under-credited in current systems: data curators, software engineers, visualization designers, research coordinators, and technical specialists. These roles are increasingly essential to modern science but remain largely invisible in traditional author lists [7]. When a reader can sort by "Data Curation" or "Software" and see who led these contributions, the value of this work becomes self-evident.`,

      `Second, the framework reduces the stakes of author ordering by making position less consequential. When every contribution is transparently documented and can be viewed from multiple angles, the specific position in the byline matters less. This alone could significantly reduce authorship disputes—which remain among the most common and corrosive sources of friction in collaborative research [1, 8].`,

      `Third, the machine-readable nature of the contribution data opens new possibilities for research evaluation [11, 12]. Funding agencies, hiring committees, and promotion panels currently rely on crude proxies such as author position and journal prestige. Structured contribution data enables genuinely nuanced evaluation—crediting researchers for their specific role rather than assuming that "first author did most work" or "last author is the PI."`,

      `Limitations of this framework include the documentation burden on authors, the need for journal and publisher adoption, and the challenge of verifying self-reported contributions. We believe these limitations are addressable: modern submission systems already collect CRediT data [5], section-level contributions map naturally to the collaborative writing process with tools like Google Docs and Overleaf that track per-author edits, and the transparency of public contribution records itself serves as a check on misrepresentation.`,

      `The future of scientific authorship must evolve to match the reality of scientific practice. Team science is here to stay—and growing [2]. The question is whether our attribution systems will continue to compress multi-dimensional contributions into a format designed for solo scholars, or whether we will build tools that celebrate the collaborative nature of discovery and give every contributor the credit they deserve. This demonstration is our contribution to that conversation.`,
    ],
  },
  {
    id: 'references',
    title: 'References',
    level: 1,
    paragraphs: [
      `[1] Rennie, D., Yank, V., & Emanuel, L. (1997). When authorship fails: a proposal to make contributors accountable. JAMA, 278(7), 579–585.`,

      `[2] Wuchty, S., Jones, B. F., & Uzzi, B. (2007). The increasing dominance of teams in production of knowledge. Science, 316(5827), 1036–1039.`,

      `[3] Brand, A., Allen, L., Altman, M., Hlava, M., & Scott, J. (2015). Beyond authorship: attribution, contribution, collaboration, and credit. Learned Publishing, 28(2), 151–155.`,

      `[4] Allen, L., Scott, J., Brand, A., Hlava, M., & Altman, M. (2014). Publishing: credit where credit is due. Nature, 508(7496), 312–313.`,

      `[5] McNutt, M. K., Bradford, M., Drazen, J. M., Hanson, B., Howard, B., Jamieson, K. H., ... & Verma, I. M. (2018). Transparency in authors' contributions and responsibilities to promote integrity in scientific publication. Proceedings of the National Academy of Sciences, 115(11), 2557–2560.`,

      `[6] Holcombe, A. O. (2019). Contributorship, not authorship: use CRediT to indicate who did what. Publications, 7(3), 48.`,

      `[7] Larivière, V., Desrochers, N., Macaluso, B., Mongeon, P., Paul-Hus, A., & Sugimoto, C. R. (2016). Contributorship and division of labor in knowledge production. Social Studies of Science, 46(3), 417–435.`,

      `[8] Wren, J. D., Kozak, K. Z., Johnson, K. R., Deakyne, S. J., Schilling, L. M., & Dellavalle, R. P. (2007). The write position: a survey of perceived contributions to papers based on byline position and number of authors. EMBO Reports, 8(11), 988–991.`,

      `[9] Sauermann, H., & Haeussler, C. (2017). Authorship and contribution disclosures. Science Advances, 3(11), e1700404.`,

      `[10] Birnholtz, J. P. (2006). What does it mean to be an author? The intersection of credit, contribution, and collaboration in science. Journal of the American Society for Information Science and Technology, 57(13), 1758–1770.`,

      `[11] Vasilevsky, N. A., Hosseini, M., Teplitzky, S., Ilik, V., Mohammadi, E., Schneider, J., ... & Holmes, K. L. (2021). Is authorship sufficient for today's collaborative research? A call for contributor roles. Accountability in Research, 28(1), 23–43.`,

      `[12] FORCE11 (2016). FORCE11 Scholarly Communication Institute. The FAIR Guiding Principles for scientific data management and stewardship. https://force11.org/`,
    ],
  },
];
