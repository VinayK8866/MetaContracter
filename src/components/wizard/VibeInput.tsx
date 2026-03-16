'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles, Clock } from 'lucide-react';
import { useCooldown } from '@/hooks/useCooldown';

export function VibeInput({ onNext }: { onNext: () => void }) {
	const { vibe, setVibe } = useStore();
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { isCooldownActive, remainingTime, startCooldown } = useCooldown();

	const handleSubmit = async () => {
		if (!vibe.trim() || isCooldownActive) return;
		setIsGenerating(true);
		setError(null);

		try {
			// Calls the discovery API to generate questions
			const res = await fetch('/api/chat/discovery', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ vibe }),
			});

			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(errorData.error || 'Failed to generate questions');
			}

			const data = await res.json();
			if (!data.questions || !Array.isArray(data.questions)) {
				throw new Error('Invalid response format from AI');
			}

			startCooldown();
			useStore.getState().setQuestions(data.questions);
			onNext();
		} catch (error: any) {
			console.error('Failed to generate questions:', error);
			setError(error.message || 'Failed to generate questions. Gemini might be busy or the model name is incorrect. Please try again.');
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
			<div className="text-center space-y-4 max-w-2xl">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
					Drop a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Vibe.</span>
					<br /> We&apos;ll build the Roadmap.
				</h1>
				<p className="text-muted-foreground text-lg">
					Describe your application idea in plain English. The Architect will ask you clarifying questions and piece together a watertight development contract.
				</p>
				{error && (
					<div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-400 text-sm flex items-center justify-between mt-4">
						<span>{error}</span>
						<Button size="sm" variant="outline" onClick={handleSubmit} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
							Retry
						</Button>
					</div>
				)}
			</div>

			<div className="w-full max-w-2xl space-y-4">
				<Textarea
					placeholder="e.g. I want to build a marketplace for AI prompts. Users can browse, buy, and sell prompt templates. It needs stripe integration and user profiles."
					className="min-h-[200px] resize-none text-lg p-6 rounded-xl border-border/50 bg-secondary/20 focus-visible:ring-blue-500/50 transition-all shadow-inner"
					value={vibe}
					onChange={(e) => setVibe(e.target.value)}
				/>

				<div className="flex justify-end">
					<Button
						size="lg"
						onClick={handleSubmit}
						disabled={!vibe.trim() || isGenerating || isCooldownActive}
						className="rounded-full px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium min-w-[200px]"
					>
						{isGenerating ? (
							<span className="flex items-center gap-2">
								<Sparkles className="h-5 w-5 animate-spin" /> Analyzing Vibe...
							</span>
						) : isCooldownActive ? (
							<span className="flex items-center gap-2">
								<Clock className="h-5 w-5 animate-pulse" /> Rate Limit Protection ({remainingTime}s)
							</span>
						) : (
							<span className="flex items-center gap-2">
								Start Architecture <Sparkles className="h-5 w-5" />
							</span>
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}
