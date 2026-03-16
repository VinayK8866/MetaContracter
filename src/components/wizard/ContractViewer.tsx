'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Copy, ArrowLeft, Terminal, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCooldown } from '@/hooks/useCooldown';

export function ContractViewer({ onBack, selectedTaskId }: { onBack: () => void; selectedTaskId: string | null }) {
	const { roadmapTasks, constitution, updateTaskStatus, setTaskContract } = useStore();
	const [isGenerating, setIsGenerating] = useState(false);
	const [copied, setCopied] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { isCooldownActive, remainingTime, startCooldown } = useCooldown();

	// Find the current task
	const currentTask = selectedTaskId
		? roadmapTasks.find(t => t.id === selectedTaskId)
		: roadmapTasks.find(t => t.status === 'pending');

	useEffect(() => {
		if (currentTask && !currentTask.contract && !isGenerating && !isCooldownActive) {
			generateContract();
		}
	}, [currentTask, isCooldownActive]);

	const generateContract = async () => {
		if (!currentTask || isCooldownActive) return;
		setIsGenerating(true);
		setError(null);
		try {
			const res = await fetch('/api/chat/contract', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ constitution, task: currentTask }),
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || 'Failed to generate contract');
			}
			
			// Validate that all required fields are present and not empty
			if (!data.goal || !data.constraints || !data.format || !data.failureConditions) {
				throw new Error('Gemini returned an incomplete contract. Please try again.');
			}

			startCooldown();
			setTaskContract(currentTask.id, data);
		} catch (err: any) {
			console.error(err);
			setError(err.message || 'Failed to generate contract.');
		} finally {
			setIsGenerating(false);
		}
	};

	const contractText = currentTask?.contract
		? `<contract>
<goal>
${currentTask.contract.goal}
</goal>

<constraints>
${currentTask.contract.constraints}
Read CLAUDE.md before beginning.
</constraints>

<format>
${currentTask.contract.format}
</format>

<failure_conditions>
${currentTask.contract.failureConditions}
</failure_conditions>
</contract>`
		: '';

	const handleCopy = () => {
		navigator.clipboard.writeText(contractText);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleDone = () => {
		if (currentTask) {
			if (currentTask.status === 'pending') {
				updateTaskStatus(currentTask.id, 'done');
			}
			onBack();
		}
	};

	if (!currentTask) return null;

	return (
		<div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" onClick={onBack} disabled={isGenerating}>
					<ArrowLeft className="h-5 w-5" />
				</Button>
				<div>
					<h2 className="text-3xl font-bold tracking-tight">Prompt Contract</h2>
					<p className="text-muted-foreground">Task: {currentTask.title}</p>
				</div>
			</div>

			<Card className="bg-secondary/10 border-border/50 overflow-hidden shadow-inner flex flex-col">
				<div className="bg-secondary/30 border-b border-border/50 px-4 py-3 flex justify-between items-center">
					<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
						<Terminal className="h-4 w-4" />
						contract.txt
					</div>
					<Button
						onClick={handleCopy}
						size="sm"
						variant={copied ? "default" : "secondary"}
						disabled={isGenerating || !currentTask.contract}
						className={`h-8 transition-all ${copied ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
					>
						{copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
						{copied ? "Copied" : "Copy for Claude"}
					</Button>
				</div>

				<div className="p-6 bg-[#0d1117] text-gray-300 font-mono text-sm leading-relaxed overflow-x-auto min-h-[300px]">
					{isGenerating ? (
						<div className="flex items-center justify-center h-full animate-pulse text-blue-400">
							Generating watertight contract constraints...
						</div>
					) : isCooldownActive && !currentTask.contract ? (
						<div className="flex flex-col items-center justify-center h-full text-amber-400 space-y-4">
							<Clock className="h-8 w-8 animate-pulse" />
							<p>Rate Limit Protection: Waiting {remainingTime}s before generating...</p>
							<p className="text-xs text-muted-foreground">This ensures we don't hit Gemini's API limits.</p>
						</div>
					) : error ? (
						<div className="flex flex-col items-center justify-center h-full text-red-400 space-y-4">
							<p>Error: {error}</p>
							<Button variant="outline" onClick={generateContract} className="mt-4 border-red-500/30 text-red-400 hover:bg-red-500/10">
								Retry Generating Contract
							</Button>
						</div>
					) : (
						<pre className="whitespace-pre-wrap">{contractText}</pre>
					)}
				</div>
			</Card>

			<div className="flex justify-end pt-4">
				<Button
					size="lg"
					onClick={handleDone}
					disabled={isGenerating || !currentTask.contract}
					className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 shadow-lg shadow-blue-500/20"
				>
					{currentTask.status === 'done' ? 'Back to Roadmap' : 'Mark Task as Done'} <Check className="h-5 w-5 ml-2" />
				</Button>
			</div>
		</div>
	);
}
