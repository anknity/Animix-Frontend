import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Star, CalendarDays } from 'lucide-react';
import { getTrendingManga, getPopularManga, getLatestChapters } from '../services/api';

const ListItem = ({ index, title, subtitle, to }) => (
  <Link
    to={to}
    className="group grid grid-cols-[auto_1fr] items-center gap-3 rounded-2xl border border-white/5 bg-slate-900/40 p-2 hover:border-cyan-400/40 hover:bg-slate-900/70 transition"
  >
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/80 text-xs font-bold text-cyan-200 border border-white/10">
      {index}
    </div>
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-white group-hover:text-cyan-100">{title}</p>
      {subtitle && <p className="truncate text-xs text-slate-400">{subtitle}</p>}
    </div>
  </Link>
);

const Section = ({ icon: Icon, title, children }) => (
  <section>
    <div className="mb-3 flex items-center gap-2 text-slate-300">
      <Icon size={16} className="text-cyan-300" />
      <h3 className="text-xs font-semibold uppercase tracking-[0.35em]">{title}</h3>
    </div>
    <div className="space-y-2">{children}</div>
  </section>
);

const RightSidebar = () => {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [latest, setLatest] = useState([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [t, p, l] = await Promise.all([
          getTrendingManga(1, 10),
          getPopularManga(1, 10),
          getLatestChapters(30)
        ]);
        if (!active) return;
        setTrending(t.results || []);
        setPopular(p.results || []);
        setLatest(l.results || []);
      } catch (_) {
        // non-critical
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const todaysReleases = useMemo(() => {
    const today = new Date();
    return (latest || [])
      .filter((c) => {
        if (!c.readableAt) return false;
        const d = new Date(c.readableAt);
        return (
          d.getFullYear() === today.getFullYear() &&
          d.getMonth() === today.getMonth() &&
          d.getDate() === today.getDate()
        );
      })
      .slice(0, 10);
  }, [latest]);

  return (
    <aside className="hidden 2xl:flex w-80 shrink-0 flex-col gap-8 rounded-3xl border border-white/5 bg-slate-950/70 backdrop-blur-xl p-5 sticky top-6 h-[calc(100vh-3rem)] overflow-y-auto scrollbar-hide">
      <Section icon={Flame} title="Top 10 · Trending">
        {trending.map((m, i) => (
          <ListItem
            key={m.id}
            index={i + 1}
            title={m.title?.english || m.title?.romaji || 'Untitled'}
            subtitle={m.tags?.slice(0, 2).join(' · ')}
            to={`/manga/${m.id}`}
          />
        ))}
      </Section>

      <Section icon={Star} title="Top 10 · Most Followed">
        {popular.map((m, i) => (
          <ListItem
            key={m.id}
            index={i + 1}
            title={m.title?.english || m.title?.romaji || 'Untitled'}
            subtitle={`${Math.round(Number(m.follows || 0) / 1000)}K followers`}
            to={`/manga/${m.id}`}
          />
        ))}
      </Section>

      <Section icon={CalendarDays} title="Today · New Chapters">
        {todaysReleases.map((c, i) => (
          <ListItem
            key={c.id}
            index={i + 1}
            title={c.manga?.title?.english || c.manga?.title?.romaji || 'Untitled'}
            subtitle={`Chapter ${c.chapter || '—'}`}
            to={c.manga ? `/manga/${c.manga.id}/read/${c.id}` : '#'}
          />
        ))}
      </Section>
    </aside>
  );
};

export default RightSidebar;
