import { Link } from 'react-router-dom';
import { Star, Calendar } from 'lucide-react';

const AnimeCard = ({ anime }) => {
  return (
    <Link 
      to={`/anime/${anime.id}`}
      className="group block rounded-2xl border border-white/5 bg-slate-900/50 overflow-hidden hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300"
    >
      <div className="aspect-[3/4] overflow-hidden relative">
        <img 
          src={anime.coverImage || '/placeholder-anime.jpg'} 
          alt={anime.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {anime.score && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-yellow-500/90 text-slate-900 px-2 py-1 rounded-full text-xs font-bold">
            <Star size={12} fill="currentColor" />
            {anime.score}
          </div>
        )}
        {anime.type && (
          <div className="absolute top-3 left-3 bg-cyan-500/90 text-white px-2 py-1 rounded-full text-xs font-semibold">
            {anime.type}
          </div>
        )}
      </div>
      
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-white line-clamp-2 group-hover:text-cyan-300 transition-colors">
          {anime.title}
        </h3>
        
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {anime.episodes && (
            <span>{anime.episodes} eps</span>
          )}
          {anime.year && (
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {anime.year}
            </span>
          )}
        </div>

        {anime.genres && anime.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {anime.genres.slice(0, 3).map((genre, idx) => (
              <span 
                key={idx} 
                className="text-xs px-2 py-0.5 rounded-full bg-slate-800/50 text-slate-300"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

export default AnimeCard;
