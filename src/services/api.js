import axios from 'axios';

const API_ROOT = 'https://animix-backend.onrender.com'|| import.meta.env.VITE_API_BASE_URL  ;
const API_BASE_URL = `${API_ROOT}/api/manga`;

export const getTrendingManga = async (page = 1, limit = 12) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/trending`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching trending manga:', error);
    throw error;
  }
};

export const getPopularManga = async (page = 1, limit = 12) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/popular`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching popular manga:', error);
    throw error;
  }
};

export const getLatestChapters = async (limit = 12) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/latest`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching latest chapters:', error);
    throw error;
  }
};

export const searchManga = async (query, page = 1, limit = 20) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/search`, {
      params: { query, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching manga:', error);
    throw error;
  }
};

export const getMangaDetails = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching manga details:', error);
    throw error;
  }
};

export const getMangaChapters = async (id, page = 1, limit = 100) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}/chapters`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching manga chapters:', error);
    throw error;
  }
};

export const getChapterPages = async (chapterId) => {
  try {
    const response = await axios.get(`${API_ROOT}/api/chapters/${chapterId}/pages`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chapter pages:', error);
    throw error;
  }
};

// ============ ANIME API ============

const ANIME_BASE_URL = `${API_ROOT}/api/anime`;

export const getTopAnime = async (type = 'anime', filter = 'airing', page = 1, limit = 20) => {
  try {
    const response = await axios.get(`${ANIME_BASE_URL}/top`, {
      params: { type, filter, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching top anime:', error);
    throw error;
  }
};

export const getCurrentSeasonAnime = async (page = 1) => {
  try {
    const response = await axios.get(`${ANIME_BASE_URL}/season/now`, {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching current season anime:', error);
    throw error;
  }
};

export const getAnimeSchedule = async (day) => {
  try {
    const params = day ? { day } : {};
    const response = await axios.get(`${ANIME_BASE_URL}/schedule`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching anime schedule:', error);
    throw error;
  }
};

export const searchAnime = async (query, page = 1, limit = 20) => {
  try {
    const response = await axios.get(`${ANIME_BASE_URL}/search`, {
      params: { q: query, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching anime:', error);
    throw error;
  }
};

export const getAnimeById = async (id) => {
  try {
    const response = await axios.get(`${ANIME_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching anime details:', error);
    throw error;
  }
};

export const getAnimeEpisodes = async (id, page = 1, malId) => {
  try {
    const params = { page };
    if (malId) {
      params.malId = malId;
    }
    const response = await axios.get(`${ANIME_BASE_URL}/${id}/episodes`, {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching anime episodes:', error);
    throw error;
  }
};

export const getAnimeRecommendations = async (id, malId) => {
  try {
    const params = {};
    if (malId) {
      params.malId = malId;
    }
    const response = await axios.get(`${ANIME_BASE_URL}/${id}/recommendations`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching anime recommendations:', error);
    throw error;
  }
};

// Get famous anime (Naruto, One Piece, Bleach, Dragon Ball, etc.)
export const getFamousAnime = async () => {
  try {
    const response = await axios.get(`${ANIME_BASE_URL}/famous`);
    return response.data;
  } catch (error) {
    console.error('Error fetching famous anime:', error);
    throw error;
  }
};

// Get top episodes of the week
export const getTopEpisodesOfWeek = async () => {
  try {
    const response = await axios.get(`${ANIME_BASE_URL}/episodes/weekly-top`);
    return response.data;
  } catch (error) {
    console.error('Error fetching top episodes:', error);
    throw error;
  }
};
