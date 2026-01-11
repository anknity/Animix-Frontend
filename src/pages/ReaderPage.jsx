import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import Loader from '../components/Loader';
import { getChapterPages } from '../services/api';

const ReaderPage = () => {
	const { mangaId, chapterId } = useParams();
	const [pages, setPages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		let active = true;

		const load = async () => {
			setLoading(true);
			setError(null);

			try {
				const data = await getChapterPages(chapterId);
				if (!active) return;
				setPages(data.pages || []);
			} catch (err) {
				if (!active) return;
				setError(err?.message || 'Unable to load this chapter.');
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
	}, [chapterId]);

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

	if (!pages.length) {
		return (
			<div className="rounded-2xl border border-white/5 bg-slate-900/60 px-6 py-10 text-center text-slate-300">
				This chapter is not yet available for reading in English.
			</div>
		);
	}

	return (
		<div className="space-y-6 pb-10">
			<div className="flex flex-col gap-3 rounded-3xl border border-white/5 bg-slate-900/60 p-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<Link to={`/manga/${mangaId}`} className="flex items-center gap-2 text-sm text-cyan-200 hover:text-cyan-100">
						<ArrowLeft size={16} />
						Back to manga
					</Link>
					<span className="text-xs uppercase tracking-[0.35em] text-slate-400">Chapter {chapterId}</span>
				</div>
				<div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
					<p>Tap or scroll to read. Pages are optimized from MangaDex CDN.</p>
					<a
						href={pages[0]?.url}
						download
						className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
					>
						<Download size={16} />
						Download first page
					</a>
				</div>
			</div>

			<div className="flex flex-col items-center gap-6">
				{pages.map((page) => (
					<img
						key={page.index}
						src={page.url}
						alt={`Chapter ${chapterId} page ${page.index}`}
						className="w-full max-w-3xl rounded-2xl border border-white/10 bg-slate-950 object-contain shadow-xl shadow-black/50"
						loading="lazy"
					/>
				))}
			</div>
		</div>
	);
};

export default ReaderPage;
