import { Clock, TrendingUp, Award, Trophy } from 'lucide-react';

export const DEFAULT_ANIME_FILTER = 'airing';

const animeFilters = [
  { id: 'airing', label: 'Currently Airing', Icon: Clock },
  { id: 'upcoming', label: 'Upcoming', Icon: TrendingUp },
  { id: 'favorite', label: 'Legendary Anime', Icon: Award },
  { id: 'weekly-episodes', label: 'Top Episodes This Week', Icon: Trophy }
];

export const isValidAnimeFilter = (value) => animeFilters.some((filter) => filter.id === value);

export const normalizeAnimeFilter = (value) => (isValidAnimeFilter(value) ? value : DEFAULT_ANIME_FILTER);

export default animeFilters;
