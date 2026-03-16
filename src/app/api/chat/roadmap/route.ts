import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
	const { vibe, constitution } = await req.json();

	try {
		const { object } = await generateObject({
			model: google('gemini-pro-latest'),
			schema: z.object({
				tasks: z.array(z.object({
					id: z.string().describe('A unique, short identifier like task-1, task-2'),
					title: z.string().describe('Task title, e.g. Setup Authentication'),
					description: z.string().describe('Brief description of the work needed'),
				})).describe('Sequential, atomic development tasks to build the app.'),
			}),
			prompt: `You are The Architect. The user is building a web application.
Raw Vibe: ${vibe}

CLAUDE.md Constraints:
${constitution}

Break down the entire project into a sequential list of highly-atomic tasks. Each task should represent a logical, self-contained feature or component that an AI Agent can build in a single pass.`,
		});

		const tasks = object.tasks.map((task) => ({ ...task, status: 'pending' }));
		return Response.json({ tasks });
	} catch (error: any) {
		console.error("Roadmap API Error:", error);
		const errorMessage = error?.message || "Failed to generate roadmap";
		return Response.json({ error: errorMessage }, { status: 500 });
	}
}
