import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Star, Tag, Users } from 'lucide-react';
import Loader from '../components/Loader';
import { getMangaDetails, getMangaChapters } from '../services/api';

const MangaDetailsPage = () => {
	const { mangaId } = useParams();
	const [manga, setManga] = useState(null);
	const [chapters, setChapters] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [chapterPage, setChapterPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);

	const CHAPTERS_PER_PAGE = 20;

	useEffect(() => {
		let active = true;

		const load = async () => {
			setLoading(true);
			setError(null);

			try {
				const [mangaData, chapterData] = await Promise.all([
					getMangaDetails(mangaId),
					getMangaChapters(mangaId, 1, CHAPTERS_PER_PAGE)
				]);

				if (!active) return;
				setManga(mangaData);
				setChapters(chapterData.results || []);
				setHasMore((chapterData.results || []).length === CHAPTERS_PER_PAGE);
			} catch (err) {
				if (!active) return;
				setError(err?.message || 'Unable to load this manga right now.');
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
	}, [mangaId]);

	const loadMoreChapters = async () => {
		try {
			setLoadingMore(true);
			const nextPage = chapterPage + 1;
			const chapterData = await getMangaChapters(mangaId, nextPage, CHAPTERS_PER_PAGE);
			
			setChapters(prev => [...prev, ...(chapterData.results || [])]);
			setChapterPage(nextPage);
			setHasMore((chapterData.results || []).length === CHAPTERS_PER_PAGE);
		} catch (err) {
			console.error('Error loading more chapters:', err);
		} finally {
			setLoadingMore(false);
		}
	};

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

	if (!manga) {
		return null;
	}

	const title = manga.title?.english || manga.title?.romaji || manga.title?.native || 'Untitled';
	const description = manga.description?.replace(/<[^>]+>/g, '') || 'No synopsis available just yet.';

	return (
		<div className="space-y-10 pb-10">
			<div className="flex items-center gap-3 text-sm text-slate-400">
				<Link to="/" className="flex items-center gap-2 text-cyan-200 hover:text-cyan-100">
					<ArrowLeft size={16} />
					Back to home
				</Link>
				<span>•</span>
				<Link to="/search" className="hover:text-white">Discover</Link>
			</div>

			<section className="flex flex-col gap-6 rounded-3xl border border-white/5 bg-slate-900/60 p-6 lg:flex-row lg:items-start lg:gap-8">
				{manga.cover && (
					<img
						src={manga.cover}
						alt={title}
						className="w-full max-w-xs rounded-2xl border border-white/10 object-cover shadow-lg shadow-cyan-900/20"
						loading="lazy"
					/>
				)}

				<div className="flex-1 space-y-5">
					<div className="space-y-3">
						<p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">Manga detail</p>
						<h1 className="text-3xl font-black text-white sm:text-4xl">{title}</h1>
						<p className="text-sm leading-6 text-slate-300 max-w-3xl">{description}</p>
					</div>

					<div className="flex flex-wrap gap-4 text-sm text-slate-300">
						{manga.authors && manga.authors.length > 0 && (
							<span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
								<Users size={16} />
								{manga.authors.join(', ')}
							</span>
						)}
						{manga.demographic && (
							<span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
								<Tag size={16} />
								{manga.demographic}
							</span>
						)}
						{typeof manga.rating === 'number' && (
							<span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-cyan-200">
								<Star size={16} />
								{manga.rating.toFixed(2)}
							</span>
						)}
						{manga.follows && (
							<span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
								<Users size={16} />
								{Math.round(Number(manga.follows) / 1000)}K followers
							</span>
						)}
					</div>

					{manga.tags && manga.tags.length > 0 && (
						<div className="flex flex-wrap gap-2 text-xs">
							{manga.tags.slice(0, 8).map((tag) => (
								<span key={tag} className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-cyan-200">
									{tag}
								</span>
							))}
						</div>
					)}
				</div>
			</section>

			<section className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-bold text-white">Chapters</h2>
					<span className="text-sm text-slate-400">Showing {chapters.length} chapter{chapters.length === 1 ? '' : 's'} ({CHAPTERS_PER_PAGE} per page)</span>
				</div>

				<div className="rounded-3xl border border-white/5 bg-slate-900/40">
					<ul className="divide-y divide-white/5">
						{chapters.map((chapter) => (
							<li key={chapter.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
								<div className="space-y-1 text-sm text-slate-300">
									<p className="flex items-center gap-2 text-base font-semibold text-white">
										<BookOpen size={16} />
										Chapter {chapter.chapter || '—'}
									</p>
									{chapter.title && <p className="text-slate-400">{chapter.title}</p>}
									{chapter.readableAt && (
										<p className="text-xs text-slate-500">Released {new Date(chapter.readableAt).toLocaleDateString()}</p>
									)}
								</div>

								<Link
									to={`/manga/${mangaId}/read/${chapter.id}`}
									className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
								>
									Start reading
								</Link>
							</li>
						))}
					</ul>

					{hasMore && (
						<div className="p-6 text-center border-t border-white/5">
							<button
								onClick={loadMoreChapters}
								disabled={loadingMore}
								className="px-6 py-3 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-semibold hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
							>
								{loadingMore ? 'Loading...' : `Load Next ${CHAPTERS_PER_PAGE} Chapters`}
							</button>
						</div>
					)}
				</div>
			</section>
		</div>
	);
};

export default MangaDetailsPage;
