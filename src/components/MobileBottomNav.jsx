import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Sparkles, CalendarDays, Users } from 'lucide-react';

const tabs = [
  { path: '/', label: 'Home', Icon: Home },
  { path: '/search', label: 'Search', Icon: Search },
  { path: '/anime', label: 'Anime', Icon: Sparkles },
  { path: '/anime/schedule', label: 'Schedule', Icon: CalendarDays },
  { path: '/community', label: 'Community', Icon: Users }
];

const MobileBottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/90 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        {tabs.map(({ path, label, Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-1 text-xs font-semibold transition ${
                active ? 'text-cyan-200' : 'text-slate-400'
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm ${
                  active
                    ? 'border-cyan-400/60 bg-cyan-500/10 text-cyan-200'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <Icon size={18} />
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
