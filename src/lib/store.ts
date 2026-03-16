import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Contract {
	goal: string;
	constraints: string;
	format: string;
	failureConditions: string;
}

export interface RoadmapTask {
	id: string;
	title: string;
	description: string;
	status: 'pending' | 'done';
	contract?: Contract;
}

export interface ArchitectState {
	vibe: string;
	setVibe: (vibe: string) => void;

	questions: string[];
	setQuestions: (questions: string[]) => void;

	answers: Record<string, string>;
	setAnswers: (answers: Record<string, string>) => void;

	constitution: string;
	setConstitution: (constitution: string) => void;

	roadmapTasks: RoadmapTask[];
	setRoadmapTasks: (tasks: RoadmapTask[]) => void;
	updateTaskStatus: (taskId: string, status: 'pending' | 'done') => void;
	setTaskContract: (taskId: string, contract: Contract) => void;

	resetStore: () => void;
}

const initialState = {
	vibe: '',
	questions: [],
	answers: {},
	constitution: '',
	roadmapTasks: [],
};

export const useStore = create<ArchitectState>()(
	persist(
		(set) => ({
			...initialState,

			setVibe: (vibe) => set({ vibe }),

			setQuestions: (questions) => set({ questions }),

			setAnswers: (answers) => set({ answers }),

			setConstitution: (constitution) => set({ constitution }),

			setRoadmapTasks: (roadmapTasks) => set({ roadmapTasks }),

			updateTaskStatus: (taskId, status) =>
				set((state) => ({
					roadmapTasks: state.roadmapTasks.map(task =>
						task.id === taskId ? { ...task, status } : task
					)
				})),

			setTaskContract: (taskId, contract) =>
				set((state) => ({
					roadmapTasks: state.roadmapTasks.map(task =>
						task.id === taskId ? { ...task, contract } : task
					)
				})),

			resetStore: () => set(initialState),
		}),
		{
			name: 'the-architect-storage',
		}
	)
);
