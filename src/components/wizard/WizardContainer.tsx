'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { VibeInput } from './VibeInput';
import { DiscoveryQuestions } from './DiscoveryQuestions';
import { ConstitutionViewer } from './ConstitutionViewer';
import { RoadmapViewer } from './RoadmapViewer';
import { ContractViewer } from './ContractViewer';

export function WizardContainer() {
	const [currentStep, setCurrentStep] = useState(0);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		const state = useStore.getState();
		if (state.roadmapTasks && state.roadmapTasks.length > 0) {
			setCurrentStep(3);
		} else if (state.constitution) {
			setCurrentStep(2);
		} else if (state.questions && state.questions.length > 0) {
			setCurrentStep(1);
		}
	}, []);

	const handleNext = () => setCurrentStep(currentStep + 1);
	const handleBack = () => setCurrentStep(currentStep - 1);
	const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

	const handleViewContract = (taskId: string) => {
		setSelectedTaskId(taskId);
		setCurrentStep(4);
	};

	const handleBackFromContract = () => {
		setSelectedTaskId(null);
		setCurrentStep(3);
	};

	return (
		<div className="min-h-screen bg-background text-foreground flex flex-col pt-20 pb-10 px-4 sm:px-6 lg:px-8">
			<header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center text-sm font-medium border-b border-border/40 bg-background/80 backdrop-blur-md z-50">
				<div className="flex items-center gap-3">
					<div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">A</div>
					<span className="font-semibold tracking-tight text-lg">The Architect</span>
				</div>
				<div className="flex items-center gap-4">
					<span className="text-muted-foreground hidden sm:block">Framework: Prompt Contract</span>
					<Button 
						variant="ghost" 
						size="sm" 
						onClick={() => { 
							if(window.confirm('Are you sure you want to start a new project? All current progress will be lost.')) { 
								useStore.getState().resetStore(); 
								setCurrentStep(0); 
								setSelectedTaskId(null); 
							} 
						}}
						className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
					>
						Start New
					</Button>
				</div>
			</header>

			<main className="flex-1 w-full max-w-5xl mx-auto flex flex-col justify-center mt-10">
				{!mounted ? null : (
					<>
						{currentStep === 0 && <VibeInput onNext={handleNext} />}
				{currentStep === 1 && <DiscoveryQuestions onNext={handleNext} onBack={handleBack} />}
				{currentStep === 2 && <ConstitutionViewer onNext={handleNext} onBack={handleBack} />}
				{currentStep === 3 && <RoadmapViewer onNext={handleViewContract} onBack={handleBack} />}
				{currentStep === 4 && <ContractViewer onBack={handleBackFromContract} selectedTaskId={selectedTaskId} />}
					</>
				)}
			</main>
		</div>
	);
}
