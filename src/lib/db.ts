import fs from 'fs';
import path from 'path';

export interface Project {
  id: string;
  title: string;
  code: string;
  createdAt: number;
}

const dbPath = path.join(process.cwd(), 'data', 'projects.json');

function initDb() {
  if (!fs.existsSync(dbPath)) {
    if (!fs.existsSync(path.dirname(dbPath))) {
      fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    }
    fs.writeFileSync(dbPath, JSON.stringify([]), 'utf-8');
  }
}

export function getProjects(): Project[] {
  initDb();
  const data = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(data) as Project[];
}

export function saveProject(project: Omit<Project, 'id' | 'createdAt'>): Project {
  const projects = getProjects();
  const newProject: Project = {
    ...project,
    id: Math.random().toString(36).substring(2, 9),
    createdAt: Date.now(),
  };
  projects.push(newProject);
  fs.writeFileSync(dbPath, JSON.stringify(projects, null, 2), 'utf-8');
  return newProject;
}

export function deleteProject(id: string): void {
  let projects = getProjects();
  projects = projects.filter(p => p.id !== id);
  fs.writeFileSync(dbPath, JSON.stringify(projects, null, 2), 'utf-8');
}
