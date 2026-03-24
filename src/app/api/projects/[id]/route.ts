import { prisma } from '@/lib/database';
import { NextResponse } from 'next/server';

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const project = await prisma.project.findUnique({
			where: { id },
		});

		if (!project) {
			return NextResponse.json({ error: "Project not found" }, { status: 404 });
		}

		// Parse JSON strings back to objects
		const formattedProject = {
			...project,
			questions: project.questions ? JSON.parse(project.questions) : [],
			answers: project.answers ? JSON.parse(project.answers) : {},
			roadmapTasks: project.roadmapTasks ? JSON.parse(project.roadmapTasks) : [],
		};

		return NextResponse.json(formattedProject);
	} catch (error: any) {
		console.error("GET Project Detail Error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		await prisma.project.delete({
			where: { id },
		});
		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.error("DELETE Project Error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
