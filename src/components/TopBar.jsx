import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';

const TopBar = ({ onMenuToggle = () => {} }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('q') || '';
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/90 backdrop-blur-xl">
      <div className="max-w-[1400px] mx-auto px-4 py-4 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/assets/logo.png" alt="ANIMIX" className="h-12 w-12 rounded-2xl object-cover" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.6em] text-cyan-300 font-semibold">AniMix</p>
              <h1 className="hidden md:block text-lg font-semibold text-white">Dive into the freshest digital manga</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={onMenuToggle}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form onSubmit={handleSubmit} className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search manga or author..."
              className="w-full rounded-2xl bg-slate-900 border border-white/10 text-sm text-slate-100 px-11 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
            />
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          </form>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
