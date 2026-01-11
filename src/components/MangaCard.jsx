import { Link } from 'react-router-dom';
import { BookOpen, Star, Users } from 'lucide-react';

const MangaCard = ({ manga }) => {
  const title = manga?.title?.english || manga?.title?.romaji || manga?.title?.native || 'Untitled';
  const cover = manga?.cover || manga?.image || 'https://via.placeholder.com/300x420?text=No+Cover';
  const follows = manga?.follows ?? manga?.ratingVotes ?? null;
  const rating = manga?.rating ? Number(manga.rating).toFixed(2) : null;
  const formattedFollows = follows ? Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(follows)) : null;

  return (
    <Link
      to={`/manga/${manga.id}`}
      className="group block overflow-hidden rounded-2xl border border-white/5 bg-slate-900/60 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-xl hover:shadow-cyan-400/20"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={cover}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="space-y-2 text-sm">
            {manga.tags && manga.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 text-[11px]">
                {manga.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-full bg-cyan-500/20 px-2 py-[2px] text-cyan-200">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <p className="line-clamp-3 text-slate-200/90">
              {manga.description ? manga.description.replace(/<[^>]+>/g, '') : 'No description available just yet.'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2 px-4 py-3">
        <h3 className="line-clamp-2 text-base font-semibold text-white">{title}</h3>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 font-medium">
            <BookOpen size={14} />
            {manga.lastChapter ? `Ch. ${manga.lastChapter}` : 'Ongoing'}
          </span>
          <div className="flex items-center gap-3">
            {rating && (
              <span className="flex items-center gap-1 text-cyan-300">
                <Star size={14} />
                {rating}
              </span>
            )}
            {formattedFollows && (
              <span className="flex items-center gap-1">
                <Users size={14} />
                {formattedFollows}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MangaCard;
