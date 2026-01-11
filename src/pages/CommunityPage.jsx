import { MessageCircle, Send } from 'lucide-react';

const CommunityPage = () => {
	return (
		<div className="space-y-8 pb-10">
			<header className="rounded-3xl border border-white/5 bg-slate-900/60 p-8">
				<div className="flex items-center gap-3 text-cyan-200">
					<MessageCircle size={24} />
					<span className="text-xs font-semibold uppercase tracking-[0.35em]">Community beta</span>
				</div>
				<h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">Discuss chapters with other readers</h1>
				<p className="mt-3 max-w-2xl text-sm text-slate-300">
					ANIMIX is building a live chapter discussion lounge. Share quick reactions, drop feedback for scanlation teams, and discover manga recommendations from fellow readers.
				</p>
			</header>

			<section className="grid gap-6 lg:grid-cols-2">
				<div className="rounded-3xl border border-white/5 bg-slate-900/50 p-6">
					<h2 className="text-xl font-semibold text-white">Live chat (coming soon)</h2>
					<p className="mt-2 text-sm text-slate-400">
						Real-time chapter threads will appear here. You will be able to join a specific chapter room directly from the reader.
					</p>
					<div className="mt-6 h-64 rounded-2xl border border-dashed border-white/10 bg-slate-900/70" />
				</div>

				<div className="rounded-3xl border border-white/5 bg-slate-900/50 p-6">
					<h2 className="text-xl font-semibold text-white">Feedback wall</h2>
					<p className="mt-2 text-sm text-slate-400">
						Drop ideas for new features, report broken chapters, or shout out your favorite teams. We will publish the first iteration of this wall soon.
					</p>
					<form className="mt-6 space-y-3">
						<textarea
							className="h-32 w-full resize-none rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-200 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
							placeholder="Share a feature idea or request a manga..."
							disabled
						/>
						<button
							type="button"
							disabled
							className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-slate-400"
						>
							<Send size={16} />
							Submission soon
						</button>
					</form>
				</div>
			</section>
		</div>
	);
};

export default CommunityPage;
