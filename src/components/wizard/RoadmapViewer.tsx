'use client';

import { useStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Lock, ArrowRight } from 'lucide-react';

export function RoadmapViewer({ onNext, onBack }: { onNext: (taskId: string) => void; onBack: () => void }) {
	const { roadmapTasks } = useStore();

	return (
		<div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
			<div className="space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">Execution Roadmap</h2>
				<p className="text-muted-foreground">
					The Architect has broken your project down into sequential, atomic tasks. Complete them one by one.
				</p>
			</div>

			<div className="space-y-4 relative">
				{/* Connection line between tasks */}
				<div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-border/50 z-0"></div>

				{roadmapTasks.map((task, index) => {
					const isFirstPending = index === roadmapTasks.findIndex(t => t.status === 'pending');
					const isDone = task.status === 'done';
					const isLocked = !isDone && !isFirstPending;

					return (
						<Card
							key={task.id}
							className={`relative z-10 p-6 flex items-start gap-6 border transition-all duration-300 ${isDone
								? 'bg-secondary/10 border-emerald-500/30'
								: isFirstPending
									? 'bg-background border-blue-500/50 shadow-lg shadow-blue-500/10 scale-[1.02]'
									: 'bg-background/40 border-border/40 opacity-50'
								}`}
						>
							<div className="shrink-0 mt-1">
								{isDone ? (
									<CheckCircle2 className="h-8 w-8 text-emerald-500" />
								) : isFirstPending ? (
									<Circle className="h-8 w-8 text-blue-500" />
								) : (
									<Lock className="h-8 w-8 text-muted-foreground" />
								)}
							</div>

							<div className="flex-1 space-y-2">
								<div className="flex justify-between items-start">
									<div>
										<h3 className={`font-semibold text-lg ${isDone ? 'text-emerald-500' : isFirstPending ? 'text-foreground' : 'text-muted-foreground'}`}>
											Step {index + 1}: {task.title}
										</h3>
										<p className="text-muted-foreground mt-1">
											{task.description}
										</p>
									</div>
								</div>

								{(isFirstPending || isDone) && (
									<div className="pt-4">
										<Button
											className={`${isDone ? 'bg-secondary' : 'bg-blue-600 hover:bg-blue-700 text-white'} shadow-lg`}
											onClick={() => onNext(task.id)}
										>
											{isDone ? 'View Contract' : 'Generate Contract'} <ArrowRight className="h-4 w-4 ml-2" />
										</Button>
									</div>
								)}
							</div>
						</Card>
					);
				})}

				<div className="pt-4">
					<Button variant="ghost" onClick={onBack}>
						Back to Constitution
					</Button>
				</div>
			</div>

			{roadmapTasks.every(t => t.status === 'done') && (
				<div className="text-center pt-8 pb-4 animate-in zoom-in duration-500">
					<div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 rounded-full mb-4">
						<CheckCircle2 className="h-12 w-12 text-emerald-500" />
					</div>
					<h2 className="text-2xl font-bold">Project Architecture Complete!</h2>
					<p className="text-muted-foreground mt-2">All prompt contracts have been executed.</p>
				</div>
			)}
		</div>
	);
}
