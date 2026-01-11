import { Link } from 'react-router-dom';
import {
  X,
  Home,
  Compass,
  Sparkles,
  Layers,
  BookMarked,
  Users,
  Flame,
  Star,
  CalendarDays,
  Zap,
  MessageCircle
} from 'lucide-react';
import animeFilters from '../constants/animeFilters';

const primaryLinks = [
  { to: '/', label: 'Home', Icon: Home },
  { to: '/search', label: 'Discover', Icon: Compass },
  { to: '/search?filter=trending', label: 'Trending', Icon: Sparkles },
  { to: '/search?filter=library', label: 'Library', Icon: Layers },
  { to: '/search?filter=bookmarks', label: 'Bookmarks', Icon: BookMarked },
  { to: '/anime', label: 'Top Anime', Icon: Sparkles },
  { to: '/anime/schedule', label: 'Schedule', Icon: CalendarDays }
];

const listShortcuts = [
  { hash: '#anime-ongoing', label: 'Top 10 Airing Anime', Icon: Flame },
  { hash: '#manga-week', label: 'Trending Manga', Icon: Sparkles },
  { hash: '#manga-rated', label: 'Top Rated Manga', Icon: Star },
  { hash: '#anime-episode', label: 'Top Episodes (IMDb)', Icon: Zap },
  { hash: '#anime-schedule', label: 'Daily Airing Schedule', Icon: CalendarDays }
];

const MobileMenuSheet = ({ open, onClose }) => {
  return (
    <div className={`fixed inset-0 z-50 transition ${open ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        className={`absolute left-0 top-0 h-full w-5/6 max-w-sm transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-full flex-col rounded-r-3xl border-r border-white/10 bg-slate-950/95">
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.6em] text-cyan-300 font-semibold">AniVibe</p>
              <p className="text-sm text-slate-300">Navigate the verse</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white"
              aria-label="Close navigation menu"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
            <nav className="space-y-3">
              {primaryLinks.map(({ to, label, Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white"
                >
                  <Icon size={18} className="text-cyan-300" />
                  {label}
                </Link>
              ))}
            </nav>

            <div className="rounded-3xl border border-purple-400/30 bg-gradient-to-br from-purple-900/40 via-slate-950 to-slate-950 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <Users size={18} className="text-purple-200" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.4em] text-purple-200">Community</p>
                  <p className="text-sm text-slate-300">Drop into live chats & clubs</p>
                </div>
              </div>
              <Link
                to="/community"
                onClick={onClose}
                className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900"
              >
                <MessageCircle size={16} />
                Enter Community Hub
              </Link>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400 mb-3">Top 10 lists</p>
              <div className="space-y-2">
                {listShortcuts.map(({ hash, label, Icon }) => (
                  <Link
                    key={hash}
                    to={{ pathname: '/', hash }}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white"
                  >
                    <Icon size={16} className="text-purple-300" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400 mb-3">Anime Feeds</p>
              <div className="space-y-2">
                {animeFilters.map(({ id, label, Icon }) => (
                  <Link
                    key={id}
                    to={`/anime?filter=${id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white"
                  >
                    <Icon size={16} className="text-cyan-300" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenuSheet;
