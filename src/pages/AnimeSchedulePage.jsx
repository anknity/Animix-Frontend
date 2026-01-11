import { useEffect, useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import AnimeCard from '../components/AnimeCard';
import Loader from '../components/Loader';
import { getAnimeSchedule } from '../services/api';

const AnimeSchedulePage = () => {
  const [activeDay, setActiveDay] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const days = [
    { id: '', label: 'All Days' },
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' }
  ];

  useEffect(() => {
    loadSchedule(activeDay);
  }, [activeDay]);

  const loadSchedule = async (day) => {
    try {
      setLoading(true);
      const data = await getAnimeSchedule(day);
      setSchedule(data.results || []);
      setError(null);
    } catch (err) {
      setError(err?.message || 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const groupByDay = () => {
    const grouped = {};
    schedule.forEach(anime => {
      const day = anime.airingDay || 'Unknown';
      if (!grouped[day]) {
        grouped[day] = [];
      }
      grouped[day].push(anime);
    });
    return grouped;
  };

  const groupedSchedule = activeDay ? { [activeDay]: schedule } : groupByDay();

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-900/30 p-8">
        <div className="flex items-center gap-4 mb-4">
          <Calendar size={48} className="text-cyan-400" />
          <div>
            <h1 className="text-4xl font-black text-white">Anime Schedule</h1>
            <p className="text-slate-300 mt-2">Full week broadcast schedule with airing times</p>
          </div>
        </div>

        {/* Day Tabs */}
        <div className="flex flex-wrap gap-3 mt-6">
          {days.map((day) => (
            <button
              key={day.id}
              onClick={() => setActiveDay(day.id)}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                activeDay === day.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </section>

      {/* Schedule Content */}
      {loading ? (
        <Loader />
      ) : error ? (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-6 py-10 text-center text-red-200">
          {error}
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedSchedule).map(([day, animeList]) => (
            <div key={day}>
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="text-cyan-400" size={24} />
                <h2 className="text-2xl font-bold text-white capitalize">{day}</h2>
                <span className="text-slate-400 text-sm">({animeList.length} shows)</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {animeList.map((anime) => (
                  <div key={anime.id} className="space-y-2">
                    <AnimeCard anime={anime} />
                    {anime.airingTime && (
                      <div className="flex items-center gap-2 text-xs text-slate-400 px-2">
                        <Clock size={12} />
                        <span>{anime.airingTime} {anime.timezone || 'JST'}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {schedule.length === 0 && (
            <div className="text-center text-slate-400 py-10">
              No anime scheduled for this day.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnimeSchedulePage;
