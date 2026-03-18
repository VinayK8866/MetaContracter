import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
	const { vibe, answers } = await req.json();

	let contextFormat = `User's Raw Vibe: ${vibe}\n\n`;
	contextFormat += `Architect's Questions & User's Answers:\n`;
	for (const [q, a] of Object.entries(answers)) {
		contextFormat += `Q: ${q}\nA: ${a as string}\n\n`;
	}

	try {
		const { object } = await generateObject({
			model: google('gemini-2.5-flash-latest'),
			schema: z.object({
				constitution: z.string().describe('The CLAUDE.md markdown content.'),
			}),
			prompt: `You are The Architect. Below is the total discovery context for a new web application.

${contextFormat}

Your task is to generate a comprehensive "CLAUDE.md" constitution. This file will be loaded into the workspace to align an AI coding agent with the project constraints.

It MUST include:
1. Project Vision & Architecture (What is it, what is the core tech stack)
2. Database Schema / Data Models layout
3. Required Third-party integrations (Auth, Payments, etc.)
4. Styling and UI Philosophy (Tailwind, specific design system)
5. Strict File Structure constraints

Do NOT describe the file, just generate the markdown contents of it. Be authoritative and extremely precise about the technical decisions. Use proper markdown headers and lists.`,
		});

		return Response.json(object);
	} catch (error: any) {
		console.error("Constitution API Error:", error);
		const errorMessage = error?.message || "Failed to generate constitution";
		return Response.json({ error: errorMessage }, { status: 500 });
	}
}
