/**
 * API endpoint documentation (for display purposes in the UI).
 * Describes the REST API a real journal platform would expose.
 *
 * NOTE: This file is documentation only — it is not imported by the
 * application data pipeline. All data loading happens via YAML files
 * in loadContributors.ts. This module is used solely by ApiPanel.tsx
 * to render the "API" tab.
 */
export const apiEndpoints = [
  {
    method: 'GET',
    path: '/api/papers/:id',
    description: 'Retrieve full paper with all metadata, authors, and contributions',
    response: 'Paper',
  },
  {
    method: 'GET',
    path: '/api/papers/:id/authors',
    description: 'List all authors with full profiles for a paper',
    response: 'AuthorProfile[]',
  },
  {
    method: 'GET',
    path: '/api/papers/:id/contributions',
    description: 'Get all contribution records mapped to authors',
    response: 'AuthorContribution[]',
  },
  {
    method: 'GET',
    path: '/api/authors/:id',
    description: 'Retrieve a single author profile',
    response: 'AuthorProfile',
  },
  {
    method: 'GET',
    path: '/api/papers/:id/contributions/:authorId',
    description: 'Get contribution details for a specific author on a paper',
    response: 'AuthorContribution',
  },
  {
    method: 'PATCH',
    path: '/api/authors/:id/visibility',
    description: 'Update author visibility settings (author-controlled)',
    response: 'AuthorProfile.visibility',
  },
];
