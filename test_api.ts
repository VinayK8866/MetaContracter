import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
	try {
		const { object } = await generateObject({
			model: google('gemini-1.5-flash-latest'),
			schema: z.object({
				questions: z.array(z.string()).min(5).max(7)
			}),
			prompt: "Vibe: simple task manager"
		});
		console.log(object);
	} catch (err) {
		console.error("API error:", err);
	}
}
main();
