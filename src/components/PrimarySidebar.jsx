import { Link, useLocation } from 'react-router-dom';
import { BookMarked, Compass, Home, Layers, Sparkles, Users } from 'lucide-react';
import animeFilters, { normalizeAnimeFilter } from '../constants/animeFilters';

const navLinkBase = 'flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-sm transition-colors';

const PrimarySidebar = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const filter = params.get('filter');
  const pathname = location.pathname;
  const isDiscover = pathname === '/search' && !filter;
  const isTrending = pathname === '/search' && filter === 'trending';
  const isLibrary = pathname === '/search' && filter === 'library';
  const isBookmarks = pathname === '/search' && filter === 'bookmarks';
  const isSchedule = pathname === '/anime/schedule';
  const isTopAnime = pathname === '/anime' || (pathname.startsWith('/anime/') && !isSchedule);
  const isAnimeFeedRoute = pathname === '/anime';
  const activeAnimeFilter = isAnimeFeedRoute ? normalizeAnimeFilter(params.get('filter')) : null;

  const makeClass = (active) =>
    `${navLinkBase} ${active ? 'bg-cyan-500/20 text-white border border-cyan-400/40 shadow-lg shadow-cyan-400/20' : 'text-slate-300 hover:text-white hover:bg-white/10'}`;

  return (
    <aside className="hidden xl:flex flex-col w-64 shrink-0 rounded-3xl border border-white/5 bg-slate-950/70 backdrop-blur-xl p-6 sticky top-6 h-[calc(100vh-3rem)]">
      <div className="flex flex-col gap-3 mb-10">
        <img src="/assets/logo.png" alt="ANIMIX" className="w-40 h-auto" />
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Read. Discuss. Evolve.</p>
      </div>

      <nav className="flex flex-col gap-8 overflow-y-auto pr-1 scrollbar-hide">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500 font-semibold mb-4 px-3">Library</p>
          <div className="space-y-2">
            <Link to="/" className={makeClass(location.pathname === '/')}
            >
              <Home size={18} />
              Home
            </Link>
            <Link to="/search" className={makeClass(isDiscover)}>
              <Compass size={18} />
              Discover
            </Link>
            <Link to="/search?filter=trending" className={makeClass(isTrending)}>
              <Sparkles size={18} />
              Trending
            </Link>
            <Link to="/search?filter=library" className={makeClass(isLibrary)}>
              <Layers size={18} />
              Library
            </Link>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500 font-semibold mb-4 px-3">Anime</p>
          <div className="space-y-2">
            <Link to="/anime" className={makeClass(isTopAnime)}>
              <Sparkles size={18} />
              Top Anime
            </Link>
            <Link to="/anime/schedule" className={makeClass(isSchedule)}>
              <Layers size={18} />
              Schedule
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500 px-3">Feeds</p>
            {animeFilters.map(({ id, label, Icon }) => {
              const isActive = isAnimeFeedRoute && activeAnimeFilter === id;
              return (
                <Link
                  key={id}
                  to={`/anime?filter=${id}`}
                  className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'border-cyan-400/40 bg-cyan-500/15 text-white'
                      : 'border-white/5 bg-white/0 text-slate-300 hover:text-white hover:border-cyan-400/20'
                  }`}
                >
                  <Icon size={14} />
                  <span className="truncate">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500 font-semibold mb-4 px-3">Shortcuts</p>
          <div className="space-y-2">
            <Link to="/search?filter=bookmarks" className={makeClass(isBookmarks)}>
              <BookMarked size={18} />
              Bookmarks
            </Link>
            <Link
              to="/community"
              className="flex items-center gap-3 rounded-2xl border border-purple-400/40 bg-gradient-to-r from-purple-500/30 to-cyan-500/30 px-3 py-3 font-semibold text-white shadow-lg shadow-purple-500/30"
            >
              <Users size={18} />
              Community Hub
            </Link>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default PrimarySidebar;
