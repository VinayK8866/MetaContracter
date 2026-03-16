'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Check, Copy, FileText, Sparkles, Clock } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useCooldown } from '@/hooks/useCooldown';

export function ConstitutionViewer({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
	const { constitution } = useStore();
	const [copied, setCopied] = useState(false);
	const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { isCooldownActive, remainingTime, startCooldown } = useCooldown();

	const handleCopy = () => {
		navigator.clipboard.writeText(constitution);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const generateRoadmap = async () => {
		setIsGeneratingRoadmap(true);
		setError(null);
		try {
			const { vibe, constitution } = useStore.getState();
			const res = await fetch('/api/chat/roadmap', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ vibe, constitution }),
			});

			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(errorData.error || 'Failed to generate roadmap');
			}

			const data = await res.json();
			if (!data.tasks || !Array.isArray(data.tasks)) {
				throw new Error('Invalid response format from AI');
			}

			startCooldown();
			useStore.getState().setRoadmapTasks(data.tasks);
			onNext();
		} catch (err: any) {
			console.error("Failed to generate roadmap", err);
			setError(err.message || 'Failed to generate roadmap. Gemini might be busy, please wait a few seconds and try again.');
		} finally {
			setIsGeneratingRoadmap(false);
		}
	};

	return (
		<div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
				<div className="space-y-2">
					<div className="flex items-center gap-2 text-emerald-500 font-medium">
						<Check className="h-5 w-5" /> Constitution Generated
					</div>
					<h2 className="text-3xl font-bold tracking-tight">Project Constraints</h2>
					<p className="text-muted-foreground">
						This is your <code className="bg-secondary px-1.5 py-0.5 rounded text-foreground">CLAUDE.md</code>.
						Drop this into your project root to align AI agents with your architecture.
					</p>
					{error && (
						<div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg text-red-400 text-xs flex items-center justify-between">
							<span>{error}</span>
							<Button size="sm" variant="outline" onClick={generateRoadmap} className="h-7 border-red-500/30 text-red-400 hover:bg-red-500/10 text-[10px]">
								Retry
							</Button>
						</div>
					)}
				</div>

				<Button
					onClick={handleCopy}
					variant={copied ? "default" : "outline"}
					className={`shrink-0 transition-all ${copied ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600' : 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10'}`}
				>
					{copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
					{copied ? "Copied to Clipboard" : "Copy CLAUDE.md"}
				</Button>
			</div>

			<Card className="bg-secondary/10 border-border/50 overflow-hidden shadow-inner flex flex-col h-[500px]">
				<div className="bg-secondary/30 border-b border-border/50 px-4 py-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
					<FileText className="h-4 w-4" />
					CLAUDE.md
				</div>
				<div className="flex-1 overflow-y-auto p-6">
					<div className="prose prose-invert prose-emerald max-w-none">
						<ReactMarkdown>{constitution}</ReactMarkdown>
					</div>
				</div>
			</Card>

			<div className="flex justify-between pt-4">
				<Button
					variant="ghost"
					onClick={onBack}
					disabled={isGeneratingRoadmap}
				>
					Back to Discovery
				</Button>
				<Button
					size="lg"
					onClick={generateRoadmap}
					disabled={isGeneratingRoadmap || isCooldownActive}
					className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 shadow-lg shadow-blue-500/20 min-w-[240px]"
				>
					{isGeneratingRoadmap ? (
						<>
							<Sparkles className="h-4 w-4 mr-2 animate-spin" /> Analyzing Roadmap...
						</>
					) : isCooldownActive ? (
						<>
							<Clock className="h-4 w-4 mr-2 animate-pulse" /> Rate Limit Protection ({remainingTime}s)
						</>
					) : (
						<>
							Generate Execution Roadmap <ArrowRight className="h-4 w-4 ml-2" />
						</>
					)}
				</Button>
			</div>
		</div>
	);
}
