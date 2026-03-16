'use client';

import { useStore } from '@/lib/store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, ArrowRight, Clock } from 'lucide-react';
import { useState } from 'react';
import { useCooldown } from '@/hooks/useCooldown';

export function DiscoveryQuestions({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
	const { questions, setAnswers, answers } = useStore();
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { isCooldownActive, remainingTime, startCooldown } = useCooldown();

	const safeQuestions = questions || [];

	// Dynamically create a Zod schema where every question requires an answer
	const schemaShape: Record<string, z.ZodString> = {};
	safeQuestions.forEach((_, idx) => {
		schemaShape[`q_${idx}`] = z.string().min(2, 'Please provide more detail.');
	});
	const formSchema = z.object(schemaShape);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: safeQuestions.reduce((acc, q, idx) => {
			acc[`q_${idx}`] = answers[q] || '';
			return acc;
		}, {} as Record<string, string>),
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		// Map the generic q_0, q_1 keys back to exactly what question was asked
		const answersMap: Record<string, string> = {};
		safeQuestions.forEach((q, idx) => {
			answersMap[q] = values[`q_${idx}`];
		});

		setAnswers(answersMap);
		setIsGenerating(true);
		setError(null);

		try {
			const { vibe } = useStore.getState();

			const res = await fetch('/api/chat/constitution', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ vibe, answers: answersMap }),
			});

			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(errorData.error || 'Failed to generate constitution');
			}

			const data = await res.json();
			if (!data.constitution) {
				throw new Error('Invalid response from AI');
			}

			startCooldown();
			useStore.getState().setConstitution(data.constitution);
			onNext();
		} catch (error: any) {
			console.error('Failed to generate constitution:', error);
			setError(error.message || 'Failed to generate constitution. Please wait a moment and try again.');
		} finally {
			setIsGenerating(false);
		}
	};

	if (!questions || questions.length === 0) {
		return <div className="text-center p-8 text-muted-foreground animate-pulse">Loading architectural context...</div>;
	}

	return (
		<div className="w-full max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
			<div className="space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">System Discovery</h2>
				<p className="text-muted-foreground">The Architect needs a few more details to finalize the specification.</p>
				{error && (
					<div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-400 text-sm flex items-center justify-between">
						<span>Error: {error}</span>
						<Button size="sm" variant="outline" onClick={form.handleSubmit(onSubmit)} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
							Retry
						</Button>
					</div>
				)}
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					{questions.map((question, index) => (
						<FormField
							key={index}
							control={form.control}
							name={`q_${index}`}
							render={({ field }) => (
								<FormItem className="space-y-3 bg-secondary/10 p-6 rounded-xl border border-border/50 shadow-sm transition-all hover:bg-secondary/20">
									<FormLabel className="text-base font-medium flex gap-3 leading-relaxed">
										<span className="text-blue-500 font-bold shrink-0">{index + 1}.</span>
										{question}
									</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Your answer..."
											className="resize-y min-h-[100px] border-border/50 bg-background/50 focus-visible:ring-blue-500/50"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					))}

					<div className="flex justify-between pt-6">
						<Button
							type="button"
							variant="ghost"
							onClick={onBack}
							disabled={isGenerating}
						>
							Back
						</Button>
						<Button
							type="submit"
							size="lg"
							className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-medium min-w-[200px]"
							disabled={isGenerating || isCooldownActive}
						>
							{isGenerating ? (
								<>
									<Sparkles className="h-4 w-4 animate-spin" /> Drafting CLAUDE.md...
								</>
							) : isCooldownActive ? (
								<>
									<Clock className="h-4 w-4 animate-pulse" /> Wait {remainingTime}s...
								</>
							) : (
								<>
									Generate Constitution <ArrowRight className="h-4 w-4" />
								</>
							)}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
