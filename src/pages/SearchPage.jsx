import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import MangaCard from '../components/MangaCard';
import Loader from '../components/Loader';
import { getTrendingManga, getPopularManga, searchManga } from '../services/api';

const FILTER_COPY = {
	trending: 'Trending now',
	library: 'Most followed',
	bookmarks: 'Your saved series'
};

const SearchPage = () => {
	const location = useLocation();
	const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
	const query = params.get('q')?.trim() ?? '';
	const filter = params.get('filter')?.toLowerCase() ?? '';

	const [results, setResults] = useState([]);
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
					setResults([]);
					return;
				}

				if (query) {
					const data = await searchManga(query, 1, 24);
					if (!active) return;
					setResults(data.results || []);
					return;
				}

				if (filter === 'trending') {
					const data = await getTrendingManga(1, 24);
					if (!active) return;
					setResults(data.results || []);
					return;
				}

				const data = await getPopularManga(1, 24);
				if (!active) return;
				setResults(data.results || []);
			} catch (err) {
				if (!active) return;
				setError(err?.message || 'Something went wrong while fetching manga.');
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
		return 'Discover manga';
	}, [query, filter]);

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
				<p className="mt-2 text-sm text-slate-400">Save chapters from any manga to curate your personal reading shelf.</p>
			</div>
		);
	}

	if (!results.length) {
		return (
			<div className="flex flex-col items-center gap-4 rounded-3xl border border-white/5 bg-slate-900/60 p-10 text-center text-slate-300">
				<AlertTriangle size={32} className="text-cyan-300" />
				<p className="text-lg font-semibold text-white">No matches found</p>
				<p className="text-sm text-slate-400">Try searching with a different name or browse the trending picks.</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-white">{heading}</h1>
				<p className="text-sm text-slate-400">{query ? 'Powered by MangaDex search.' : 'Curated using ANIMIX reading metrics.'}</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
				{results.map((manga) => (
					<MangaCard key={manga.id} manga={manga} />
				))}
			</div>
		</div>
	);
};

export default SearchPage;
