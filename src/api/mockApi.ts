/**
 * Mock API layer – simulates a REST API for the journal
 * In a real system, these would be actual fetch calls
 */
import { mockPaper } from '../data/mockPaper';
import type { Paper, AuthorProfile, AuthorContribution } from '../types';

// Simulated network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  /** GET /api/papers/:id */
  async getPaper(id: string): Promise<Paper> {
    await delay(300);
    if (id !== mockPaper.id) throw new Error('Paper not found');
    return mockPaper;
  },

  /** GET /api/papers/:id/authors */
  async getPaperAuthors(paperId: string): Promise<AuthorProfile[]> {
    await delay(200);
    if (paperId !== mockPaper.id) throw new Error('Paper not found');
    return mockPaper.authors;
  },

  /** GET /api/papers/:id/contributions */
  async getPaperContributions(paperId: string): Promise<AuthorContribution[]> {
    await delay(200);
    if (paperId !== mockPaper.id) throw new Error('Paper not found');
    return mockPaper.contributions;
  },

  /** GET /api/authors/:id */
  async getAuthor(authorId: string): Promise<AuthorProfile | undefined> {
    await delay(150);
    return mockPaper.authors.find(a => a.id === authorId);
  },

  /** GET /api/papers/:id/contributions/:authorId */
  async getAuthorContribution(paperId: string, authorId: string): Promise<AuthorContribution | undefined> {
    await delay(150);
    if (paperId !== mockPaper.id) throw new Error('Paper not found');
    return mockPaper.contributions.find(c => c.authorId === authorId);
  },

  /** PATCH /api/authors/:id/visibility — author controls their own visibility */
  async updateAuthorVisibility(
    authorId: string,
    visibility: Partial<AuthorProfile['visibility']>
  ): Promise<AuthorProfile['visibility']> {
    await delay(200);
    const author = mockPaper.authors.find(a => a.id === authorId);
    if (!author) throw new Error('Author not found');
    Object.assign(author.visibility, visibility);
    return author.visibility;
  },
};

/**
 * API endpoint documentation (for display purposes in the UI)
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
