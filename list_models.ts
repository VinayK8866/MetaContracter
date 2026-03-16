import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
	const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`);
	const json = await res.json();
	console.log(JSON.stringify(json.models.map((m: any) => ({ name: m.name, supportedGenerationMethods: m.supportedGenerationMethods })), null, 2));
}
main();
