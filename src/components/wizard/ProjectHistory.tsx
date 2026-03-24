'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { 
	Sheet, 
	SheetContent, 
	SheetHeader, 
	SheetTitle, 
	SheetTrigger 
} from '@/components/ui/sheet';
import { History, Trash2, Calendar, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function ProjectHistory({ onProjectLoad }: { onProjectLoad: (step: number) => void }) {
	const [projects, setProjects] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const { setCurrentProjectId, setVibe, setAnswers, setConstitution, setRoadmapTasks } = useStore();

	const fetchProjects = async () => {
		setIsLoading(true);
		try {
			const res = await fetch('/api/projects');
			if (res.ok) {
				const data = await res.json();
				setProjects(data);
			}
		} catch (error) {
			console.error('Failed to fetch projects:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const loadProject = async (id: string) => {
		try {
			const res = await fetch(`/api/projects/${id}`);
			if (res.ok) {
				const project = await res.json();
				
				// Update store
				setCurrentProjectId(project.id);
				setVibe(project.vibe || '');
				useStore.getState().setQuestions(project.questions || []);
				setAnswers(project.answers || {});
				setConstitution(project.constitution || '');
				setRoadmapTasks(project.roadmapTasks || []);
				
				// Determine which step to go to
				if (project.roadmapTasks && project.roadmapTasks.length > 0) {
					onProjectLoad(3);
				} else if (project.constitution) {
					onProjectLoad(2);
				} else {
					onProjectLoad(1);
				}
			}
		} catch (error) {
			console.error('Failed to load project:', error);
		}
	};

	const deleteProject = async (id: string, e: React.MouseEvent) => {
		e.stopPropagation();
		if (!confirm('Are you sure you want to delete this project?')) return;
		
		try {
			const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
			if (res.ok) {
				setProjects(projects.filter(p => p.id !== id));
			}
		} catch (error) {
			console.error('Failed to delete project:', error);
		}
	};

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="ghost" size="sm" onClick={fetchProjects} className="gap-2">
					<History className="h-4 w-4" />
					History
				</Button>
			</SheetTrigger>
			<SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
				<SheetHeader>
					<SheetTitle className="flex items-center gap-2 text-2xl">
						<History className="h-6 w-6 text-blue-500" />
						Project History
					</SheetTitle>
				</SheetHeader>
				
				<div className="mt-8 space-y-4">
					{isLoading ? (
						<div className="text-center py-10 text-muted-foreground animate-pulse">Loading past projects...</div>
					) : projects.length === 0 ? (
						<div className="text-center py-10 text-muted-foreground">No projects found.</div>
					) : (
						projects.map((project) => (
							<div 
								key={project.id}
								onClick={() => loadProject(project.id)}
								className="group relative p-5 bg-secondary/10 rounded-xl border border-border/50 hover:bg-secondary/20 hover:border-blue-500/30 transition-all cursor-pointer overflow-hidden"
							>
								<div className="flex justify-between items-start mb-3">
									<h3 className="font-semibold text-lg line-clamp-1 pr-8 transition-colors group-hover:text-blue-400">
										{project.name || 'Untitled Project'}
									</h3>
									<Button 
										variant="ghost" 
										size="icon" 
										onClick={(e) => deleteProject(project.id, e)}
										className="h-8 w-8 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
								
								<p className="text-sm text-muted-foreground line-clamp-2 mb-4 italic">
									"{project.vibe}"
								</p>
								
								<div className="flex items-center justify-between text-xs text-muted-foreground">
									<div className="flex items-center gap-1.5">
										<Calendar className="h-3 w-3" />
										{formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
									</div>
									<div className="flex items-center gap-1 text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
										Resume <ArrowRight className="h-3 w-3" />
									</div>
								</div>

								{/* Aesthetic accent */}
								<div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
							</div>
						))
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
