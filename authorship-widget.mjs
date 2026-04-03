// authorship-widget.mjs — Interactive authorship explorer for MyST anywidget
// Vanilla JS implementation (no React/Preact dependency)

// ─── Constants ──────────────────────────────────────────────────

const ALL_CREDIT_ROLES = [
  'Conceptualization', 'Methodology', 'Software', 'Validation',
  'Formal analysis', 'Investigation', 'Resources', 'Data curation',
  'Writing – original draft', 'Writing – review & editing',
  'Visualization', 'Supervision', 'Project Administration', 'Funding Acquisition',
];

const ROLE_ICONS = {
  'Conceptualization': '💡', 'Methodology': '🔬', 'Software': '💻',
  'Validation': '✅', 'Formal analysis': '📊', 'Investigation': '🔍',
  'Resources': '🧰', 'Data curation': '🗄️', 'Writing – original draft': '✍️',
  'Writing – review & editing': '📝', 'Visualization': '📈',
  'Supervision': '👥', 'Project Administration': '📋', 'Funding Acquisition': '💰',
};

const AVATAR_COLORS = [
  '#4f46e5', '#0d9488', '#7c3aed', '#d97706',
  '#e11d48', '#059669', '#1e40af', '#4338ca',
];

const LEVEL_RANK = { lead: 3, equal: 2, supporting: 1 };

// ─── Utilities ──────────────────────────────────────────────────

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h);
}

function getColor(name) {
  return AVATAR_COLORS[hashStr(name) % AVATAR_COLORS.length];
}

function getInitials(name) {
  const parts = name.split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getLastName(name) {
  const parts = name.split(/\s+/);
  return parts[parts.length - 1];
}

function getFirstName(name) {
  const parts = name.split(/\s+/);
  return parts[0];
}

function normalizeRole(r) {
  return r.toLowerCase().replace(/\s+/g, ' ').replace(/—/g, '–').trim();
}

function rolesMatch(a, b) {
  return normalizeRole(a) === normalizeRole(b);
}

function findCreditLevel(author, roleName) {
  if (!author.credit_levels) return null;
  const found = author.credit_levels.find(cl => rolesMatch(cl.role, roleName));
  return found ? found.level : null;
}

function el(tag, attrs, ...children) {
  const e = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
      else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'className') e.className = v;
      else if (k === 'innerHTML') e.innerHTML = v;
      else e.setAttribute(k, v);
    }
  }
  for (const c of children) {
    if (typeof c === 'string') e.appendChild(document.createTextNode(c));
    else if (c) e.appendChild(c);
  }
  return e;
}

// ─── Sort logic ─────────────────────────────────────────────────

function sortAuthors(authors, sortKey) {
  const sorted = [...authors];

  if (sortKey.startsWith('credit:')) {
    const roleName = sortKey.slice(7);
    return sorted.sort((a, b) => {
      const aRank = LEVEL_RANK[findCreditLevel(a, roleName)] || 0;
      const bRank = LEVEL_RANK[findCreditLevel(b, roleName)] || 0;
      if (bRank !== aRank) return bRank - aRank;
      return getLastName(a.name).localeCompare(getLastName(b.name));
    });
  }

  switch (sortKey) {
    case 'alpha':
      return sorted.sort((a, b) => getLastName(a.name).localeCompare(getLastName(b.name)));
    case 'most-roles':
      return sorted.sort((a, b) => (b.credit_levels?.length || 0) - (a.credit_levels?.length || 0));
    case 'joined-first':
      return sorted.sort((a, b) => (a.timeline?.joined || '9999').localeCompare(b.timeline?.joined || '9999'));
    default:
      return sorted;
  }
}

// ─── Main render ────────────────────────────────────────────────

function render({ model, el: rootEl }) {
  const authorsRaw = model.get('authors');
  const parsed = typeof authorsRaw === 'string' ? JSON.parse(authorsRaw) : authorsRaw;

  // Unpack envelope: { primary: [...], alt?: [...], alt2?: [...] }
  // or fall back to legacy flat array format
  let authors, authorsAlt, altLabel, authorsAlt2, alt2Label;
  if (Array.isArray(parsed)) {
    authors = parsed;
    authorsAlt = null;
    altLabel = 'Simulated large team';
    authorsAlt2 = null;
    alt2Label = 'Real contributors';
  } else {
    authors = parsed.primary || [];
    authorsAlt = parsed.alt || null;
    altLabel = parsed.altLabel || 'Simulated large team';
    authorsAlt2 = parsed.alt2 || null;
    alt2Label = parsed.alt2Label || 'Real contributors';
  }
  const hasToggle = !!(authorsAlt && authorsAlt.length) || !!(authorsAlt2 && authorsAlt2.length);

  if (!authors || !authors.length) {
    rootEl.appendChild(el('p', {}, 'No author data available.'));
    return;
  }

  // Hide the default MyST author/affiliation grid and move widget into frontmatter
  const hostDoc = rootEl.getRootNode() === rootEl.ownerDocument
    ? rootEl.ownerDocument
    : rootEl.getRootNode()?.host?.ownerDocument || document;
  if (!hostDoc.getElementById('ae-hide-default-authors')) {
    const hideStyle = hostDoc.createElement('style');
    hideStyle.id = 'ae-hide-default-authors';
    hideStyle.textContent = '.myst-fm-authors-affiliations { display: none !important; }';
    hostDoc.head.appendChild(hideStyle);
  }

  // Move widget host element into frontmatter, between title and abstract
  const shadowHost = rootEl.getRootNode()?.host;
  if (shadowHost) {
    const fmTitle = hostDoc.querySelector('.myst-fm-block-title');
    const fmAbstract = hostDoc.querySelector('.myst-fm-parts, .myst-abstract');
    const fmDateDoi = hostDoc.querySelector('.myst-fm-block-date-doi');
    const insertBefore = fmDateDoi || fmAbstract;
    if (fmTitle && insertBefore && !shadowHost.dataset.aeMoved) {
      shadowHost.dataset.aeMoved = '1';
      insertBefore.parentNode.insertBefore(shadowHost, insertBefore);
    }
  }

  // State
  let sortKey = 'alpha';
  let expanded = true;
  let activeTab = 'network';
  let showCreditMenu = false;
  let authorMode = 'simulated'; // 'simulated' or 'real'

  function rerender() {
    // Build new content first, then swap to avoid flash/blink
    const newWidget = buildWidget();
    const oldWidget = rootEl.querySelector('.ae-widget');
    if (oldWidget) {
      oldWidget.replaceWith(newWidget);
    } else {
      const preserved = [...rootEl.querySelectorAll('link[rel="stylesheet"], style')];
      rootEl.innerHTML = '';
      preserved.forEach(n => rootEl.appendChild(n));
      rootEl.appendChild(newWidget);
    }
  }

  function getActiveAuthors() {
    if (authorMode === 'large') return authorsAlt || authors;
    if (authorMode === 'real') return authorsAlt2 || authors;
    return authors;
  }

  function buildWidget() {
    const activeAuthors = getActiveAuthors();
    const sorted = sortAuthors(activeAuthors, sortKey);

    const container = el('div', { className: 'ae-widget' });

    // ──── Dataset toggle ────
    if (hasToggle) {
      const toggle = el('div', { className: 'ae-mode-toggle' });
      toggle.appendChild(el('button', {
        className: `ae-mode-btn ${authorMode === 'simulated' ? 'ae-mode-active' : ''}`,
        onClick: () => { authorMode = 'simulated'; sortKey = 'alpha'; rerender(); },
      }, 'Simulated small team'));
      if (authorsAlt && authorsAlt.length) {
        toggle.appendChild(el('button', {
          className: `ae-mode-btn ${authorMode === 'large' ? 'ae-mode-active' : ''}`,
          onClick: () => { authorMode = 'large'; sortKey = 'alpha'; rerender(); },
        }, altLabel));
      }
      if (authorsAlt2 && authorsAlt2.length) {
        toggle.appendChild(el('button', {
          className: `ae-mode-btn ${authorMode === 'real' ? 'ae-mode-active' : ''}`,
          onClick: () => { authorMode = 'real'; sortKey = 'alpha'; rerender(); },
        }, alt2Label));
      }
      container.appendChild(toggle);

      // Disclaimer for simulated modes
      if (authorMode === 'simulated' || authorMode === 'large') {
        container.appendChild(el('p', { className: 'ae-mode-note' },
          'The simulated team and their contributions are fictional, for demonstration purposes only.'));
      }
    }

    // ──── Title ────
    const titleBar = el('div', { className: 'ae-title-bar' },
      el('h3', { className: 'ae-title' }, 'Contributors'),
      el('span', { className: 'ae-title-count' }, `${sorted.length} authors`),
    );
    container.appendChild(titleBar);

    // ──── Panel (always visible) ────
    const panel = el('div', { className: 'ae-panel' });

    // Tabs
    const tabs = el('div', { className: 'ae-tabs' });
    const tabDefs = [
      { id: 'network', label: 'Collaboration' },
      { id: 'matrix', label: 'CRediT' },
      { id: 'sections', label: 'Sections' },
      { id: 'timeline', label: 'Timeline' },
      { id: 'authors', label: 'Sorted List' },
      { id: 'profiles', label: 'Profiles' },
    ];
    for (const t of tabDefs) {
      tabs.appendChild(el('button', {
        className: `ae-tab ${activeTab === t.id ? 'ae-tab-active' : ''}`,
        onClick: () => { activeTab = t.id; rerender(); },
      }, t.label));
    }
    panel.appendChild(tabs);

    // Tab content
    const content = el('div', { className: 'ae-tab-content' });

    if (activeTab === 'authors') {
      content.appendChild(buildAuthorListTab());
    } else if (activeTab === 'network') {
      content.appendChild(buildNetworkTab(sorted));
    } else if (activeTab === 'profiles') {
      content.appendChild(buildProfilesTab(sorted));
    } else if (activeTab === 'matrix') {
      content.appendChild(buildMatrixTab(sorted));
    } else if (activeTab === 'sections') {
      content.appendChild(buildSectionsTab(sorted));
    } else if (activeTab === 'timeline') {
      content.appendChild(buildTimelineTab(sorted));
    }

    panel.appendChild(content);
    container.appendChild(panel);

    return container;
  }

  // ──── Author List tab ────
  function buildAuthorListTab() {
    const activeAuthors = getActiveAuthors();
    const isCreditSort = sortKey.startsWith('credit:');
    const resorted = sortAuthors(activeAuthors, sortKey);
    const wrap = el('div', { className: 'ae-author-list-tab' });

    // Sort bar
    const sortBar = el('div', { className: 'ae-sort-bar' });

    const sortHeader = el('div', { className: 'ae-sort-header' },
      el('span', { className: 'ae-label' }, 'Authors'),
      el('span', { className: 'ae-count' }, String(activeAuthors.length)),
      el('span', { className: 'ae-sep' }, '|'),
      el('span', { className: 'ae-sublabel' }, 'Order by:'),
    );
    sortBar.appendChild(sortHeader);

    const chips = el('div', { className: 'ae-chips' });

    // A→Z chip
    chips.appendChild(el('button', {
      className: `ae-chip ${sortKey === 'alpha' ? 'ae-chip-active' : ''}`,
      onClick: () => { sortKey = 'alpha'; rerender(); },
    }, '🔤 A → Z'));

    // CRediT Role dropdown
    const creditWrap = el('div', { className: 'ae-credit-wrap' });
    const creditBtn = el('button', {
      className: `ae-chip ${isCreditSort ? 'ae-chip-active' : ''}`,
      onClick: () => { showCreditMenu = !showCreditMenu; rerender(); },
    }, '🏷️ CRediT Role ▾');
    creditWrap.appendChild(creditBtn);

    if (showCreditMenu) {
      const menu = el('div', { className: 'ae-credit-menu ae-credit-menu-fixed' });
      menu.appendChild(el('div', { className: 'ae-credit-menu-title' }, 'Sort by specific CRediT role'));
      for (const role of ALL_CREDIT_ROLES) {
        const key = `credit:${role}`;
        const icon = ROLE_ICONS[role] || '🏷️';
        const isActive = sortKey === key;
        const item = el('button', {
          className: `ae-credit-item ${isActive ? 'ae-credit-item-active' : ''}`,
          onClick: () => { sortKey = key; showCreditMenu = false; rerender(); },
        },
          el('span', { className: 'ae-credit-icon' }, icon),
          el('span', {}, role),
          isActive ? el('span', { className: 'ae-check' }, '✓') : null,
        );
        menu.appendChild(item);
      }
      creditWrap.appendChild(menu);
      // Position the menu after it's in the DOM
      requestAnimationFrame(() => {
        const btnRect = creditBtn.getBoundingClientRect();
        menu.style.top = (btnRect.bottom + 4) + 'px';
        menu.style.left = btnRect.left + 'px';
      });
      const backdrop = el('div', { className: 'ae-backdrop', onClick: () => { showCreditMenu = false; rerender(); } });
      creditWrap.appendChild(backdrop);
    }
    chips.appendChild(creditWrap);

    // Most roles
    chips.appendChild(el('button', {
      className: `ae-chip ${sortKey === 'most-roles' ? 'ae-chip-active' : ''}`,
      onClick: () => { sortKey = 'most-roles'; rerender(); },
    }, '🏷️ Most roles'));

    // Joined first
    chips.appendChild(el('button', {
      className: `ae-chip ${sortKey === 'joined-first' ? 'ae-chip-active' : ''}`,
      onClick: () => { sortKey = 'joined-first'; rerender(); },
    }, '⏳ Joined first'));

    sortBar.appendChild(chips);

    // Sort description
    let sortDesc = 'Alphabetical by last name';
    if (sortKey === 'most-roles') sortDesc = 'By number of CRediT roles';
    else if (sortKey === 'joined-first') sortDesc = 'By project join date (earliest first)';
    else if (isCreditSort) sortDesc = `By "${sortKey.slice(7)}" — lead → equal → supporting → none`;
    sortBar.appendChild(el('p', { className: 'ae-sort-desc' }, `Sorted: ${sortDesc}`));

    wrap.appendChild(sortBar);

    // Build unique affiliation list with indices
    const affList = []; // [{name, dept, id}]
    const affIndexMap = new Map(); // affiliation key -> 1-based index
    function getAffKey(aff) {
      if (typeof aff === 'string') return aff;
      return aff.id || aff.name || JSON.stringify(aff);
    }
    function getAffLabel(aff) {
      if (typeof aff === 'string') return aff;
      let label = aff.name || aff.id || '';
      if (aff.department) label = `${aff.department}, ${label}`;
      if (aff.city) label += `, ${aff.city}`;
      if (aff.country) label += `, ${aff.country}`;
      return label;
    }
    resorted.forEach(author => {
      if (!author.affiliations) return;
      author.affiliations.forEach(aff => {
        const key = getAffKey(aff);
        if (!affIndexMap.has(key)) {
          affIndexMap.set(key, affList.length + 1);
          affList.push(aff);
        }
      });
    });

    // Author names with superscript affiliation numbers
    const namesList = el('div', { className: 'ae-names' });
    resorted.forEach((author, i) => {
      const isLast = i === resorted.length - 1;
      const span = el('span', { className: 'ae-name-wrap' });

      const nameBtn = el('button', { className: 'ae-name' }, author.name);
      span.appendChild(nameBtn);

      // Superscript affiliation numbers
      if (author.affiliations?.length && affList.length > 0) {
        const indices = author.affiliations.map(aff => affIndexMap.get(getAffKey(aff))).filter(Boolean);
        if (indices.length) {
          span.appendChild(el('sup', { className: 'ae-aff-sup' }, indices.join(',')));
        }
      }

      if (isCreditSort) {
        const level = findCreditLevel(author, sortKey.slice(7));
        if (level) {
          const badge = el('span', {
            className: `ae-level-badge ae-level-${level}`,
          }, level === 'lead' ? 'L' : level === 'equal' ? 'E' : 'S');
          span.appendChild(badge);
        }
      }

      if (author.corresponding) {
        span.appendChild(el('span', { className: 'ae-corresponding', title: 'Corresponding author' }, '✉'));
      }

      if (!isLast) span.appendChild(el('span', { className: 'ae-comma' }, ', '));
      namesList.appendChild(span);
    });
    wrap.appendChild(namesList);

    // Numbered affiliations list
    if (affList.length) {
      const affDiv = el('div', { className: 'ae-affiliations ae-aff-numbered' });
      affList.forEach((aff, idx) => {
        const line = el('div', { className: 'ae-aff-line' });
        line.appendChild(el('sup', { className: 'ae-aff-sup' }, String(idx + 1)));
        line.appendChild(document.createTextNode(' ' + getAffLabel(aff)));
        affDiv.appendChild(line);
      });
      wrap.appendChild(affDiv);
    }

    if (isCreditSort) {
      const legend = el('span', { className: 'ae-legend' });
      legend.appendChild(el('span', { className: 'ae-legend-dot ae-dot-lead' }));
      legend.appendChild(document.createTextNode('Lead '));
      legend.appendChild(el('span', { className: 'ae-legend-dot ae-dot-equal' }));
      legend.appendChild(document.createTextNode('Equal '));
      legend.appendChild(el('span', { className: 'ae-legend-dot ae-dot-supporting' }));
      legend.appendChild(document.createTextNode('Supporting'));
      wrap.appendChild(legend);
    }

    return wrap;
  }

  // ──── Profiles tab ────
  function buildProfilesTab(sorted) {
    const wrap = el('div', { className: 'ae-profiles' });
    for (const author of sorted) {
      const color = getColor(author.name);
      const card = el('div', { className: 'ae-profile-card' });

      // Avatar
      const avatar = el('div', {
        className: 'ae-avatar',
        style: { backgroundColor: color },
      }, getInitials(author.name));
      if (author.corresponding) {
        avatar.appendChild(el('span', { className: 'ae-avatar-badge' }, '✉'));
      }
      card.appendChild(avatar);

      // Info
      const info = el('div', { className: 'ae-profile-info' });
      const nameRow = el('div', { className: 'ae-profile-name-row' });
      nameRow.appendChild(el('span', { className: 'ae-profile-name' }, author.name));
      if (author.career_stage) {
        nameRow.appendChild(el('span', { className: 'ae-career-stage' }, author.career_stage));
      }
      if (author.orcid) {
        const orcidLink = el('a', {
          href: `https://orcid.org/${author.orcid}`,
          target: '_blank',
          rel: 'noopener noreferrer',
          className: 'ae-orcid-link',
          title: 'ORCID',
        }, '🆔');
        nameRow.appendChild(orcidLink);
      }
      info.appendChild(nameRow);

      // Affiliations
      if (author.affiliations?.length) {
        const affText = author.affiliations
          .map(a => typeof a === 'string' ? a : (a.name || a))
          .join(' · ');
        info.appendChild(el('p', { className: 'ae-profile-aff' }, affText));
      }

      // Social links
      if (author.social_links?.length) {
        const links = el('div', { className: 'ae-social-links' });
        for (const link of author.social_links) {
          const icon = { orcid: '🆔', github: '🐙', 'google-scholar': '🎓', website: '🌐', twitter: '𝕏', bluesky: '🦋', linkedin: '💼', email: '✉️' }[link.platform] || '🔗';
          links.appendChild(el('a', {
            href: link.url,
            target: '_blank',
            rel: 'noopener noreferrer',
            className: 'ae-social-link',
            title: link.platform,
          }, icon));
        }
        info.appendChild(links);
      }

      card.appendChild(info);

      // Roles
      const roles = el('div', { className: 'ae-profile-roles' });
      const creditLevels = author.credit_levels || [];
      const topRoles = creditLevels.slice(0, 4);
      for (const cr of topRoles) {
        roles.appendChild(el('span', {
          className: `ae-role-badge ae-role-${cr.level}`,
        }, cr.role.replace('Writing – ', 'W: ').replace('Formal ', 'F. ')));
      }
      if (creditLevels.length > 4) {
        roles.appendChild(el('span', { className: 'ae-role-badge ae-role-more' }, `+${creditLevels.length - 4}`));
      }
      card.appendChild(roles);

      wrap.appendChild(card);
    }
    return wrap;
  }

  // ──── CRediT Matrix tab ────
  function buildMatrixTab(sorted) {
    const wrap = el('div', { className: 'ae-matrix-wrap' });
    const table = el('table', { className: 'ae-matrix' });

    // Header row with author avatars
    const thead = el('thead');
    const headerRow = el('tr');
    headerRow.appendChild(el('th', { className: 'ae-matrix-corner' }));
    for (const author of sorted) {
      const color = getColor(author.name);
      const th = el('th', { className: 'ae-matrix-author-th' });
      th.appendChild(el('div', {
        className: 'ae-matrix-avatar',
        style: { backgroundColor: color },
      }, getInitials(author.name)));
      th.appendChild(el('div', { className: 'ae-matrix-author-name' }, author.name));
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Role rows
    const tbody = el('tbody');
    for (const role of ALL_CREDIT_ROLES) {
      const row = el('tr');
      const icon = ROLE_ICONS[role] || '🏷️';
      row.appendChild(el('td', { className: 'ae-matrix-role' },
        el('span', { className: 'ae-matrix-role-icon' }, icon),
        el('span', {}, role),
      ));

      for (const author of sorted) {
        const level = findCreditLevel(author, role);
        const td = el('td', { className: 'ae-matrix-cell' });
        if (level) {
          const dot = el('div', {
            className: `ae-dot ae-dot-${level}`,
            title: `${author.name}: ${level}`,
          });
          td.appendChild(dot);
        }
        row.appendChild(td);
      }
      tbody.appendChild(row);
    }
    table.appendChild(tbody);
    wrap.appendChild(table);

    // Legend
    const legend = el('div', { className: 'ae-matrix-legend' });
    legend.appendChild(el('span', { className: 'ae-legend-label' }, 'Legend:'));
    legend.appendChild(el('span', { className: 'ae-legend-dot ae-dot-lead' }));
    legend.appendChild(document.createTextNode(' Lead  '));
    legend.appendChild(el('span', { className: 'ae-legend-dot ae-dot-equal' }));
    legend.appendChild(document.createTextNode(' Equal  '));
    legend.appendChild(el('span', { className: 'ae-legend-dot ae-dot-supporting' }));
    legend.appendChild(document.createTextNode(' Supporting'));
    wrap.appendChild(legend);

    return wrap;
  }

  // ──── Section Map tab ────
  function buildSectionsTab(sorted) {
    const wrap = el('div', { className: 'ae-sections' });

    // Collect all sections
    const sectionMap = new Map();
    for (const author of sorted) {
      if (!author.section_contributions) continue;
      for (const sc of author.section_contributions) {
        if (!sectionMap.has(sc.section)) sectionMap.set(sc.section, []);
        sectionMap.get(sc.section).push({ author, ...sc });
      }
    }

    const effortRank = { lead: 3, equal: 2, supporting: 1 };

    for (const [sectionId, contribs] of sectionMap) {
      contribs.sort((a, b) => (effortRank[b.effort] || 0) - (effortRank[a.effort] || 0));

      const section = el('div', { className: 'ae-section-block' });
      section.appendChild(el('div', { className: 'ae-section-id' }, sectionId));

      const contributors = el('div', { className: 'ae-section-contributors' });
      for (const c of contribs) {
        const color = getColor(c.author.name);
        const chip = el('div', { className: 'ae-section-chip' });
        chip.appendChild(el('div', {
          className: 'ae-section-avatar',
          style: { backgroundColor: color },
        }, getInitials(c.author.name)));
        const info = el('div', { className: 'ae-section-chip-info' });
        info.appendChild(el('span', { className: 'ae-section-chip-name' }, c.author.name));
        if (c.effort) {
          info.appendChild(el('span', { className: `ae-effort ae-effort-${c.effort}` }, c.effort));
        }
        if (c.description) {
          info.appendChild(el('p', { className: 'ae-section-chip-desc' }, c.description));
        }
        chip.appendChild(info);
        contributors.appendChild(chip);
      }
      section.appendChild(contributors);
      wrap.appendChild(section);
    }

    if (sectionMap.size === 0) {
      wrap.appendChild(el('p', { className: 'ae-empty' }, 'No section contribution data available.'));
    }

    return wrap;
  }

  // ──── Network / Chord diagram tab ────
  // Role category colors (matches original CollaborationGraph)
  const ROLE_CAT = {
    'conceptualization': { color: '#4c6ef5', cat: 'Thinking' },
    'methodology':       { color: '#4c6ef5', cat: 'Thinking' },
    'formal analysis':   { color: '#4c6ef5', cat: 'Thinking' },
    'software':          { color: '#10b981', cat: 'Doing' },
    'validation':        { color: '#10b981', cat: 'Doing' },
    'investigation':     { color: '#10b981', cat: 'Doing' },
    'data curation':     { color: '#10b981', cat: 'Doing' },
    'resources':         { color: '#10b981', cat: 'Doing' },
    'writing – original draft':   { color: '#f59e0b', cat: 'Writing' },
    'writing – review & editing': { color: '#f59e0b', cat: 'Writing' },
    'visualization':     { color: '#f59e0b', cat: 'Writing' },
    'supervision':       { color: '#8b5cf6', cat: 'Leading' },
    'project administration': { color: '#8b5cf6', cat: 'Leading' },
    'funding acquisition':    { color: '#8b5cf6', cat: 'Leading' },
  };
  const LEVEL_OPACITY = { lead: 1.0, equal: 0.7, supporting: 0.4 };
  const LEGEND_CATS = [
    { label: 'Thinking', color: '#4c6ef5', roles: 'Concept · Method · Analysis' },
    { label: 'Doing', color: '#10b981', roles: 'Software · Validation · Investigation · Data · Resources' },
    { label: 'Writing', color: '#f59e0b', roles: 'Drafting · Editing · Visualization' },
    { label: 'Leading', color: '#8b5cf6', roles: 'Supervision · Administration · Funding' },
  ];

  function getRoleCat(roleName) {
    const key = normalizeRole(roleName);
    return ROLE_CAT[key] || { color: '#94a3b8', cat: 'Other' };
  }

  function buildNetworkTab(sorted) {
    const wrap = el('div', { className: 'ae-network' });
    const n = sorted.length;
    const ns = 'http://www.w3.org/2000/svg';
    if (n === 0) {
      wrap.appendChild(el('p', { className: 'ae-empty' }, 'No author data available.'));
      return wrap;
    }

    // Compute per-author roles with colors
    const authorRoles = sorted.map(a => {
      const levels = a.credit_levels || [];
      return levels.map(cl => ({
        role: cl.role,
        level: cl.level,
        color: getRoleCat(cl.role).color,
        opacity: LEVEL_OPACITY[cl.level] || 0.4,
      }));
    });

    // Build section-based edges (shared sections between authors)
    const sectionAuthors = new Map();
    for (let i = 0; i < n; i++) {
      const secs = sorted[i].section_contributions || [];
      for (const sc of secs) {
        const secId = sc.section;
        const arr = sectionAuthors.get(secId) || [];
        arr.push(i);
        sectionAuthors.set(secId, arr);
      }
    }
    const edgeMap = new Map();
    for (const [secId, authIdxs] of sectionAuthors) {
      for (let i = 0; i < authIdxs.length; i++) {
        for (let j = i + 1; j < authIdxs.length; j++) {
          const key = [authIdxs[i], authIdxs[j]].sort().join('::');
          const set = edgeMap.get(key) || new Set();
          set.add(secId);
          edgeMap.set(key, set);
        }
      }
    }

    // Also add CRediT-role-based edges
    const links = [];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const key = [i, j].sort().join('::');
        const sharedRoles = [];
        for (const role of ALL_CREDIT_ROLES) {
          const aL = findCreditLevel(sorted[i], role);
          const bL = findCreditLevel(sorted[j], role);
          if (aL && bL) sharedRoles.push({ role, color: getRoleCat(role).color });
        }
        const sharedSections = edgeMap.get(key) ? [...edgeMap.get(key)] : [];
        if (sharedRoles.length > 0 || sharedSections.length > 0) {
          links.push({ i, j, sharedRoles, sharedSections, weight: sharedRoles.length + sharedSections.length });
        }
      }
    }
    const maxWeight = Math.max(1, ...links.map(l => l.weight));

    // SVG dimensions — scale up for large teams
    const isLarge = n > 20;
    const W = isLarge ? 900 : 600;
    const H = isLarge ? 900 : 480;
    const CX = W / 2, CY = H / 2;
    const ORBIT = Math.min(W, H) * (isLarge ? 0.38 : 0.32);

    // Compute node sizes — smaller for large teams
    const maxRoles = Math.max(1, ...sorted.map((a, i) => authorRoles[i].length));
    const nodeData = sorted.map((a, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      const roles = authorRoles[i];
      const secCount = (a.section_contributions || []).length;
      const weight = roles.length + secCount;
      const minR = isLarge ? 10 : 20;
      const maxR = isLarge ? 22 : 44;
      const radius = minR + ((weight / (maxRoles + 10)) * (maxR - minR));
      return {
        x: CX + ORBIT * Math.cos(angle),
        y: CY + ORBIT * Math.sin(angle),
        radius, roles, angle,
        name: a.name,
        firstName: getFirstName(a.name),
        lastName: getLastName(a.name),
        careerStage: a.career_stage || '',
        roleCount: roles.length,
        secCount,
        color: getColor(a.name),
      };
    });

    // Hover state
    let hoveredIdx = null;

    function renderSVG() {
      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      svg.setAttribute('class', 'ae-network-svg');
      svg.style.width = '100%';
      svg.style.maxWidth = W + 'px';
      svg.style.height = 'auto';
      svg.style.display = 'block';
      svg.style.margin = '0 auto';

      // Background glow
      const defs = document.createElementNS(ns, 'defs');
      const grad = document.createElementNS(ns, 'radialGradient');
      grad.setAttribute('id', 'ae-bg-glow');
      grad.setAttribute('cx', '50%'); grad.setAttribute('cy', '45%'); grad.setAttribute('r', '50%');
      const s1 = document.createElementNS(ns, 'stop');
      s1.setAttribute('offset', '0%'); s1.setAttribute('stop-color', '#dbe4ff'); s1.setAttribute('stop-opacity', '0.3');
      const s2 = document.createElementNS(ns, 'stop');
      s2.setAttribute('offset', '100%'); s2.setAttribute('stop-color', 'white'); s2.setAttribute('stop-opacity', '0');
      grad.appendChild(s1); grad.appendChild(s2); defs.appendChild(grad); svg.appendChild(defs);

      const bgCircle = document.createElementNS(ns, 'circle');
      bgCircle.setAttribute('cx', String(CX)); bgCircle.setAttribute('cy', String(CY));
      bgCircle.setAttribute('r', String(ORBIT + 60)); bgCircle.setAttribute('fill', 'url(#ae-bg-glow)');
      svg.appendChild(bgCircle);

      // Draw edges — parallel colored strands per shared role
      for (const link of links) {
        const s = nodeData[link.i], t = nodeData[link.j];
        const isHL = hoveredIdx === link.i || hoveredIdx === link.j;
        const isDim = hoveredIdx !== null && !isHL;
        const baseOpacity = isDim ? 0.05 : isHL ? 0.7 : (isLarge ? 0.1 : 0.25);

        const dx = t.x - s.x, dy = t.y - s.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = -dy / len, ny = dx / len;

        const midX = (s.x + t.x) / 2 + (CX - (s.x + t.x) / 2) * 0.4;
        const midY = (s.y + t.y) / 2 + (CY - (s.y + t.y) / 2) * 0.4;

        const strandW = 2.0, gap = strandW + 0.8;
        const strands = link.sharedRoles;
        const bandW = strands.length * gap;
        let offset = -bandW / 2 + gap / 2;

        for (const sr of strands) {
          const ox = nx * offset, oy = ny * offset;
          const path = document.createElementNS(ns, 'path');
          path.setAttribute('d', `M${s.x + ox},${s.y + oy} Q${midX + ox},${midY + oy} ${t.x + ox},${t.y + oy}`);
          path.setAttribute('fill', 'none');
          path.setAttribute('stroke', sr.color);
          path.setAttribute('stroke-width', String(strandW));
          path.setAttribute('stroke-opacity', String(baseOpacity));
          path.setAttribute('stroke-linecap', 'round');
          path.setAttribute('class', 'ae-chord');
          const title = document.createElementNS(ns, 'title');
          title.textContent = `${sorted[link.i].name} ↔ ${sorted[link.j].name}\n${sr.role}`;
          path.appendChild(title);
          svg.appendChild(path);
          offset += gap;
        }
      }

      // Draw nodes with role ring arcs
      for (let idx = 0; idx < n; idx++) {
        const nd = nodeData[idx];
        const isHovered = hoveredIdx === idx;
        const isDim = hoveredIdx !== null && !isHovered;
        const groupOpacity = isDim ? 0.3 : 1;

        const g = document.createElementNS(ns, 'g');
        g.style.cursor = 'pointer';
        g.style.opacity = String(groupOpacity);
        g.style.transition = 'opacity 0.2s';

        // Role ring: segmented arcs
        const ringR = nd.radius + 5;
        const arcGap = 0.06;
        const roles = nd.roles;
        const totalAngle = 2 * Math.PI - roles.length * arcGap;
        const segAngle = roles.length > 0 ? totalAngle / roles.length : 0;

        for (let ri = 0; ri < roles.length; ri++) {
          const startA = -Math.PI / 2 + ri * (segAngle + arcGap);
          const endA = startA + segAngle;
          const arcS = { x: nd.x + ringR * Math.cos(startA), y: nd.y + ringR * Math.sin(startA) };
          const arcE = { x: nd.x + ringR * Math.cos(endA), y: nd.y + ringR * Math.sin(endA) };
          const largeArc = (endA - startA) > Math.PI ? 1 : 0;
          const arc = document.createElementNS(ns, 'path');
          arc.setAttribute('d', `M ${arcS.x} ${arcS.y} A ${ringR} ${ringR} 0 ${largeArc} 1 ${arcE.x} ${arcE.y}`);
          arc.setAttribute('stroke', roles[ri].color);
          arc.setAttribute('stroke-width', '4');
          arc.setAttribute('stroke-linecap', 'round');
          arc.setAttribute('fill', 'none');
          arc.setAttribute('opacity', String(roles[ri].opacity));
          const arcTitle = document.createElementNS(ns, 'title');
          arcTitle.textContent = `${roles[ri].role} (${roles[ri].level})`;
          arc.appendChild(arcTitle);
          g.appendChild(arc);
        }

        // Shadow
        const shadow = document.createElementNS(ns, 'circle');
        shadow.setAttribute('cx', String(nd.x)); shadow.setAttribute('cy', String(nd.y + 2));
        shadow.setAttribute('r', String(nd.radius));
        shadow.setAttribute('fill', 'black'); shadow.setAttribute('opacity', '0.08');
        g.appendChild(shadow);

        // Main circle
        const circle = document.createElementNS(ns, 'circle');
        circle.setAttribute('cx', String(nd.x)); circle.setAttribute('cy', String(nd.y));
        circle.setAttribute('r', String(nd.radius));
        circle.setAttribute('fill', nd.color);
        circle.setAttribute('stroke', 'white'); circle.setAttribute('stroke-width', '3');
        g.appendChild(circle);

        // Hover ring
        if (isHovered) {
          const hRing = document.createElementNS(ns, 'circle');
          hRing.setAttribute('cx', String(nd.x)); hRing.setAttribute('cy', String(nd.y));
          hRing.setAttribute('r', String(nd.radius + 2));
          hRing.setAttribute('fill', 'none');
          hRing.setAttribute('stroke', nd.color); hRing.setAttribute('stroke-width', '2');
          hRing.setAttribute('opacity', '0.4');
          g.appendChild(hRing);
        }

        // Initials
        const init = document.createElementNS(ns, 'text');
        init.setAttribute('x', String(nd.x)); init.setAttribute('y', String(nd.y + 1));
        init.setAttribute('text-anchor', 'middle'); init.setAttribute('dominant-baseline', 'central');
        init.setAttribute('fill', '#fff');
        init.setAttribute('font-size', String(nd.radius * 0.55));
        init.setAttribute('font-weight', '700');
        init.setAttribute('font-family', 'Inter, system-ui, sans-serif');
        init.style.pointerEvents = 'none';
        init.textContent = getInitials(nd.name);
        g.appendChild(init);

        // Name label below
        const labelFontSize = isLarge ? '8' : '11';
        const label = document.createElementNS(ns, 'text');
        label.setAttribute('x', String(nd.x)); label.setAttribute('y', String(nd.y + nd.radius + (isLarge ? 12 : 18)));
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('fill', isHovered ? '#1e3a5f' : '#64748b');
        label.setAttribute('font-size', labelFontSize);
        label.setAttribute('font-weight', isHovered ? '600' : '400');
        label.setAttribute('font-family', 'Inter, system-ui, sans-serif');
        label.style.pointerEvents = 'none';
        label.textContent = isLarge ? nd.lastName : `${nd.firstName} ${nd.lastName}`;
        g.appendChild(label);

        // Career stage on hover
        if (isHovered && nd.careerStage) {
          const cs = document.createElementNS(ns, 'text');
          cs.setAttribute('x', String(nd.x)); cs.setAttribute('y', String(nd.y + nd.radius + 31));
          cs.setAttribute('text-anchor', 'middle');
          cs.setAttribute('fill', '#94a3b8'); cs.setAttribute('font-size', '9.5');
          cs.setAttribute('font-family', 'Inter, system-ui, sans-serif');
          cs.style.pointerEvents = 'none';
          cs.textContent = nd.careerStage;
          g.appendChild(cs);
        }

        // Hover events
        g.addEventListener('mouseenter', () => { hoveredIdx = idx; rerenderNetwork(); });
        g.addEventListener('mouseleave', () => { hoveredIdx = null; rerenderNetwork(); });

        svg.appendChild(g);
      }

      return svg;
    }

    // Info card
    function renderInfoCard() {
      if (hoveredIdx === null) return null;
      const nd = nodeData[hoveredIdx];
      const authorEdges = links.filter(l => l.i === hoveredIdx || l.j === hoveredIdx);
      const totalShared = authorEdges.reduce((s, l) => s + l.sharedRoles.length, 0);

      // Position card on opposite side from hovered author
      const onRight = nd.x > CX;
      const onBottom = nd.y > CY;
      const cardStyle = {};
      if (onRight) { cardStyle.left = '12px'; cardStyle.right = 'auto'; }
      else { cardStyle.right = '12px'; cardStyle.left = 'auto'; }
      if (onBottom) { cardStyle.top = '12px'; cardStyle.bottom = 'auto'; }
      else { cardStyle.bottom = '12px'; cardStyle.top = 'auto'; }

      const card = el('div', { className: 'ae-info-card', style: cardStyle },
        el('p', { className: 'ae-info-name' }, nd.name),
        el('p', { className: 'ae-info-stage' }, nd.careerStage),
        el('div', { className: 'ae-info-stats' },
          el('p', {}, el('strong', {}, String(nd.roleCount)), ' CRediT roles'),
          el('p', {}, el('strong', {}, String(nd.secCount)), ' sections'),
          el('p', {}, el('strong', {}, String(totalShared)), ' shared role links'),
        ),
      );

      // Role badges
      const badges = el('div', { className: 'ae-info-badges' });
      for (const r of nd.roles) {
        const badge = el('span', {
          className: 'ae-info-badge',
          style: { backgroundColor: r.color, opacity: r.opacity },
        }, r.role.replace('Writing – ', '').replace('Formal ', '').slice(0, 14));
        badges.appendChild(badge);
      }
      card.appendChild(badges);
      return card;
    }

    // Container for SVG + info card
    const graphWrap = el('div', { className: 'ae-network-graph' });

    // Zoom/pan state — operates on SVG viewBox for crisp rendering
    let vbX = 0, vbY = 0, vbW = W, vbH = H; // viewBox state
    let isPanning = false, panStartX = 0, panStartY = 0, panStartVbX = 0, panStartVbY = 0;

    function applyViewBox() {
      const svg = graphWrap.querySelector('.ae-network-svg');
      if (svg) svg.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);
    }

    graphWrap.addEventListener('wheel', (e) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1.1 : 0.9;
      const newW = Math.max(W * 0.2, Math.min(W * 2, vbW * factor));
      const newH = Math.max(H * 0.2, Math.min(H * 2, vbH * factor));
      // Zoom toward mouse position
      const rect = graphWrap.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      vbX += (vbW - newW) * mx;
      vbY += (vbH - newH) * my;
      vbW = newW;
      vbH = newH;
      applyViewBox();
    }, { passive: false });

    graphWrap.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      isPanning = true;
      panStartX = e.clientX;
      panStartY = e.clientY;
      panStartVbX = vbX;
      panStartVbY = vbY;
      graphWrap.style.cursor = 'grabbing';
    });

    graphWrap.addEventListener('mousemove', (e) => {
      if (!isPanning) return;
      const rect = graphWrap.getBoundingClientRect();
      const scaleX = vbW / rect.width;
      const scaleY = vbH / rect.height;
      vbX = panStartVbX - (e.clientX - panStartX) * scaleX;
      vbY = panStartVbY - (e.clientY - panStartY) * scaleY;
      applyViewBox();
    });

    const stopPan = () => { isPanning = false; graphWrap.style.cursor = 'grab'; };
    graphWrap.addEventListener('mouseup', stopPan);
    graphWrap.addEventListener('mouseleave', stopPan);

    // Zoom controls
    const zoomControls = el('div', { className: 'ae-zoom-controls' });
    zoomControls.appendChild(el('button', {
      className: 'ae-zoom-btn',
      onClick: () => {
        const newW = Math.max(W * 0.2, vbW * 0.7);
        const newH = Math.max(H * 0.2, vbH * 0.7);
        vbX += (vbW - newW) / 2;
        vbY += (vbH - newH) / 2;
        vbW = newW; vbH = newH;
        applyViewBox();
      },
      title: 'Zoom in',
    }, '+'));
    zoomControls.appendChild(el('button', {
      className: 'ae-zoom-btn',
      onClick: () => {
        const newW = Math.min(W * 2, vbW * 1.4);
        const newH = Math.min(H * 2, vbH * 1.4);
        vbX += (vbW - newW) / 2;
        vbY += (vbH - newH) / 2;
        vbW = newW; vbH = newH;
        applyViewBox();
      },
      title: 'Zoom out',
    }, '−'));
    zoomControls.appendChild(el('button', {
      className: 'ae-zoom-btn',
      onClick: () => { vbX = 0; vbY = 0; vbW = W; vbH = H; applyViewBox(); },
      title: 'Reset zoom',
    }, '⟲'));
    graphWrap.appendChild(zoomControls);

    function rerenderNetwork() {
      const oldSvg = graphWrap.querySelector('.ae-network-svg');
      const newSvg = renderSVG();
      // Preserve current viewBox on rerender
      newSvg.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);
      if (oldSvg) oldSvg.replaceWith(newSvg); else graphWrap.appendChild(newSvg);

      const oldCard = graphWrap.querySelector('.ae-info-card');
      const newCard = renderInfoCard();
      if (oldCard) { if (newCard) oldCard.replaceWith(newCard); else oldCard.remove(); }
      else if (newCard) graphWrap.appendChild(newCard);
    }

    rerenderNetwork();
    wrap.appendChild(graphWrap);

    // Legend
    const legend = el('div', { className: 'ae-network-legend' });
    for (const cat of LEGEND_CATS) {
      const item = el('div', { className: 'ae-legend-item' },
        el('span', { className: 'ae-legend-dot', style: { backgroundColor: cat.color } }),
        el('span', { className: 'ae-legend-label' }, cat.label),
        el('span', { className: 'ae-legend-roles' }, cat.roles),
      );
      legend.appendChild(item);
    }
    wrap.appendChild(legend);

    // Summary stats
    const stats = el('div', { className: 'ae-network-stats' });
    const totalRoles = sorted.reduce((s, a) => s + (a.credit_levels?.length || a.roles?.length || 0), 0);
    const avgRoles = (totalRoles / n).toFixed(1);
    const totalLinks = links.length;
    const maxPair = links.length > 0 ? links.reduce((a, b) => a.weight > b.weight ? a : b) : null;
    stats.appendChild(el('div', { className: 'ae-stat' },
      el('span', { className: 'ae-stat-value' }, String(n)),
      el('span', { className: 'ae-stat-label' }, 'Authors')
    ));
    stats.appendChild(el('div', { className: 'ae-stat' },
      el('span', { className: 'ae-stat-value' }, avgRoles),
      el('span', { className: 'ae-stat-label' }, 'Avg roles')
    ));
    stats.appendChild(el('div', { className: 'ae-stat' },
      el('span', { className: 'ae-stat-value' }, String(totalLinks)),
      el('span', { className: 'ae-stat-label' }, 'Collaborations')
    ));
    if (maxPair) {
      stats.appendChild(el('div', { className: 'ae-stat' },
        el('span', { className: 'ae-stat-value' }, String(maxPair.weight)),
        el('span', { className: 'ae-stat-label' },
          `Strongest (${getLastName(sorted[maxPair.i].name)}–${getLastName(sorted[maxPair.j].name)})`)
      ));
    }
    wrap.appendChild(stats);

    return wrap;
  }

  // ──── Timeline tab ────
  function buildTimelineTab(sorted) {
    const wrap = el('div', { className: 'ae-timeline' });

    // Find date range
    const authorDates = sorted
      .filter(a => a.timeline?.joined)
      .map(a => ({
        author: a,
        start: a.timeline.joined,
        end: a.timeline.left || '2026-06',
        milestones: a.timeline.milestones || [],
      }));

    if (authorDates.length === 0) {
      wrap.appendChild(el('p', { className: 'ae-empty' }, 'No timeline data available.'));
      return wrap;
    }

    // Sort by join date
    authorDates.sort((a, b) => a.start.localeCompare(b.start));

    const allDates = authorDates.flatMap(d => [d.start, d.end]);
    const minDate = allDates.reduce((a, b) => a < b ? a : b);
    const maxDate = allDates.reduce((a, b) => a > b ? a : b);
    const minTime = new Date(minDate + '-01').getTime();
    const maxTime = new Date(maxDate + '-01').getTime();
    const range = maxTime - minTime || 1;

    // Date axis
    const axis = el('div', { className: 'ae-timeline-axis' });
    axis.appendChild(el('span', {}, minDate));
    axis.appendChild(el('span', {}, maxDate));
    wrap.appendChild(axis);

    // Rows
    for (const d of authorDates) {
      const color = getColor(d.author.name);
      const row = el('div', { className: 'ae-timeline-row' });

      row.appendChild(el('div', { className: 'ae-timeline-name' }, d.author.name));

      const barWrap = el('div', { className: 'ae-timeline-bar-wrap' });
      const startPct = ((new Date(d.start + '-01').getTime() - minTime) / range * 100);
      const endPct = ((new Date(d.end + '-01').getTime() - minTime) / range * 100);
      const bar = el('div', {
        className: 'ae-timeline-bar',
        style: {
          left: startPct + '%',
          width: Math.max(endPct - startPct, 1) + '%',
          backgroundColor: color,
        },
      });

      // Milestones
      for (const m of d.milestones) {
        const mPct = ((new Date(m.date + '-01').getTime() - minTime) / range * 100) - startPct;
        const barWidth = endPct - startPct;
        const relPct = barWidth > 0 ? (mPct / barWidth * 100) : 0;
        const dot = el('div', {
          className: 'ae-milestone',
          style: { left: Math.min(Math.max(relPct, 2), 98) + '%' },
          title: `${m.date}: ${m.event}`,
        });
        bar.appendChild(dot);
      }

      barWrap.appendChild(bar);
      row.appendChild(barWrap);
      wrap.appendChild(row);
    }

    // Milestone legend
    const milestoneList = el('div', { className: 'ae-milestone-list' });
    for (const d of authorDates) {
      for (const m of d.milestones) {
        const item = el('div', { className: 'ae-milestone-item' });
        const color = getColor(d.author.name);
        item.appendChild(el('span', { className: 'ae-milestone-dot', style: { backgroundColor: color } }));
        item.appendChild(el('span', { className: 'ae-milestone-date' }, m.date));
        item.appendChild(el('span', { className: 'ae-milestone-name' }, d.author.name + ': '));
        item.appendChild(el('span', { className: 'ae-milestone-event' }, m.event));
        milestoneList.appendChild(item);
      }
    }
    wrap.appendChild(milestoneList);

    return wrap;
  }

  // Initial render
  rerender();

  return () => { rootEl.innerHTML = ''; };
}

export default { render };
