import { NextResponse } from 'next/server';
import { getProjects, saveProject } from '@/lib/db';

export async function GET() {
  try {
    const projects = getProjects();
    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, code } = await req.json();
    if (!title || !code) {
      return NextResponse.json({ error: 'Title and code are required' }, { status: 400 });
    }
    const project = saveProject({ title, code });
    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
