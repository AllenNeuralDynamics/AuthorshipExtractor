import type { Paper } from '../types';
import { avatarColor, initials, formatMonthYear } from '../utils';

interface Props {
  paper: Paper;
  onAuthorSelect: (authorId: string) => void;
}

export default function ProjectTimeline({ paper, onAuthorSelect }: Props) {
  // Collect all milestones from all authors, sort by date
  const allEvents: {
    date: string;
    authorId: string;
    event: string;
    type: 'milestone' | 'joined' | 'left';
  }[] = [];

  for (const c of paper.contributions) {
    if (c.timeline) {
      allEvents.push({
        date: c.timeline.joinedDate,
        authorId: c.authorId,
        event: 'Joined the project',
        type: 'joined',
      });
      if (c.timeline.leftDate) {
        allEvents.push({
          date: c.timeline.leftDate,
          authorId: c.authorId,
          event: 'Completed involvement',
          type: 'left',
        });
      }
      for (const ms of c.timeline.milestones ?? []) {
        allEvents.push({
          date: ms.date,
          authorId: c.authorId,
          event: ms.event,
          type: 'milestone',
        });
      }
    }
  }

  // Deduplicate: if joined and has same-date milestone, keep only milestone
  const filtered = allEvents.filter((ev, _i, arr) => {
    if (ev.type === 'joined') {
      return !arr.some(other => other.authorId === ev.authorId && other.date === ev.date && other.type === 'milestone');
    }
    return true;
  });

  filtered.sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-journal-300 via-journal-200 to-gray-200" />

      <div className="space-y-4">
        {filtered.map((ev, i) => {
          const author = paper.authors.find(a => a.id === ev.authorId)!;
          const bg = avatarColor(author.firstName + author.lastName);
          const dotColor = ev.type === 'joined' ? 'bg-emerald-500' : ev.type === 'left' ? 'bg-gray-400' : 'bg-journal-500';

          return (
            <div key={`${ev.authorId}-${ev.date}-${i}`} className="relative flex items-start gap-4 pl-12">
              {/* Timeline dot */}
              <div className={`absolute left-[18px] top-2 w-3 h-3 rounded-full ${dotColor} border-2 border-white shadow-sm z-10`} />

              {/* Date */}
              <div className="flex-shrink-0 w-16 pt-0.5">
                <span className="text-xs font-mono text-gray-400">{formatMonthYear(ev.date)}</span>
              </div>

              {/* Content */}
              <div className="flex items-start gap-2.5 flex-1 min-w-0 pb-2">
                <button
                  onClick={() => onAuthorSelect(ev.authorId)}
                  className={`flex-shrink-0 w-7 h-7 rounded-full ${bg} flex items-center justify-center text-white text-[9px] font-bold cursor-pointer hover:scale-110 transition-transform`}
                >
                  {initials(author.firstName, author.lastName)}
                </button>
                <div>
                  <p className="text-sm text-gray-800">
                    <button
                      onClick={() => onAuthorSelect(ev.authorId)}
                      className="font-medium hover:text-journal-700 transition-colors"
                    >
                      {author.firstName} {author.lastName}
                    </button>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{ev.event}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
