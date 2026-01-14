import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Clock, Flame, ListOrdered, PlayCircle, Sparkles, Star, Zap, ExternalLink, Globe, Calendar, Sun } from 'lucide-react';
import Loader from '../components/Loader';
import { getTopAnime, getTrendingManga, getTopEpisodesOfWeek, getTopEpisodesToday, getAnimeSchedule } from '../services/api';

const STATUS_STYLES = {
  RELEASING: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
  ONGOING: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
  NOT_YET_RELEASED: 'border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-100',
  NEW: 'border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-100',
  FINISHED: 'border-slate-500/40 bg-slate-600/10 text-slate-200'
};

const cleanCopy = (text, limit = 160) => {
  if (!text) return 'Dive into crisp storytelling powered by AniVibe.';
  const stripped = text.replace(/<[^>]+>/g, '').trim();
  if (stripped.length <= limit) return stripped;
  return `${stripped.slice(0, limit).trim()}…`;
};

const formatRating = (value) => {
  if (!value && value !== 0) return 'NR';
  const num = Number(value);
  if (Number.isNaN(num)) return 'NR';
  return num.toFixed(1);
};

const statusClass = (status) => STATUS_STYLES[status?.toUpperCase?.() || status] || STATUS_STYLES.NEW;

const formatScheduleSlot = (entry) => {
  if (!entry) {
    return { day: 'Daily', time: 'TBA' };
  }

  if (entry.airingAt) {
    const date = new Date(entry.airingAt);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  }

  return {
    day: entry.airingDay || 'Daily',
    time: entry.airingTime || 'TBA'
  };
};

const TOP_SITES_DATA = {
  anime: [
    { name: 'AnimePahe', url: 'https://animepahe.si', description: 'Lightweight anime streaming', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/21459-yeVkolGKdGUV.jpg' },
    { name: 'HiAnime', url: 'https://hianime.to', description: 'High-quality anime streams', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1-T3PJUjFJyRwg.jpg' },
    { name: 'AniKai', url: 'https://anikai.to', description: 'Premium anime experience', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-YfZhKBUDDS6L.jpg' },
    { name: 'AniZone', url: 'https://anizone.to', description: 'Latest anime episodes', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/20958-Y7eQdz9VENBD.jpg' },
    { name: 'Kuudere', url: 'https://kuudere.ru', description: 'Curated anime selection', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-8jpFCOcDmneX.jpg' }
  ],
  donghua: [
    { name: 'AnimeKhor', url: 'https://animekhor.org', description: 'Chinese anime hub', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/127720-lf01ya5ny8pG.jpg' },
    { name: 'AnimeXin', url: 'https://animexin.dev', description: 'Latest donghua releases', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/108978-oHRSIl5LvLLZ.jpg' },
    { name: 'LMAnime', url: 'https://lmanime.com', description: 'Donghua streaming platform', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/104454-ZqlcWraUJrDM.jpg' },
    { name: 'Donghua Site', url: 'https://donghua.site', description: 'Dedicated donghua portal', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/140960-Z930LjGxlCYq.jpg' },
    { name: 'AnimeCube', url: 'https://animecube.live', description: 'Multi-source donghua', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQBSkxWAAk83.jpg' }
  ],
  manga: [
    { name: 'Comix', url: 'https://comix.to', description: 'Fast manga reader', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/20-HHxhPj5JD13a.jpg' },
    { name: 'MangaFire', url: 'https://mangafire.to', description: 'High-res manga scans', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/11757-TlEEV9weG4Ag.jpg' },
    { name: 'Bato', url: 'https://bato.ing', description: 'Community-driven manga', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/21519-1ayMXgNlmByb.jpg' },
    { name: 'MangaBall', url: 'https://mangaball.net', description: 'Latest manga chapters', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/20912-1x5ehe55ferv.jpg' },
    { name: 'MangaDex', url: 'https://mangadex.org', description: 'Open-source manga', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/5114-q0V5URebphSG.jpg' }
  ],
  manhwa: [
    { name: 'Kagane', url: 'https://kagane.org', description: 'Premium manhwa reader', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-37yfQA3ym8PA.jpg' },
    { name: 'Project Suki', url: 'https://projectsuki.com', description: 'Korean webtoons', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/129874-g5FgnhRFnIIj.jpg' },
    { name: 'QToon', url: 'https://qtoon.com', description: 'Quality manhwa scans', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/145064-S7qAgxf6kMrW.jpg' },
    { name: 'WEBTOONS', url: 'https://webtoons.com', description: 'Official webtoon platform', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQBSkxWAAk83.jpg' },
    { name: 'ManhwaZ', url: 'https://manhwaz.com', description: 'Latest manhwa updates', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/141391-yJnCQwmb1pJF.jpg' }
  ],
  download: [
    { name: 'AnimeTosho', url: 'https://animetosho.org', description: 'Torrent downloads', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/21087-sHb9zUZFsHe1.jpg' },
    { name: 'TokyoInsider', url: 'https://tokyoinsider.com', description: 'Direct downloads', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/11061-8WkkTZ6duKpq.jpg' },
    { name: 'AV1Please', url: 'https://av1please.com', description: 'AV1 encoded anime', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/5114-q0V5URebphSG.jpg' },
    { name: 'NekoBT', url: 'https://nekobt.to', description: 'Anime torrents', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/20605-RCJ7M71zLmrh.jpg' }
  ]
};

const HomePage = () => {
  const [trendingAnime, setTrendingAnime] = useState([]);
  const [trendingManga, setTrendingManga] = useState([]);
  const [weeklyEpisodes, setWeeklyEpisodes] = useState([]);
  const [animeSchedule, setAnimeSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeScheduleDay, setActiveScheduleDay] = useState(null);
  const [activeSiteCategory, setActiveSiteCategory] = useState('anime');
  const [episodeFilter, setEpisodeFilter] = useState('week');
  const [dailyEpisodes, setDailyEpisodes] = useState([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [animeData, mangaData, topEpisodesData, scheduleData] = await Promise.all([
          getTopAnime('anime', 'airing', 1, 20),
          getTrendingManga(1, 12),
          getTopEpisodesOfWeek(),
          getAnimeSchedule()
        ]);

        if (!mounted) return;
        setTrendingAnime((animeData.results || []).slice(0, 12));
        setTrendingManga(mangaData.results || []);
        setWeeklyEpisodes(topEpisodesData.results || []);
        setAnimeSchedule(scheduleData.results || []);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || 'Unable to load the feed right now.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const heroSlides = useMemo(() => {
    // Show 10 currently airing anime in the slider
    return (trendingAnime || []).slice(0, 10).map((anime, index) => {
      const totalEps = anime.episodes || '?';
      const airedEps = anime.airedEpisodes || anime.episodesAired || (anime.nextAiringEpisode?.episode ? anime.nextAiringEpisode.episode - 1 : null);
      const episodeInfo = airedEps ? `EP ${airedEps}/${totalEps}` : (totalEps !== '?' ? `${totalEps} eps` : 'Ongoing');
      
      return {
        id: `anime-${anime.id}`,
        title: anime.titleEnglish || anime.title,
        subtitle: 'Currently Airing',
        description: cleanCopy(anime.synopsis),
        cover: anime.bannerImage || anime.coverImage,
        badge: `#${index + 1}`,
        rating: anime.score,
        status: anime.status,
        meta: episodeInfo,
        airedEps: airedEps,
        totalEps: totalEps,
        link: `/anime?focus=${anime.id}`
      };
    });
  }, [trendingAnime]);

  useEffect(() => {
    if (!heroSlides.length) return undefined;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const topMangaRatings = useMemo(() => {
    return [...(trendingManga || [])]
      .filter((manga) => manga?.rating)
      .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
      .slice(0, 10);
  }, [trendingManga]);

  const weeklyEpisodeList = useMemo(() => (weeklyEpisodes || []).slice(0, 10), [weeklyEpisodes]);
  const dailyEpisodeList = useMemo(() => (dailyEpisodes || []).slice(0, 10), [dailyEpisodes]);
  
  // Get active episode list based on filter
  const activeEpisodeList = useMemo(() => {
    return episodeFilter === 'today' ? dailyEpisodeList : weeklyEpisodeList;
  }, [episodeFilter, dailyEpisodeList, weeklyEpisodeList]);

  // Fetch daily episodes when filter changes
  useEffect(() => {
    if (episodeFilter === 'today' && dailyEpisodes.length === 0) {
      getTopEpisodesToday().then((data) => {
        setDailyEpisodes(data.results || []);
      }).catch(() => {
        // Fallback to weekly episodes if daily fails
        setDailyEpisodes(weeklyEpisodes || []);
      });
    }
  }, [episodeFilter, dailyEpisodes.length, weeklyEpisodes]);

  const upcomingSchedule = useMemo(() => {
    return [...(animeSchedule || [])].sort((a, b) => {
      const aTime = a.airingAt ? new Date(a.airingAt).getTime() : Number.MAX_VALUE;
      const bTime = b.airingAt ? new Date(b.airingAt).getTime() : Number.MAX_VALUE;
      return aTime - bTime;
    });
  }, [animeSchedule]);

  const scheduleDays = useMemo(() => {
    if (!upcomingSchedule.length) return [];

    const todayKey = new Date().toISOString().split('T')[0];
    const groups = new Map();

    upcomingSchedule.forEach((show) => {
      const date = show.airingAt ? new Date(show.airingAt) : null;
      const isoKey = date ? date.toISOString().split('T')[0] : null;
      const fallbackKey = (show.airingDay || 'daily').toLowerCase();
      const key = isoKey || fallbackKey;

      const label = date
        ? date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
        : (show.airingDay || 'Daily').slice(0, 3).toUpperCase();
      const dayNumber = date ? date.getDate() : '';
      const timestamp = date
        ? new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
        : Date.now();

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          label,
          dayNumber,
          timestamp,
          isToday: isoKey === todayKey,
          entries: []
        });
      }

      groups.get(key).entries.push(show);
    });

    return Array.from(groups.values())
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((group) => ({
        ...group,
        isToday: group.isToday || group.key === todayKey,
        entries: [...group.entries].sort((a, b) => {
          const aTime = a.airingAt ? new Date(a.airingAt).getTime() : Number.MAX_VALUE;
          const bTime = b.airingAt ? new Date(b.airingAt).getTime() : Number.MAX_VALUE;
          return aTime - bTime;
        })
      }));
  }, [upcomingSchedule]);

  useEffect(() => {
    if (!scheduleDays.length) return;
    setActiveScheduleDay((prev) => {
      if (prev && scheduleDays.some((day) => day.key === prev)) {
        return prev;
      }
      const today = scheduleDays.find((day) => day.isToday);
      return today?.key || scheduleDays[0].key;
    });
  }, [scheduleDays]);

  const activeScheduleEntries = useMemo(() => {
    if (!activeScheduleDay) return [];
    const day = scheduleDays.find((d) => d.key === activeScheduleDay);
    return day?.entries || [];
  }, [activeScheduleDay, scheduleDays]);

  const activeDayMeta = useMemo(() => scheduleDays.find((d) => d.key === activeScheduleDay), [activeScheduleDay, scheduleDays]);
  const dayIndex = scheduleDays.findIndex((d) => d.key === activeScheduleDay);

  const cycleScheduleDay = (direction) => {
    if (!scheduleDays.length) return;
    const safeIndex = dayIndex === -1 ? 0 : dayIndex;
    const nextIndex = (safeIndex + direction + scheduleDays.length) % scheduleDays.length;
    setActiveScheduleDay(scheduleDays[nextIndex].key);
  };

  const handlePrevDay = () => cycleScheduleDay(-1);
  const handleNextDay = () => cycleScheduleDay(1);

  const siteCategories = [
    { key: 'anime', label: 'Anime', icon: PlayCircle },
    { key: 'donghua', label: 'Donghua', icon: Sparkles },
    { key: 'manga', label: 'Manga', icon: Star },
    { key: 'manhwa', label: 'Manhwa', icon: Flame },
    { key: 'download', label: 'Downloads', icon: Globe }
  ];

  const activeSites = TOP_SITES_DATA[activeSiteCategory] || [];
  const siteCategoryIndex = siteCategories.findIndex((cat) => cat.key === activeSiteCategory);

  const cycleSiteCategory = (direction) => {
    const safeIndex = siteCategoryIndex === -1 ? 0 : siteCategoryIndex;
    const nextIndex = (safeIndex + direction + siteCategories.length) % siteCategories.length;
    setActiveSiteCategory(siteCategories[nextIndex].key);
  };

  const handlePrevCategory = () => cycleSiteCategory(-1);
  const handleNextCategory = () => cycleSiteCategory(1);

  const scheduleTimestamp = (() => {
    if (activeDayMeta?.entries?.length && activeDayMeta.entries[0]?.airingAt) {
      return new Date(activeDayMeta.entries[0].airingAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'UTC'
      });
    }
    return new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
  })();

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-6 py-10 text-center text-red-200">
        {error}
      </div>
    );
  }

  const topEpisode = weeklyEpisodes?.[0] || null;
  const activeHero = heroSlides[activeSlide] || heroSlides[0];
  const animeStrip = (trendingAnime || []).slice(0, 10);
  const mangaStrip = (trendingManga || []).slice(0, 10);
  const topEpisodeDay = topEpisode?.airedAt
    ? new Date(topEpisode.airedAt).toLocaleDateString('en-US', { weekday: 'long' })
    : 'Weekly';

  return (
    <div className="pb-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-1 sm:px-2">
        {heroSlides.length > 0 && (
          <section className="relative overflow-hidden rounded-[32px] border border-white/5 bg-slate-950/80 p-[2px] shadow-[0_20px_60px_rgba(2,8,23,0.65)]">
            <div className="relative overflow-hidden rounded-[30px] bg-slate-950/80 p-6 hero-glow">
              {activeHero?.cover && (
                <>
                  <div className="absolute inset-0 opacity-60">
                    <img
                      src={activeHero.cover}
                      alt={activeHero.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/70 to-black" />
                  </div>
                  <div className="absolute -inset-20 opacity-20 blur-3xl bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.8),_transparent_55%)]" />
                </>
              )}

              <div className="relative space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.6em] text-cyan-200">Pulse</span>
                    <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-slate-100">
                      {activeHero?.subtitle}
                    </span>
                  </div>
                  <span className="rounded-full border border-cyan-400/50 bg-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-100 shadow-[0_0_25px_rgba(34,211,238,0.6)]">
                    {activeHero?.badge}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                  {activeHero?.title}
                </h1>

                <p className="text-sm text-slate-200/80">
                  {activeHero?.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                  <span className="glass-chip">
                    <Star size={14} className="text-amber-300" />
                    IMDb {formatRating(activeHero?.rating ?? activeHero?.score)}
                  </span>
                  <span className={`glass-chip ${statusClass(activeHero?.status)}`}>
                    {activeHero?.status ? activeHero.status.replace(/_/g, ' ') : 'NEW' }
                  </span>
                  <span className="glass-chip">
                    <PlayCircle size={14} className="text-cyan-300" />
                    {activeHero?.meta}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    to={activeHero?.link || '/anime'}
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 px-5 py-3 text-sm font-semibold text-slate-950"
                  >
                    <PlayCircle size={18} />
                    Play spotlight
                  </Link>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white"
                    onClick={() => setActiveSlide((prev) => (prev + 1) % heroSlides.length)}
                  >
                    Next vibe
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              <div className="relative mt-8 flex items-center gap-2">
                {heroSlides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    className={`h-2 w-full rounded-full transition ${
                      idx === activeSlide ? 'bg-gradient-to-r from-cyan-400 to-purple-500' : 'bg-white/10'
                    }`}
                    aria-label={`Go to hero slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        <section id="anime-ongoing" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-cyan-200">Trending Anime</p>
              <h2 className="text-2xl font-semibold text-white">Top 10 airing anime</h2>
              <p className="text-sm text-slate-400">Live leaderboard pulled from AniList airing charts.</p>
            </div>
            <Link to="/anime" className="text-sm font-semibold text-cyan-300 flex items-center gap-2">
              See all
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {animeStrip.map((anime, index) => {
              const airedEps = anime.airedEpisodes || anime.episodesAired || (anime.nextAiringEpisode?.episode ? anime.nextAiringEpisode.episode - 1 : null);
              const totalEps = anime.episodes || '?';
              const episodeDisplay = airedEps ? `EP ${airedEps}/${totalEps}` : `EP ${totalEps}`;
              
              return (
                <Link
                  key={anime.id}
                  to={`/anime?focus=${anime.id}`}
                  className="relative inline-flex w-56 shrink-0 snap-center flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-black/80"
                >
                  <div className="relative h-72 w-full overflow-hidden">
                    {anime.coverImage && (
                      <img
                        src={anime.coverImage}
                        alt={anime.titleEnglish || anime.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    )}
                    <span className="absolute left-3 top-3 rounded-full border border-cyan-400/50 bg-black/60 px-3 py-1 text-xs font-bold text-cyan-100">
                      #{index + 1}
                    </span>
                    {airedEps && (
                      <span className="absolute right-3 top-3 rounded-full border border-emerald-400/50 bg-black/60 px-2 py-1 text-[10px] font-semibold text-emerald-200">
                        {airedEps} aired
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 p-4">
                    <p className="text-sm font-semibold text-white line-clamp-2">
                      {anime.titleEnglish || anime.title}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="flex items-center gap-1">
                        <Flame size={14} className="text-orange-400" />
                        {episodeDisplay}
                      </span>
                      <span className="flex items-center gap-1 text-amber-300">
                        <Star size={13} />
                        {formatRating(anime.score)}
                      </span>
                    </div>
                    <div className={`glass-chip ${statusClass(anime.status)}`}>
                      {anime.status?.replace(/_/g, ' ') || 'NEW'}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section id="manga-week" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-purple-200">Trending Manga</p>
              <h2 className="text-2xl font-semibold text-white">Fresh ink drops</h2>
            </div>
            <Link to="/search?filter=trending" className="text-sm font-semibold text-purple-200 flex items-center gap-2">
              View more
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {mangaStrip.map((manga, index) => (
              <div
                key={manga.id}
                className="glass-panel inline-flex w-60 shrink-0 snap-center flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/70 p-4"
              >
                <div className="relative h-60 w-full overflow-hidden rounded-2xl">
                  {(manga.cover || manga.image) && (
                    <img
                      src={manga.cover || manga.image}
                      alt={manga.title?.english || manga.title?.romaji || 'Manga cover'}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <span className="absolute left-3 top-3 rounded-full border border-purple-400/50 bg-black/60 px-3 py-1 text-xs font-bold text-purple-100">
                    #{index + 1}
                  </span>
                </div>
                <div className="space-y-3">
                  <p className="text-base font-semibold text-white line-clamp-2">
                    {manga.title?.english || manga.title?.romaji || 'Untitled'}
                  </p>
                  <p className="text-sm text-slate-300 line-clamp-3">
                    {cleanCopy(manga.description, 120)}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="flex items-center gap-1">
                      <Star size={12} className="text-amber-300" />
                      {formatRating(manga.rating)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles size={12} className="text-cyan-200" />
                      {manga.lastChapter ? `Ch. ${manga.lastChapter}` : 'Ongoing'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/manga/${manga.id}`}
                      className="flex-1 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 px-3 py-2 text-center text-sm font-semibold text-slate-950"
                    >
                      Read now
                    </Link>
                    <Link
                      to={`/manga/${manga.id}`}
                      className="flex-1 rounded-full border border-white/20 px-3 py-2 text-center text-sm font-semibold text-white"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {topEpisode && (
          <section id="anime-episode" className="relative overflow-hidden rounded-[32px] border border-purple-500/40 bg-gradient-to-br from-purple-900/40 via-slate-950 to-slate-950 p-[2px] shadow-[0_25px_80px_rgba(88,28,135,0.35)]">
            <div className="relative rounded-[30px] bg-black/60 p-6">
              <div className="absolute inset-0 opacity-40">
                {(topEpisode.bannerImage || topEpisode.coverImage) && (
                  <img
                    src={topEpisode.bannerImage || topEpisode.coverImage}
                    alt={topEpisode.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
              </div>

              <div className="relative space-y-4">
                <p className="text-[11px] uppercase tracking-[0.5em] text-purple-200">Top episode of the week</p>
                <h3 className="text-2xl font-bold text-white">
                  {topEpisode.titleEnglish || topEpisode.title} · Episode {topEpisode.episode}
                </h3>
                <p className="text-sm text-slate-100/80">
                  {cleanCopy(topEpisode.synopsis, 180)}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                  <span className="glass-chip border-purple-400/40 bg-purple-400/10 text-purple-100">
                    <Zap size={14} />
                    IMDb {formatRating(topEpisode.rating ?? topEpisode.score)}
                  </span>
                  <span className="glass-chip border-white/20 bg-white/5 text-white">
                    Airing {topEpisodeDay}
                  </span>
                  <span className="glass-chip border-white/20 bg-white/5 text-white">
                    {topEpisode.meta || `${topEpisode.episodes || '?'} eps`}
                  </span>
                </div>
                <Link
                  to={`/anime?focus=${topEpisode.id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900"
                >
                  Boost the hype
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {weeklyEpisodeList.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.4em] text-purple-200">Top 10 · Episodes</p>
                <h2 className="text-2xl font-semibold text-white">
                  IMDb fan heat {episodeFilter === 'today' ? 'today' : 'this week'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEpisodeFilter('today')}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
                    episodeFilter === 'today'
                      ? 'border-purple-400/50 bg-purple-500/20 text-purple-100'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <Sun size={14} />
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setEpisodeFilter('week')}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
                    episodeFilter === 'week'
                      ? 'border-purple-400/50 bg-purple-500/20 text-purple-100'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <Calendar size={14} />
                  This Week
                </button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {activeEpisodeList.map((episode, index) => {
                const { day, time } = formatScheduleSlot(episode);
                const airedEps = episode.airedEpisodes || episode.episodesAired || (episode.nextAiringEpisode?.episode ? episode.nextAiringEpisode.episode - 1 : null);
                const totalEps = episode.episodes || '?';
                return (
                  <Link
                    key={`${episode.id}-${episode.episode}-${episodeFilter}`}
                    to={`/anime?focus=${episode.id}`}
                    className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/60 p-[2px]"
                  >
                    <div className="relative flex h-full flex-col gap-4 rounded-[24px] bg-black/60 p-5">
                      {(episode.bannerImage || episode.coverImage) && (
                        <>
                          <div className="absolute inset-0 opacity-70">
                            <img
                              src={episode.bannerImage || episode.coverImage}
                              alt={episode.titleEnglish || episode.title}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
                          </div>
                          <div className="absolute -inset-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.45),_transparent_55%)] opacity-40 blur-3xl" />
                        </>
                      )}

                      <div className="relative flex items-center justify-between text-xs text-white/70">
                        <span className="flex items-center gap-2 text-white font-semibold">
                          <span className="flex h-8 w-8 items-center justify-center rounded-2xl border border-purple-400/50 bg-purple-500/20 text-sm text-purple-100">
                            #{index + 1}
                          </span>
                          EP {episode.episode}{airedEps ? `/${totalEps}` : ''}
                        </span>
                        <span className="flex items-center gap-1 rounded-full border border-white/20 bg-black/40 px-3 py-1">
                          <Star size={13} className="text-amber-300" />
                          {formatRating(episode.rating ?? episode.score)}
                        </span>
                      </div>

                      <div className="relative space-y-1">
                        <p className="text-lg font-semibold text-white line-clamp-1">
                          {episode.titleEnglish || episode.title}
                        </p>
                        <p className="text-xs text-slate-300">{day} · {time}</p>
                      </div>

                      <p className="relative text-sm text-slate-100/90 line-clamp-2">
                        {cleanCopy(episode.synopsis, 140)}
                      </p>

                      <div className="relative flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                        <span className="glass-chip border-cyan-400/40 bg-cyan-400/10 text-cyan-100">
                          <Zap size={12} />
                          {episode.format || 'TV'}
                        </span>
                        <span className="glass-chip border-white/20 bg-white/5 text-white">
                          Airing {day}
                        </span>
                        {airedEps && (
                          <span className="glass-chip border-emerald-400/40 bg-emerald-400/10 text-emerald-100">
                            <PlayCircle size={12} />
                            {airedEps} aired
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {scheduleDays.length > 0 && (
          <section id="anime-schedule" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <CalendarDays size={18} className="text-cyan-200" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.4em] text-cyan-200">Daily slate</p>
                  <h2 className="text-2xl font-semibold text-white">Tonight&apos;s airing tracker</h2>
                </div>
              </div>
              <Link to="/anime/schedule" className="text-sm font-semibold text-cyan-300 flex items-center gap-2">
                Full schedule
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-slate-950/80 shadow-[0_20px_60px_rgba(2,8,23,0.6)] overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 bg-slate-900/70 px-4 py-4">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                  <button
                    type="button"
                    onClick={handlePrevDay}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white"
                    aria-label="Previous day"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="flex items-center gap-2">
                    {scheduleDays.map((day) => {
                      const isActive = activeScheduleDay === day.key;
                      return (
                        <button
                          type="button"
                          key={day.key}
                          onClick={() => setActiveScheduleDay(day.key)}
                          className={`flex min-w-[64px] flex-col items-center justify-center rounded-2xl border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] transition-all ${
                            isActive
                              ? 'bg-gradient-to-b from-cyan-400 to-blue-500 text-slate-950 shadow-lg shadow-cyan-400/30 border-transparent'
                              : day.isToday
                                ? 'border-cyan-400/50 text-white'
                                : 'border-white/10 text-slate-200 bg-white/5'
                          }`}
                        >
                          <span>{day.label}</span>
                          <span className="text-lg tracking-normal leading-tight">{day.dayNumber || '—'}</span>
                          {day.isToday && !isActive && (
                            <span className="text-[10px] tracking-normal text-cyan-300">Today</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={handleNextDay}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white"
                    aria-label="Next day"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="text-right text-xs text-slate-300">
                  <p>{activeDayMeta ? `${activeDayMeta.label} ${activeDayMeta.dayNumber || ''}` : 'Schedule'}</p>
                  <p>{activeDayMeta?.entries?.length || 0} simulcasts · UTC</p>
                </div>
              </div>

              <div className="divide-y divide-white/5">
                {activeScheduleEntries.map((show) => {
                  const date = show.airingAt ? new Date(show.airingAt) : null;
                  const timeLabel = date
                    ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    : formatScheduleSlot(show).time;
                  const isPremiere = (show.episode || 0) <= 2;
                  return (
                    <Link
                      key={`${show.id}-${show.episode || show.title}`}
                      to={`/anime?focus=${show.id}`}
                      className="flex items-center gap-4 px-6 py-4 transition hover:bg-white/5"
                    >
                      <div className="w-20 text-left">
                        <p className="text-sm font-semibold text-white">{timeLabel}</p>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{show.timezone || 'UTC'}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white line-clamp-1">{show.titleEnglish || show.title}</p>
                        <p className="text-xs text-slate-400 line-clamp-1">Episode {show.episode || '?'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isPremiere && (
                          <span className="rounded-full border border-fuchsia-400/40 bg-fuchsia-500/10 px-3 py-1 text-[11px] font-semibold text-fuchsia-200">
                            New
                          </span>
                        )}
                        <span className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-200">
                          <Clock size={13} className="text-cyan-200" />
                          {show.type || 'TV'}
                        </span>
                      </div>
                    </Link>
                  );
                })}
                {activeScheduleEntries.length === 0 && (
                  <div className="px-6 py-6 text-center text-sm text-slate-400">No confirmed airings for this day.</div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-white/5 bg-black/40 px-6 py-3 text-xs text-slate-400">
                <p>{scheduleTimestamp}</p>
                <Link to="/anime/schedule" className="inline-flex items-center gap-1 font-semibold text-cyan-300">
                  More
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Top Sites Section */}
        <section id="top-sites" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <Globe size={18} className="text-purple-200" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.4em] text-purple-200">Top Sites</p>
                <h2 className="text-2xl font-semibold text-white">Community favorites</h2>
              </div>
            </div>
            <span className="text-xs text-slate-400">Curated collection</span>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-slate-950/80 shadow-[0_20px_60px_rgba(2,8,23,0.6)] overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 bg-slate-900/70 px-4 py-4">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <button
                  type="button"
                  onClick={handlePrevCategory}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white"
                  aria-label="Previous category"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-2">
                  {siteCategories.map((category) => {
                    const isActive = activeSiteCategory === category.key;
                    const Icon = category.icon;
                    return (
                      <button
                        type="button"
                        key={category.key}
                        onClick={() => setActiveSiteCategory(category.key)}
                        className={`flex min-w-[100px] items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-all ${
                          isActive
                            ? 'bg-gradient-to-b from-purple-400 to-purple-600 text-white shadow-lg shadow-purple-400/30 border-transparent'
                            : 'border-white/10 text-slate-200 bg-white/5'
                        }`}
                      >
                        <Icon size={14} />
                        <span>{category.label}</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={handleNextCategory}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white"
                  aria-label="Next category"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className="text-right text-xs text-slate-300">
                <p className="font-semibold">{siteCategories.find(cat => cat.key === activeSiteCategory)?.label || 'Sites'}</p>
                <p>{activeSites.length} recommended sites</p>
              </div>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2">
              {activeSites.map((site, index) => (
                <a
                  key={site.url}
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/60 p-[2px] transition hover:border-purple-400/50"
                >
                  <div className="relative flex h-full min-h-[140px] flex-col justify-end gap-3 rounded-[24px] overflow-hidden">
                    {/* Background Image */}
                    {site.cover && (
                      <>
                        <div className="absolute inset-0">
                          <img
                            src={site.cover}
                            alt={site.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                        </div>
                        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <div className="absolute -inset-10 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.4),_transparent_60%)] blur-2xl" />
                        </div>
                      </>
                    )}

                    {/* Content */}
                    <div className="relative p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-2xl border border-purple-400/50 bg-black/60 backdrop-blur-sm text-sm font-bold text-purple-100">
                          #{index + 1}
                        </span>
                        <span className="flex items-center gap-1 rounded-full border border-white/30 bg-black/50 backdrop-blur-sm px-3 py-1 text-xs text-white transition group-hover:border-purple-400/60 group-hover:bg-purple-500/30">
                          <ExternalLink size={12} />
                          Visit
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-lg font-bold text-white drop-shadow-lg">{site.name}</p>
                        <p className="text-xs text-slate-200/90">{site.description}</p>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <span className="glass-chip border-purple-400/40 bg-black/50 backdrop-blur-sm text-purple-100">
                          <Globe size={12} />
                          {site.url.replace('https://', '').split('/')[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-white/5 bg-black/40 px-6 py-3 text-xs text-slate-400">
              <p>External links · Use at your own discretion</p>
              <span className="inline-flex items-center gap-1 font-semibold text-purple-300">
                <Star size={12} />
                Verified
              </span>
            </div>
          </div>
        </section>

        {/* Manga Ratings Section - Moved to end */}
        {topMangaRatings.length > 0 && (
          <section id="manga-rated" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <ListOrdered size={18} className="text-amber-200" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.4em] text-amber-200">Manga ratings</p>
                  <h2 className="text-2xl font-semibold text-white">Top scored stories</h2>
                </div>
              </div>
              <span className="text-xs text-slate-400">Powered by MangaDex</span>
            </div>
            <div className="space-y-2">
              {topMangaRatings.map((manga, index) => {
                const title = manga.title?.english || manga.title?.romaji || manga.title?.native || 'Untitled';
                return (
                  <Link
                    key={manga.id}
                    to={`/manga/${manga.id}`}
                    className="flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 transition hover:border-amber-400/30 hover:bg-slate-900"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/10 text-sm font-semibold text-amber-100">
                      #{index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{title}</p>
                      <p className="text-xs text-slate-400 truncate">{manga.tags?.slice(0, 2).join(' · ') || 'Ongoing saga'}</p>
                    </div>
                    <div className="text-right text-xs text-slate-300">
                      <p className="font-semibold text-white">IMDb {formatRating(manga.rating)}</p>
                      <p>{manga.lastChapter ? `Ch. ${manga.lastChapter}` : 'Weekly drop'}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default HomePage;
