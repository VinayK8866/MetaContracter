import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
	const { vibe } = await req.json();

	try {
		const { object } = await generateObject({
			model: google('gemini-1.5-flash-latest'),
			schema: z.object({
				questions: z
					.array(z.string())
					.min(5)
					.max(7)
					.describe('5 to 7 clarifying questions about tech stack, auth, database, and specific requirements.'),
			}),
			prompt: `You are The Architect, an expert AI software engineer and product strategist. The user wants to build a web application.
Their raw idea ("Vibe") is: "${vibe}"

Analyze this vibe and generate precisely 5 to 7 clarifying questions to help shape a precise development roadmap.
To ensure the user can understand the questions (even if they aren't highly technical), sequence and phrase your questions as if they are coming from three distinct personas in order:

1. Product Manager (Focus on user experience, core business logic, and missing edge cases. Keep it very conversational and simple.)
2. Project Manager (Focus on timeline, scope, MVP features vs future features, and general constraints.)
3. Technical Manager (Focus on technical architecture, database choices, authentication, and integrations. Explain briefly *why* you are asking so it makes sense to a non-technical person.)

Ensure the questions are simple to understand and don't overwhelm the user with pure technical jargon without context.
Do not return conversational text, just the structured JSON questions.`,
		});

		return Response.json(object);
	} catch (error: any) {
		console.error("Discovery API Error:", error);

		// Extract and forward the actual error message from the provider 
		const errorMessage = error?.message || "Failed to generate questions";

		return Response.json(
			{ error: errorMessage },
			{ status: 500 }
		);
	}
}
