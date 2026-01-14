import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertTriangle, Search, Film, BookOpen, Sparkles, Star, Calendar, Users, PlayCircle } from 'lucide-react';
import MangaCard from '../components/MangaCard';
import Loader from '../components/Loader';
import { getTrendingManga, getPopularManga, globalSearch, getTopAnime } from '../services/api';

const FILTER_COPY = {
	trending: 'Trending now',
	library: 'Most followed',
	bookmarks: 'Your saved series'
};

const CONTENT_TABS = [
	{ key: 'all', label: 'All', icon: Sparkles },
	{ key: 'anime', label: 'Anime', icon: Film },
	{ key: 'manga', label: 'Manga', icon: BookOpen }
];

const API_ROOT = import.meta.env.VITE_API_BASE_URL || 'https://animix-backend.onrender.com';

const proxyImage = (url) => {
	if (!url || !url.includes('mangadex.org')) return url;
	return `${API_ROOT}/api/proxy/image?url=${encodeURIComponent(url)}`;
};

// Unified card component for search results
const SearchResultCard = ({ item }) => {
	const isAnime = item.contentType === 'anime';
	
	if (isAnime) {
		const title = item.titleEnglish || item.title || 'Untitled';
		const cover = item.coverImage || item.bannerImage;
		
		return (
			<Link
				to={`/anime?focus=${item.id}`}
				className="group block overflow-hidden rounded-2xl border border-white/5 bg-slate-900/60 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-xl hover:shadow-cyan-400/20"
			>
				<div className="relative aspect-[2/3] overflow-hidden">
					<img
						src={cover || 'https://via.placeholder.com/300x420?text=No+Cover'}
						alt={title}
						className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
						loading="lazy"
					/>
					<div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-cyan-500/90 px-2 py-1 text-xs font-semibold text-white">
						<Film size={12} />
						Anime
					</div>
					{item.score && (
						<div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-yellow-500/90 px-2 py-1 text-xs font-bold text-slate-900">
							<Star size={12} fill="currentColor" />
							{Number(item.score).toFixed(1)}
						</div>
					)}
					<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
					<div className="pointer-events-none absolute bottom-0 left-0 right-0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
						<div className="space-y-2 text-sm">
							{item.genres && item.genres.length > 0 && (
								<div className="flex flex-wrap gap-1 text-[11px]">
									{item.genres.slice(0, 3).map((genre, idx) => (
										<span key={idx} className="rounded-full bg-cyan-500/20 px-2 py-[2px] text-cyan-200">
											{genre}
										</span>
									))}
								</div>
							)}
							<p className="line-clamp-3 text-slate-200/90">
								{item.synopsis ? item.synopsis.replace(/<[^>]+>/g, '').slice(0, 120) + '...' : 'No description available.'}
							</p>
						</div>
					</div>
				</div>
				<div className="space-y-2 px-4 py-3">
					<h3 className="line-clamp-2 text-base font-semibold text-white">{title}</h3>
					<div className="flex items-center justify-between text-xs text-slate-400">
						<span className="flex items-center gap-1 font-medium">
							<PlayCircle size={14} />
							{item.episodes ? `${item.episodes} eps` : 'Ongoing'}
						</span>
						<div className="flex items-center gap-3">
							{item.year && (
								<span className="flex items-center gap-1">
									<Calendar size={14} />
									{item.year}
								</span>
							)}
						</div>
					</div>
				</div>
			</Link>
		);
	}

	// Manga card
	return <MangaCard manga={item} />;
};

const SearchPage = () => {
	const location = useLocation();
	const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
	const query = params.get('q')?.trim() ?? '';
	const filter = params.get('filter')?.toLowerCase() ?? '';

	const [searchResults, setSearchResults] = useState({ anime: [], manga: [], all: [] });
	const [activeTab, setActiveTab] = useState('all');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		let active = true;

		const load = async () => {
			setLoading(true);
			setError(null);

			try {
				if (filter === 'bookmarks') {
					if (!active) return;
					setSearchResults({ anime: [], manga: [], all: [] });
					return;
				}

				if (query) {
					// Use global search for queries
					const data = await globalSearch(query, 1, 24);
					if (!active) return;
					setSearchResults(data);
					return;
				}

				// Default: show trending content from both
				if (filter === 'trending') {
					const [animeData, mangaData] = await Promise.all([
						getTopAnime('anime', 'airing', 1, 12),
						getTrendingManga(1, 12)
					]);
					if (!active) return;
					
					const animeResults = (animeData.results || []).map(item => ({ ...item, contentType: 'anime' }));
					const mangaResults = (mangaData.results || []).map(item => ({ ...item, contentType: 'manga' }));
					
					setSearchResults({
						anime: animeResults,
						manga: mangaResults,
						all: [...animeResults, ...mangaResults]
					});
					return;
				}

				// Popular content
				const [animeData, mangaData] = await Promise.all([
					getTopAnime('anime', 'bypopularity', 1, 12),
					getPopularManga(1, 12)
				]);
				if (!active) return;
				
				const animeResults = (animeData.results || []).map(item => ({ ...item, contentType: 'anime' }));
				const mangaResults = (mangaData.results || []).map(item => ({ ...item, contentType: 'manga' }));
				
				setSearchResults({
					anime: animeResults,
					manga: mangaResults,
					all: [...animeResults, ...mangaResults]
				});
			} catch (err) {
				if (!active) return;
				setError(err?.message || 'Something went wrong while searching.');
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		};

		load();

		return () => {
			active = false;
		};
	}, [query, filter]);

	const heading = useMemo(() => {
		if (query) {
			return `Results for "${query}"`;
		}
		if (FILTER_COPY[filter]) {
			return FILTER_COPY[filter];
		}
		return 'Discover content';
	}, [query, filter]);

	const currentResults = useMemo(() => {
		return searchResults[activeTab] || [];
	}, [searchResults, activeTab]);

	const resultCounts = useMemo(() => ({
		all: searchResults.all?.length || 0,
		anime: searchResults.anime?.length || 0,
		manga: searchResults.manga?.length || 0
	}), [searchResults]);

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

	if (filter === 'bookmarks') {
		return (
			<div className="rounded-3xl border border-white/5 bg-slate-900/60 p-8 text-center">
				<p className="text-lg font-semibold text-white">No bookmarks yet</p>
				<p className="mt-2 text-sm text-slate-400">Save chapters from any manga or anime to curate your personal library.</p>
			</div>
		);
	}

	if (!currentResults.length) {
		return (
			<div className="space-y-6">
				<div>
					<h1 className="text-2xl font-bold text-white">{heading}</h1>
					<p className="text-sm text-slate-400">Global search across anime & manga.</p>
				</div>

				{/* Content Type Tabs */}
				<div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
					{CONTENT_TABS.map((tab) => {
						const Icon = tab.icon;
						const isActive = activeTab === tab.key;
						return (
							<button
								key={tab.key}
								type="button"
								onClick={() => setActiveTab(tab.key)}
								className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
									isActive
										? 'border-cyan-400/50 bg-cyan-500/20 text-cyan-100'
										: 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
								}`}
							>
								<Icon size={16} />
								{tab.label}
								<span className={`rounded-full px-2 py-0.5 text-xs ${isActive ? 'bg-cyan-500/30' : 'bg-white/10'}`}>
									{resultCounts[tab.key]}
								</span>
							</button>
						);
					})}
				</div>

				<div className="flex flex-col items-center gap-4 rounded-3xl border border-white/5 bg-slate-900/60 p-10 text-center text-slate-300">
					<AlertTriangle size={32} className="text-cyan-300" />
					<p className="text-lg font-semibold text-white">No matches found</p>
					<p className="text-sm text-slate-400">Try searching with a different name or browse the trending picks.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-white">{heading}</h1>
				<p className="text-sm text-slate-400">
					{query ? 'Global search across anime & manga.' : 'Curated using AniVibe metrics.'}
				</p>
			</div>

			{/* Content Type Tabs */}
			<div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
				{CONTENT_TABS.map((tab) => {
					const Icon = tab.icon;
					const isActive = activeTab === tab.key;
					return (
						<button
							key={tab.key}
							type="button"
							onClick={() => setActiveTab(tab.key)}
							className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
								isActive
									? 'border-cyan-400/50 bg-cyan-500/20 text-cyan-100'
									: 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
							}`}
						>
							<Icon size={16} />
							{tab.label}
							<span className={`rounded-full px-2 py-0.5 text-xs ${isActive ? 'bg-cyan-500/30' : 'bg-white/10'}`}>
								{resultCounts[tab.key]}
							</span>
						</button>
					);
				})}
			</div>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
				{currentResults.map((item) => (
					<SearchResultCard key={`${item.contentType}-${item.id}`} item={item} />
				))}
			</div>
		</div>
	);
};

export default SearchPage;
