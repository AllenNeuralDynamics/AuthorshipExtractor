import { useState } from 'react';
import type { AuthorProfile, AuthorContribution } from '../types';
import { avatarColor, initials, contributionColor, platformIcon } from '../utils';

interface Props {
  author: AuthorProfile;
  contribution: AuthorContribution;
  onSelect: (authorId: string) => void;
}

export default function AuthorCard({ author, contribution, onSelect }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const bgColor = avatarColor(author.firstName + author.lastName);

  const topRoles = contribution.creditRoles.slice(0, 4);

  return (
    <button
      onClick={() => onSelect(author.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="author-card text-left w-full rounded-xl border border-gray-200 bg-white p-5 hover:shadow-lg hover:border-journal-300 focus:outline-none focus:ring-2 focus:ring-journal-500 focus:ring-offset-2 cursor-pointer"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className={`relative flex-shrink-0 w-14 h-14 rounded-full ${bgColor} flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
          {initials(author.firstName, author.lastName)}
          {contribution.isCorresponding && (
            <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] border-2 border-white" title="Corresponding author">
              ✉
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 truncate">
              {author.firstName} {author.lastName}
            </h3>
            {author.visibility.showPronouns && author.pronouns && (
              <span className="text-xs text-gray-400">({author.pronouns})</span>
            )}
          </div>

          {author.visibility.showCareerStage && (
            <p className="text-sm text-gray-500 mt-0.5">{author.careerStage}</p>
          )}

          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {author.affiliations.filter(a => a.isCurrent).map(a => a.institution).join(' · ')}
          </p>

          {/* CRediT role badges */}
          <div className="flex flex-wrap gap-1 mt-2.5">
            {topRoles.map(({ role, level }) => (
              <span
                key={role}
                className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full ${contributionColor(level)}`}
              >
                {role}
              </span>
            ))}
            {contribution.creditRoles.length > 4 && (
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-gray-500">
                +{contribution.creditRoles.length - 4} more
              </span>
            )}
          </div>

          {/* Social links - shown on hover */}
          {isHovered && author.visibility.showSocialLinks && (
            <div className="flex gap-2 mt-2 tooltip-anim">
              {author.socialLinks.slice(0, 5).map((link) => (
                <span
                  key={link.platform}
                  className="text-sm opacity-60 hover:opacity-100 transition-opacity"
                  title={link.username || link.platform}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(link.url, '_blank', 'noopener,noreferrer');
                  }}
                  role="link"
                >
                  {platformIcon(link.platform)}
                </span>
              ))}
            </div>
          )}
        </div>

      </div>
    </button>
  );
}
