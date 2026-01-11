import { useCallback, useEffect, useState } from 'react';
import { Star, Trophy } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import AnimeCard from '../components/AnimeCard';
import Loader from '../components/Loader';
import { getTopAnime, getFamousAnime, getTopEpisodesOfWeek } from '../services/api';
import { normalizeAnimeFilter } from '../constants/animeFilters';

const AnimePage = () => {
  const [searchParams] = useSearchParams();
  const activeFilter = normalizeAnimeFilter(searchParams.get('filter'));
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadAnime = useCallback(async (filter, pageNum) => {
    try {
      setLoading(true);
      
      if (filter === 'favorite') {
        const data = await getFamousAnime();
        setAnimeList(data.results || []);
        setHasMore(false);
        setError(null);
        setLoading(false);
        return;
      }

      if (filter === 'weekly-episodes') {
        const data = await getTopEpisodesOfWeek();
        setAnimeList(data.results || []);
        setHasMore(false);
        setError(null);
        setLoading(false);
        return;
      }

      const data = await getTopAnime('anime', filter, pageNum, 20);
      
      if (pageNum === 1) {
        setAnimeList(data.results || []);
      } else {
        setAnimeList(prev => [...prev, ...(data.results || [])]);
      }
      
      setHasMore(data.pagination?.has_next_page || false);
      setError(null);
    } catch (err) {
      setError(err?.message || 'Failed to load anime');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    setAnimeList([]);
    loadAnime(activeFilter, 1);
  }, [activeFilter, loadAnime]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadAnime(activeFilter, nextPage);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Top Anime</p>
        <h1 className="text-4xl font-black text-white">Curated Feeds</h1>
        <p className="text-slate-400 text-sm">Switch feeds from the Anime sidebar on any device.</p>
      </div>

      {/* Special Header for Legendary Anime */}
      {activeFilter === 'favorite' && !loading && (
        <section className="rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="text-yellow-400" size={24} />
            <h2 className="text-2xl font-bold text-white">Legendary Anime Hall of Fame</h2>
          </div>
          <p className="text-slate-300">
            The most iconic and beloved anime series of all time: Naruto, One Piece, Bleach, Dragon Ball, Death Note, Attack on Titan, and more!
          </p>
        </section>
      )}

      {/* Special Header for Top Episodes */}
      {activeFilter === 'weekly-episodes' && !loading && (
        <section className="rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-pink-500/5 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Star className="text-purple-400" size={24} />
            <h2 className="text-2xl font-bold text-white">Top Episodes This Week</h2>
          </div>
          <p className="text-slate-300">
            The most popular anime episodes that aired this week, ranked by popularity and ratings.
          </p>
        </section>
      )}

      {/* Anime Grid */}
      {loading && page === 1 ? (
        <Loader />
      ) : error ? (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-6 py-10 text-center text-red-200">
          {error}
        </div>
      ) : (
        <>
          {!loading && animeList.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-slate-900/40 px-6 py-10 text-center text-slate-300">
              No anime found for this feed yet. Try another filter from the Anime sidebar.
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {animeList.map((anime) => (
              <div key={anime.id} className="relative">
                <AnimeCard anime={anime} />
                {anime.episode && activeFilter === 'weekly-episodes' && (
                  <div className="absolute top-2 left-2 bg-purple-500/90 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                    EP {anime.episode}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-3 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-semibold hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnimePage;
