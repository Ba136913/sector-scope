"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { AppWorkspace } from "@/components/AppWorkspace";
import { Zap, Sparkles, Terminal } from "lucide-react";

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState("");
  const [user, setUser] = useState<{name: string} | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("cloner_user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    if (name) {
      const newUser = { name };
      setUser(newUser);
      localStorage.setItem("cloner_user", JSON.stringify(newUser));
      setShowLogin(false);
    }
  };

  const handleStartGeneration = (inputPrompt: string) => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    setInitialPrompt(inputPrompt);
    setIsGenerating(true);
  };

  if (isGenerating) {
    return (
      <main className="min-h-screen bg-[#F8F9FA]">
        <Header user={user} onLogout={() => { setUser(null); localStorage.removeItem("cloner_user"); setIsGenerating(false); }} />
        <AppWorkspace initialPrompt={initialPrompt} />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col relative bg-white selection:bg-blue-100">
      <Header user={user} onLogout={() => { setUser(null); localStorage.removeItem("cloner_user"); }} onLoginClick={() => setShowLogin(true)} />
      
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden py-20">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60" />
        </div>

        <div className="max-w-4xl w-full text-center space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest mb-4">
              <Zap size={14} fill="currentColor" />
              Next-Gen AI Workspace
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9]">
              Build anything<br/>
              <span className="text-blue-600">Instantly.</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-xl mx-auto font-medium">
              The most powerful AI cloner for unconstrained web applications. 
              Powered by self-healing multi-engine intelligence.
            </p>
          </div>

          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[32px] blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
            <div className="relative bg-white border border-slate-200 rounded-[28px] shadow-2xl p-2 flex items-center">
              <input 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStartGeneration(prompt)}
                placeholder="Describe your project (e.g. A crypto dashboard)..." 
                className="flex-1 bg-transparent px-6 py-4 text-lg outline-none text-slate-800 placeholder:text-slate-400 font-medium"
              />
              <button 
                onClick={() => handleStartGeneration(prompt)}
                className="bg-blue-600 text-white px-8 py-4 rounded-[22px] font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 active:scale-95"
              >
                Build <Sparkles size={18} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {["Dashboard", "Task App", "Portfolio", "Landing Page"].map(tag => (
              <button 
                key={tag}
                onClick={() => handleStartGeneration(tag)}
                className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-500 text-sm font-bold hover:bg-slate-50 hover:text-blue-600 transition-all active:scale-95"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <footer className="py-10 text-center border-t border-slate-100">
        <div className="flex items-center justify-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
          <Terminal size={14} />
          AI Engine Status: <span className="text-green-500">Live & Stable</span>
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
              <Zap size={32} fill="currentColor" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Identity Sync</h2>
            <p className="text-slate-500 mb-8 font-medium">Please verify your identity to access the cloner engine.</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Assigned Alias</label>
                <input name="name" required className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 font-bold placeholder:text-slate-300" placeholder="Enter your name..." />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98]">
                Initialize Engine
              </button>
              <button type="button" onClick={() => setShowLogin(false)} className="w-full text-slate-400 text-sm font-bold pt-2">Bypass for now</button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
