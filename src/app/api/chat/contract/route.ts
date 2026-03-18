import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
	const { constitution, task } = await req.json();

	try {
		const { object } = await generateObject({
			model: google('gemini-3-flash-preview'),
			schema: z.object({
				goal: z.string().describe('The primary objective of this specific task.'),
				constraints: z.string().describe('Strict rules, boundaries, and what NOT to do based on the CLAUDE.md context.'),
				format: z.string().describe('The exact expected output format or file structure for this task.'),
				failureConditions: z.string().describe('Explicit scenarios where this task is considered completely failed.'),
			}),
			prompt: `You are a strict technical architect writing a Prompt Contract for an AI coding agent.
Context (CLAUDE.md):
${constitution}

Current Task:
Title: ${task.title}
Description: ${task.description}

Generate a ruthless "Prompt Contract" for this specific task.
You will strictly output the 4 schema fields: Goal, Constraints, Format, and Failure Conditions.
Each field MUST be a detailed string. Do NOT leave any field empty. Do NOT use placeholder words like "undefined".
Adhere strictly to the CLAUDE.md context for all constraints.`,
		});

		return Response.json(object);
	} catch (error: any) {
		console.error("Contract API Error:", error);
		const errorMessage = error?.message || "Failed to generate contract";
		return Response.json({ error: errorMessage }, { status: 500 });
	}
}
