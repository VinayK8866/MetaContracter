import { prisma } from '@/lib/database';
import { NextResponse } from 'next/server';

export async function GET() {
	try {
		const projects = await prisma.project.findMany({
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				name: true,
				createdAt: true,
				vibe: true,
			}
		});
		return NextResponse.json(projects);
	} catch (error: any) {
		console.error("GET Projects Error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { id, name, vibe, questions, answers, constitution, roadmapTasks } = body;

		if (id) {
			// Update existing
			const project = await prisma.project.update({
				where: { id },
				data: {
					name,
					vibe,
					questions: questions ? JSON.stringify(questions) : undefined,
					answers: answers ? JSON.stringify(answers) : undefined,
					constitution,
					roadmapTasks: roadmapTasks ? JSON.stringify(roadmapTasks) : undefined,
				}
			});
			return NextResponse.json(project);
		} else {
			// Create new
			const project = await prisma.project.create({
				data: {
					name: name || "Untitled Project",
					vibe,
					questions: questions ? JSON.stringify(questions) : undefined,
					answers: answers ? JSON.stringify(answers) : undefined,
					constitution,
					roadmapTasks: roadmapTasks ? JSON.stringify(roadmapTasks) : undefined,
				}
			});
			return NextResponse.json(project);
		}
	} catch (error: any) {
		console.error("POST Project Error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
