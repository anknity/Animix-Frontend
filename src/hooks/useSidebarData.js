import { useEffect, useState } from 'react';
import { getPopularAnime, getTrendingAnime, getWeeklySchedule } from '../services/api';
import { computeTopRated, extractTodaySchedule } from '../utils/animeMetrics';

const useSidebarData = () => {
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchSidebarData = async () => {
      try {
        setLoading(true);
        const [popularRes, scheduleRes, trendingRes] = await Promise.allSettled([
          getPopularAnime(1, 10),
          getWeeklySchedule(),
          getTrendingAnime(1, 10)
        ]);

        const popularList = popularRes.status === 'fulfilled' ? popularRes.value.results || [] : [];
        const weeklyScheduleList = scheduleRes.status === 'fulfilled' ? scheduleRes.value.results || [] : [];
        const trendingList = trendingRes.status === 'fulfilled' ? trendingRes.value.results || [] : [];

        if (!isMounted) return;

        setPopular(popularList);
        setTodaySchedule(extractTodaySchedule(weeklyScheduleList));

        const topSource = weeklyScheduleList.length > 0
          ? weeklyScheduleList
          : trendingList.length > 0
            ? trendingList
            : popularList;

        setTopRated(computeTopRated(topSource));
      } catch (error) {
        if (!isMounted) return;
        console.error('Error fetching sidebar data:', error);
        setPopular([]);
        setTopRated([]);
        setTodaySchedule([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSidebarData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { popular, topRated, todaySchedule, loading };
};

export default useSidebarData;
