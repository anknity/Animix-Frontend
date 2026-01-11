import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  ExternalLink,
  Film,
  Flame,
  Layers,
  PlayCircle,
  Sparkles,
  Star,
  Tv2,
  Users
} from 'lucide-react';
import Loader from '../components/Loader';
import { getAnimeById, getAnimeEpisodes, getAnimeRecommendations } from '../services/api';

const stripHtml = (value = '') => value.replace(/<[^>]+>/g, '').trim();
const formatDate = (value) => {
  if (!value) return 'TBA';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'TBA';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const normalizeSeason = (season) => (season ? season.toLowerCase() : null);

const SEASON_RELATION_TYPES = new Set([
  'PREQUEL',
  'SEQUEL',
  'ALTERNATIVE_VERSION',
  'ALTERNATIVE_SETTING',
  'SPIN_OFF',
  'SUMMARY',
  'PARENT',
  'SIDE_STORY',
  'COMPILATION'
]);

const MOVIE_FORMATS = new Set(['MOVIE']);
const SEASON_ORDER = { winter: 1, spring: 2, summer: 3, fall: 4 };

const formatSeasonLabel = (season, year) => {
  if (!season && !year) return null;
  const normalized = normalizeSeason(season);
  const capitalized = normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : null;
  return [capitalized, year].filter(Boolean).join(' ');
};

const isMovieFormat = (format) => (format ? MOVIE_FORMATS.has(format.toUpperCase()) : false);

const shouldIncludeInRoadmap = (relation) => {
  if (!relation) return false;
  if (SEASON_RELATION_TYPES.has(relation.relationType)) return true;
  if (isMovieFormat(relation.format)) {
    return relation.relationType && relation.relationType !== 'ADAPTATION';
  }
  return false;
};

const getTimelineSortMeta = (entry) => {
  const year = entry.seasonYear ?? entry.year ?? Number.MAX_SAFE_INTEGER;
  const normalizedSeason = normalizeSeason(entry.season);
  const seasonIndex = normalizedSeason ? SEASON_ORDER[normalizedSeason] || 5 : (isMovieFormat(entry.format) ? 5 : 6);
  return { year, seasonIndex };
};

const AnimeDetailsPage = () => {
  const { animeId } = useParams();
  const [anime, setAnime] = useState(null);
  const [malId, setMalId] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [episodesPage, setEpisodesPage] = useState(1);
  const [episodesHasMore, setEpisodesHasMore] = useState(false);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [malRecommendations, setMalRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEpisodeChunk = async (targetMalId, pageNumber = 1, append = false) => {
    if (!targetMalId) return;

    try {
      setEpisodesLoading(true);
      const data = await getAnimeEpisodes(animeId, pageNumber, targetMalId);
      const nextEpisodes = data.results || [];
      setEpisodes((prev) => (append ? [...prev, ...nextEpisodes] : nextEpisodes));
      setEpisodesPage(pageNumber);
      setEpisodesHasMore(Boolean(data.pagination?.has_next_page));
    } catch (err) {
      console.error('Unable to fetch episodes', err);
    } finally {
      setEpisodesLoading(false);
    }
  };

  const fetchMalRecommendations = async (targetMalId) => {
    try {
      const data = await getAnimeRecommendations(animeId, targetMalId);
      setMalRecommendations(data.results || []);
    } catch (err) {
      console.error('Unable to fetch MAL recommendations', err);
    }
  };

  useEffect(() => {
    let active = true;

    const loadDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const details = await getAnimeById(animeId);
        if (!active) return;
        setAnime(details);
        setMalId(details.malId || null);
        setEpisodes([]);
        setEpisodesPage(1);
        setEpisodesHasMore(false);
        setMalRecommendations([]);

        if (details.malId) {
          fetchEpisodeChunk(details.malId, 1, false);
          fetchMalRecommendations(details.malId);
        }
      } catch (err) {
        if (!active) return;
        setError(err?.message || 'Unable to load this anime right now.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDetails();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animeId]);

  const handleLoadMoreEpisodes = () => {
    if (!malId || episodesLoading) return;
    fetchEpisodeChunk(malId, episodesPage + 1, true);
  };

  const safeSynopsis = useMemo(() => {
    if (!anime?.descriptionHtml) {
      return anime?.synopsis || 'Details coming soon.';
    }
    const cleaned = stripHtml(anime.descriptionHtml);
    return cleaned || anime.synopsis || 'Details coming soon.';
  }, [anime]);

  const seasonEntries = useMemo(() => {
    if (!anime) return [];
    const entries = new Map();

    const pushEntry = (entry) => {
      if (!entry?.id || entries.has(entry.id)) return;
      entries.set(entry.id, {
        ...entry,
        season: normalizeSeason(entry.season),
        seasonYear: entry.seasonYear ?? entry.year ?? null,
        format: entry.format || null,
        duration: entry.duration ?? null
      });
    };

    pushEntry({
      id: anime.id,
      title: anime.title,
      episodes: anime.episodes,
      season: normalizeSeason(anime.season),
      seasonYear: anime.year,
      relationType: 'CURRENT',
      format: anime.type,
      duration: anime.duration,
      year: anime.year
    });

    (anime.relations || []).forEach((relation) => {
      if (!shouldIncludeInRoadmap(relation)) return;
      pushEntry(relation);
    });

    return Array.from(entries.values()).sort((a, b) => {
      const metaA = getTimelineSortMeta(a);
      const metaB = getTimelineSortMeta(b);
      if (metaA.year !== metaB.year) return metaA.year - metaB.year;
      if (metaA.seasonIndex !== metaB.seasonIndex) return metaA.seasonIndex - metaB.seasonIndex;
      return (a.title || '').localeCompare(b.title || '');
    });
  }, [anime]);

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

  if (!anime) {
    return null;
  }

  const statChips = [
    { label: 'Episodes', value: anime.episodes ? `${anime.episodes}` : 'TBA' },
    { label: 'Runtime', value: anime.duration ? `${anime.duration} min` : 'Unknown' },
    { label: 'Status', value: anime.status?.replace(/_/g, ' ') || 'Unknown' },
    { label: 'Season', value: formatSeasonLabel(anime.season, anime.year) || anime.year || 'TBA' }
  ];

  const popularity = anime.stats?.popularity ?? anime.malStats?.popularity;
  const favourites = anime.stats?.favourites ?? anime.malStats?.favorites;
  const rank = anime.malStats?.rank;

  return (
    <div className="space-y-10 pb-12">
      <div className="flex items-center gap-3 text-sm text-slate-400">
        <Link to="/" className="flex items-center gap-2 text-cyan-200 hover:text-cyan-100">
          <ArrowLeft size={16} />
          Back to home
        </Link>
        <span>•</span>
        <Link to="/anime" className="hover:text-white">Top anime</Link>
      </div>

      <section className="relative overflow-hidden rounded-[32px] border border-white/5 bg-slate-950/80 p-[2px] shadow-[0_25px_80px_rgba(15,118,230,0.25)]">
        <div className="relative rounded-[30px] bg-gradient-to-br from-slate-950/95 via-slate-950/70 to-slate-950/90 p-6">
          {anime.bannerImage && (
            <div className="pointer-events-none absolute inset-0 opacity-40">
              <img src={anime.bannerImage} alt={anime.title} className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
            </div>
          )}

          <div className="relative flex flex-col gap-8 lg:flex-row">
            {anime.coverImage && (
              <img
                src={anime.coverImage}
                alt={anime.title}
                className="w-full max-w-xs rounded-2xl border border-white/10 object-cover shadow-2xl shadow-cyan-900/40"
                loading="lazy"
              />
            )}

            <div className="flex-1 space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.45em] text-cyan-300">Anime detail</p>
                <h1 className="text-3xl font-black text-white sm:text-4xl">{anime.title}</h1>
                <div className="flex flex-wrap gap-3 text-xs font-semibold">
                  {anime.score && (
                    <span className="glass-chip">
                      <Star size={14} className="text-amber-300" />
                      IMDb {anime.score.toFixed(1)}
                    </span>
                  )}
                  {popularity && (
                    <span className="glass-chip border-purple-400/50 text-purple-100">
                      <Flame size={14} />
                      #{popularity.toLocaleString()} popularity
                    </span>
                  )}
                  {favourites && (
                    <span className="glass-chip border-white/10 text-white">
                      <Users size={14} />
                      {favourites.toLocaleString()} favorites
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm leading-6 text-slate-200 max-w-3xl">{safeSynopsis}</p>

              <div className="flex flex-wrap gap-3 text-xs">
                {statChips.map((chip) => (
                  <span key={chip.label} className="glass-chip border-white/15 bg-white/5 text-white">
                    {chip.label}: {chip.value}
                  </span>
                ))}
                {rank && (
                  <span className="glass-chip border-amber-400/30 text-amber-100">Rank #{rank}</span>
                )}
              </div>

              {(anime.genres?.length || anime.themes?.length) && (
                <div className="flex flex-wrap gap-2 text-xs">
                  {[...(anime.genres || []), ...(anime.themes || [])]
                    .slice(0, 10)
                    .map((tag) => (
                      <span key={tag} className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-cyan-100">
                        {tag}
                      </span>
                    ))}
                </div>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                {anime.studios?.length > 0 && (
                  <span className="flex items-center gap-2">
                    <Film size={16} className="text-purple-300" />
                    {anime.studios.join(', ')}
                  </span>
                )}
                {anime.producers?.length > 0 && (
                  <span className="flex items-center gap-2">
                    <Sparkles size={16} className="text-cyan-300" />
                    {anime.producers.slice(0, 2).join(', ')}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {anime.externalLinks?.anilist && (
                  <a
                    href={anime.externalLinks.anilist}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950"
                  >
                    <ExternalLink size={16} />
                    View on AniList
                  </a>
                )}
                {anime.externalLinks?.mal && (
                  <a
                    href={anime.externalLinks.mal}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
                  >
                    <ExternalLink size={16} />
                    View on MAL
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {anime.streamingPlatforms?.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <Tv2 size={18} className="text-cyan-200" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-cyan-200">Watch now</p>
              <h2 className="text-2xl font-semibold text-white">Streaming availability</h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {anime.streamingPlatforms.map((platform) => (
              <a
                key={`${platform.name}-${platform.url}`}
                href={platform.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-3xl border border-white/5 bg-slate-900/60 px-5 py-4 text-sm text-white transition hover:border-cyan-400/40"
              >
                <span className="font-semibold">{platform.name}</span>
                <PlayCircle size={18} className="text-cyan-300" />
              </a>
            ))}
          </div>
        </section>
      )}

      {seasonEntries.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <Layers size={18} className="text-emerald-200" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-emerald-200">Season roadmap</p>
              <h2 className="text-2xl font-semibold text-white">Every season & episode count</h2>
            </div>
          </div>
          <div className="rounded-3xl border border-white/5 bg-slate-900/40 divide-y divide-white/5">
            {seasonEntries.map((entry) => {
              const isCurrent = entry.id === anime.id;
              const relationLabel = isCurrent ? 'Current season' : (entry.relationType || entry.format || 'Related').replace(/_/g, ' ');
              const releaseLabel = formatSeasonLabel(entry.season, entry.seasonYear) || (entry.seasonYear ? `Release ${entry.seasonYear}` : 'Release TBA');
              const isMovie = isMovieFormat(entry.format);
              const episodeLabel = isMovie
                ? `Movie${entry.duration ? ` · ${entry.duration} min` : ''}`
                : entry.episodes
                  ? `${entry.episodes} episodes`
                  : 'Episodes TBA';

              const rowClass = `flex flex-col gap-2 px-6 py-4 md:flex-row md:items-center md:justify-between transition ${
                isCurrent ? 'bg-white/5' : 'hover:bg-slate-900/60'
              }`;

              const content = (
                <>
                  <div>
                    <p className="text-base font-semibold text-white">{entry.title}</p>
                    <p className={`text-[11px] uppercase tracking-[0.3em] ${isCurrent ? 'text-emerald-200' : 'text-slate-400'}`}>
                      {relationLabel}
                    </p>
                  </div>
                  <div className="text-sm text-slate-300 text-left md:text-right">
                    <p>{releaseLabel}</p>
                    <p className="text-xs text-slate-500">{episodeLabel}</p>
                  </div>
                </>
              );

              if (isCurrent) {
                return (
                  <div key={entry.id} className={rowClass}>
                    {content}
                  </div>
                );
              }

              return (
                <Link key={entry.id} to={`/anime/${entry.id}`} className={rowClass}>
                  {content}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <CalendarDays size={18} className="text-purple-200" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-purple-200">Episode guide</p>
              <h2 className="text-2xl font-semibold text-white">Airing timeline</h2>
            </div>
          </div>
          {anime.broadcast?.time && (
            <span className="text-xs text-slate-400">{anime.broadcast.day} · {anime.broadcast.time} ({anime.broadcast.timezone || 'UTC'})</span>
          )}
        </div>

        <div className="rounded-3xl border border-white/5 bg-slate-900/40 divide-y divide-white/5">
          {episodes.length === 0 && (
            <p className="px-6 py-8 text-center text-sm text-slate-400">
              {malId ? 'Episodes are loading...' : 'Episodes will appear once a MAL id is available.'}
            </p>
          )}

          {episodes.map((episode) => (
            <div key={episode.id} className="flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-base font-semibold text-white">Episode {episode.number ?? episode.id}</p>
                {episode.title && <p className="text-sm text-slate-400">{episode.title}</p>}
                <p className="text-xs text-slate-500">Aired {formatDate(episode.aired)}</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {episode.score && (
                  <span className="glass-chip border-amber-400/30 text-amber-100">
                    <Star size={12} />
                    {episode.score.toFixed(1)}
                  </span>
                )}
                {episode.filler && (
                  <span className="glass-chip border-fuchsia-400/40 text-fuchsia-100">Filler</span>
                )}
                {episode.recap && (
                  <span className="glass-chip border-slate-400/40 text-slate-200">Recap</span>
                )}
              </div>
            </div>
          ))}

          {episodesHasMore && (
            <div className="px-6 py-4 text-center">
              <button
                type="button"
                onClick={handleLoadMoreEpisodes}
                disabled={episodesLoading}
                className="rounded-full border border-purple-400/40 bg-purple-500/10 px-6 py-2 text-sm font-semibold text-purple-100 hover:bg-purple-500/20 disabled:opacity-50"
              >
                {episodesLoading ? 'Loading...' : 'Load more episodes'}
              </button>
            </div>
          )}
        </div>
      </section>

      {anime.relations?.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <Film size={18} className="text-amber-200" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-amber-200">Universe</p>
              <h2 className="text-2xl font-semibold text-white">Related stories</h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {anime.relations.map((relation) => (
              <Link
                key={relation.id}
                to={`/anime/${relation.id}`}
                className="flex items-center gap-4 rounded-3xl border border-white/10 bg-slate-900/60 p-4 transition hover:border-cyan-400/40"
              >
                {relation.coverImage && (
                  <img src={relation.coverImage} alt={relation.title} className="h-20 w-16 rounded-2xl object-cover" loading="lazy" />
                )}
                <div>
                  <p className="text-sm font-semibold text-white">{relation.title}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{relation.relationType?.replace(/_/g, ' ')}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {anime.recommendations?.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <Sparkles size={18} className="text-cyan-200" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-cyan-200">AniList picks</p>
              <h2 className="text-2xl font-semibold text-white">You might also vibe with</h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {anime.recommendations.map((rec) => (
              <Link
                key={rec.id}
                to={`/anime/${rec.id}`}
                className="group rounded-3xl border border-white/10 bg-slate-900/50 p-4 transition hover:border-cyan-400/40"
              >
                {rec.coverImage && (
                  <img
                    src={rec.coverImage}
                    alt={rec.title}
                    className="h-40 w-full rounded-2xl object-cover mb-3"
                    loading="lazy"
                  />
                )}
                <p className="font-semibold text-white group-hover:text-cyan-200">{rec.title}</p>
                {rec.score && <p className="text-xs text-slate-400">IMDb {rec.score.toFixed(1)}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {malRecommendations.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <Flame size={18} className="text-orange-300" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-orange-200">MAL community</p>
              <h2 className="text-2xl font-semibold text-white">Fan-favorite recommendations</h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {malRecommendations.map((rec) => (
              <a
                key={`${rec.id}-${rec.title}`}
                href={`https://myanimelist.net/anime/${rec.id}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-3xl border border-white/10 bg-slate-900/50 p-4 transition hover:border-amber-400/40"
              >
                <p className="font-semibold text-white">{rec.title}</p>
                {rec.score && <p className="text-xs text-slate-400">IMDb {rec.score.toFixed(1)}</p>}
                {rec.source && <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mt-2">{rec.source}</p>}
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default AnimeDetailsPage;
