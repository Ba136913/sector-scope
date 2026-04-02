"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Trash2, ExternalLink, Code2 } from "lucide-react";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  code: string;
  createdAt: number;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<{name: string} | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("cloner_user");
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const res = await fetch("/api/projects");
    if (res.ok) {
      const data = await res.json();
      setProjects(data);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] flex flex-col">
      <Header user={user} onLogout={() => { setUser(null); localStorage.removeItem("cloner_user"); window.location.href = '/'; }} />
      
      <div className="flex-1 max-w-7xl w-full mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Cloud Projects</h1>
          <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition shadow">
            + New Project
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Code2 size={48} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-bold text-slate-600">No projects yet</h2>
            <p className="text-slate-400 mt-2">Start building something amazing with the AI Engine.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => {
               const shareUrl = `/preview?code=${btoa(encodeURIComponent(project.code))}`;
               return (
                <div key={project.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{project.title}</h3>
                    <button onClick={() => handleDelete(project.id)} className="text-red-400 hover:text-red-600 transition p-1">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mb-6">
                    {new Date(project.createdAt).toLocaleString()}
                  </p>
                  
                  <div className="mt-auto flex gap-3">
                    <Link href={shareUrl} target="_blank" className="flex-1 flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 py-2 rounded-xl text-sm font-bold hover:bg-slate-100 transition">
                      <ExternalLink size={14} /> Preview
                    </Link>
                  </div>
                </div>
               );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
