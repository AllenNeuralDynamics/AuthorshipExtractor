import { useState } from 'react';
import type { Paper } from '../types';
import { ALL_CREDIT_ROLES, CREDIT_ROLE_ICONS, contributionDot, avatarColor, initials } from '../utils';
import type { CreditRole, ContributionLevel } from '../types';

interface Props {
  paper: Paper;
  onAuthorSelect: (authorId: string) => void;
}

export default function ContributionMatrix({ paper, onAuthorSelect }: Props) {
  const [hoveredCell, setHoveredCell] = useState<{ authorId: string; role: CreditRole } | null>(null);
  const [hoveredAuthor, setHoveredAuthor] = useState<string | null>(null);
  const [hoveredRole, setHoveredRole] = useState<CreditRole | null>(null);

  // Sort authors by order
  const sortedContributions = [...paper.contributions].sort((a, b) => a.authorOrder - b.authorOrder);

  // Build lookup: (authorId, role) -> level
  const lookup = new Map<string, ContributionLevel>();
  for (const c of sortedContributions) {
    for (const cr of c.creditRoles) {
      lookup.set(`${c.authorId}::${cr.role}`, cr.level);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-white min-w-[180px]" />
            {sortedContributions.map((c) => {
              const author = paper.authors.find(a => a.id === c.authorId)!;
              const bg = avatarColor(author.firstName + author.lastName);
              const isHighlighted = hoveredAuthor === c.authorId;
              return (
                <th
                  key={c.authorId}
                  className={`px-2 py-3 text-center transition-opacity duration-200 ${hoveredAuthor && !isHighlighted ? 'opacity-40' : ''}`}
                  onMouseEnter={() => setHoveredAuthor(c.authorId)}
                  onMouseLeave={() => setHoveredAuthor(null)}
                >
                  <button
                    onClick={() => onAuthorSelect(c.authorId)}
                    className="flex flex-col items-center gap-1.5 mx-auto hover:opacity-80 transition-opacity"
                  >
                    <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                      {initials(author.firstName, author.lastName)}
                    </div>
                    <span className="text-[10px] text-gray-600 font-medium leading-tight max-w-[70px] truncate">
                      {author.lastName}
                    </span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {ALL_CREDIT_ROLES.map((role) => {
            const isRoleHighlighted = hoveredRole === role;
            return (
              <tr
                key={role}
                className={`section-row ${hoveredRole && !isRoleHighlighted ? 'opacity-40' : ''} transition-opacity duration-200`}
                onMouseEnter={() => setHoveredRole(role)}
                onMouseLeave={() => setHoveredRole(null)}
              >
                <td className="sticky left-0 z-10 bg-white px-3 py-2 text-xs text-gray-600 font-medium border-b border-gray-50 whitespace-nowrap">
                  <span className="mr-1.5">{CREDIT_ROLE_ICONS[role]}</span>
                  {role}
                </td>
                {sortedContributions.map((c) => {
                  const level = lookup.get(`${c.authorId}::${role}`);
                  const isHovered = hoveredCell?.authorId === c.authorId && hoveredCell?.role === role;
                  return (
                    <td
                      key={c.authorId}
                      className="px-2 py-2 text-center border-b border-gray-50"
                      onMouseEnter={() => setHoveredCell({ authorId: c.authorId, role })}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      {level ? (
                        <div className="relative flex items-center justify-center">
                          <div
                            className={`matrix-cell w-6 h-6 rounded-full ${contributionDot(level)} ${isHovered ? 'ring-2 ring-journal-300 ring-offset-1' : ''}`}
                            title={`${level}`}
                          />
                          {isHovered && (
                            <div className="tooltip-anim absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-gray-900 text-white text-[10px] font-medium whitespace-nowrap z-20 shadow-lg">
                              {level}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-6 h-6 mx-auto" />
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 px-3">
        <span className="text-xs text-gray-400 font-medium">Legend:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-journal-700" />
          <span className="text-xs text-gray-600">Lead</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-journal-400" />
          <span className="text-xs text-gray-600">Equal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-300" />
          <span className="text-xs text-gray-600">Supporting</span>
        </div>
      </div>
    </div>
  );
}
