"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import Editor from "@monaco-editor/react";
import { Paperclip, Expand, Download, Share2, Zap, Cloud } from "lucide-react";

interface AppWorkspaceProps {
  initialPrompt: string;
}

type Message = {
  role: 'user' | 'assistant';
  content: string;
  image?: string; // base64 string
};

export const AppWorkspace = ({ initialPrompt }: AppWorkspaceProps) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string>("");
  const [isBuilding, setIsBuilding] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  
  const [attachment, setAttachment] = useState<{data: string, mimeType: string, name: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Ref to prevent double initial prompt execution
  const initialized = useRef(false);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isBuilding, generatedCode]);

  useEffect(() => {
    if (initialPrompt && !initialized.current) {
      initialized.current = true;
      handleGenerate(initialPrompt);
    }
  }, [initialPrompt]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      setAttachment({ data: base64String, mimeType: file.type, name: file.name });
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (promptToUse: string) => {
    if (!promptToUse.trim() && !attachment) return;
    if (isBuilding) return; // Prevent concurrent calls

    const userMessage: Message = { 
      role: 'user', 
      content: promptToUse,
      image: attachment ? `data:${attachment.mimeType};base64,${attachment.data}` : undefined
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setAttachment(null);
    setIsBuilding(true);
    setSuggestions("");
    setActiveTab('preview');

    try {
      const history = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        content: m.content
      }));

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: promptToUse, 
          history,
          image: userMessage.image ? { data: userMessage.image.split(',')[1], mimeType: attachment?.mimeType || 'image/jpeg' } : null
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Server error");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      
      setMessages(prev => [...prev, { role: 'assistant', content: 'Processing with AI Engines...' }]);

      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          
          // Clean the arriving text from potential markdown
          const cleanCode = fullText
            .replace(/```html/gi, '')
            .replace(/```/g, '')
            .split("|||SUGGESTIONS|||")[0]
            .trim();
            
          setGeneratedCode(cleanCode);
          
          if (fullText.includes("|||SUGGESTIONS|||")) {
             setSuggestions(fullText.split("|||SUGGESTIONS|||")[1].trim());
          }
        }
      }

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: 'Code updated successfully!' };
        return updated;
      });

    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `System Alert: ${error.message}. Let me try another route...` }]);
      setIsBuilding(false);
    } finally {
      setIsBuilding(false);
    }
  };

  const handleExport = () => {
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'ai-project.html';
    a.click();
  };

  const handlePublish = () => {
    const encodedCode = btoa(encodeURIComponent(generatedCode));
    const shareUrl = `${window.location.origin}/preview?code=${encodedCode}`;
    navigator.clipboard.writeText(shareUrl);
    alert("Shareable Link Copied!");
  };

  const handleFullScreen = () => {
    const encodedCode = btoa(encodeURIComponent(generatedCode));
    window.open(`/preview?code=${encodedCode}`, '_blank');
  };

  const handleSaveToCloud = async () => {
    if (!generatedCode) return;
    const title = prompt("Enter project title:");
    if (!title) return;
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, code: generatedCode }),
      });
      if (res.ok) alert("Project saved to cloud successfully!");
      else alert("Failed to save project.");
    } catch (err) {
      alert("Error saving project");
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden border-t border-border bg-[#F8F9FA]">
      <div className="w-[400px] flex flex-col border-r border-border bg-white shadow-xl z-20">
        <div className="p-4 border-b border-border bg-gradient-to-r from-blue-50 to-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-widest text-[10px]">Multi-Engine Stable AI</span>
          </div>
          <Zap size={12} className="text-cto-blue" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                m.role === 'user' ? 'bg-cto-blue text-white' : 'bg-white border border-border text-gray-800'
              }`}>
                {m.image && <img src={m.image} alt="uploaded" className="w-full h-auto rounded-lg mb-2" />}
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
              {m.role === 'assistant' && i === messages.length - 1 && suggestions && (
                <div className="mt-3 ml-2 text-sm text-gray-600 bg-blue-50/50 p-3 rounded-xl border border-blue-100 w-[90%] animate-in fade-in slide-in-from-top-2">
                  <p className="font-semibold mb-1 text-xs text-cto-blue">✨ AI SUGGESTIONS:</p>
                  <p className="text-[11px] leading-relaxed opacity-80">{suggestions}</p>
                </div>
              )}
            </div>
          ))}
          {isBuilding && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl px-4 py-3 text-sm border border-border flex items-center space-x-2 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-cto-blue animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-cto-blue animate-bounce delay-100" />
                <div className="w-1.5 h-1.5 rounded-full bg-cto-blue animate-bounce delay-200" />
                <span className="ml-2 text-gray-400 text-[10px] font-bold uppercase tracking-tighter">Synthesizing...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-border bg-white">
          {attachment && (
            <div className="mb-2 flex items-center justify-between bg-blue-50 px-3 py-1.5 rounded-md border border-blue-100 animate-in slide-in-from-bottom-2">
              <span className="text-[10px] text-blue-700 truncate max-w-[200px] font-bold">📎 {attachment.name}</span>
              <button onClick={() => setAttachment(null)} className="text-blue-500 hover:text-blue-700">✖</button>
            </div>
          )}
          <div className="relative group">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(input); } }}
              className="w-full rounded-xl border border-border p-3 pl-10 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-cto-blue resize-none h-24 bg-[#F9FAFB]"
              placeholder="What should I build next?"
              disabled={isBuilding}
            />
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            <button onClick={() => fileInputRef.current?.click()} className="absolute left-3 top-3 text-gray-400 hover:text-cto-blue">
              <Paperclip size={18} />
            </button>
            <button 
              onClick={() => handleGenerate(input)}
              disabled={isBuilding || (!input.trim() && !attachment)}
              className="absolute right-3 bottom-3 p-2 rounded-lg bg-cto-blue text-white disabled:opacity-50 hover:bg-blue-700 shadow-md"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-4 bg-white/60 backdrop-blur-md p-2 rounded-xl border border-border shadow-sm z-10">
          <div className="flex items-center space-x-4 pl-2">
            <div className="flex space-x-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" /><div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" /><div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" /></div>
            <div className="h-4 w-[1px] bg-border" />
            <div className="flex bg-gray-100/50 p-1 rounded-lg border border-border">
              <button onClick={() => setActiveTab('preview')} className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${activeTab === 'preview' ? 'bg-white shadow-sm text-cto-blue' : 'text-gray-400'}`}>Preview</button>
              <button onClick={() => setActiveTab('code')} className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${activeTab === 'code' ? 'bg-white shadow-sm text-cto-blue' : 'text-gray-400'}`}>Code</button>
            </div>
          </div>
          <div className="flex items-center space-x-2 pr-2">
            <Button onClick={handleSaveToCloud} disabled={!generatedCode} size="sm" variant="outline" className="h-7 text-[10px] font-bold uppercase text-blue-600 border-blue-200 hover:border-blue-600 hover:bg-blue-50"><Cloud size={12} className="mr-1" /> Save</Button>
            <Button onClick={handleFullScreen} disabled={!generatedCode} size="sm" variant="ghost" className="h-7 text-[10px] font-bold uppercase text-gray-500 hover:text-cto-blue"><Expand size={12} className="mr-1" /> Full</Button>
            <Button onClick={handleExport} disabled={!generatedCode} size="sm" variant="outline" className="h-7 text-[10px] font-bold uppercase text-gray-500 hover:border-cto-blue"><Download size={12} className="mr-1" /> Export</Button>
            <Button onClick={handlePublish} disabled={!generatedCode} size="sm" className="h-7 text-[10px] font-bold uppercase bg-cto-black text-white shadow-md"><Share2 size={12} className="mr-1" /> Share</Button>
          </div>
        </div>
        
        <div className="flex-1 bg-white rounded-xl border border-border shadow-xl overflow-hidden relative">
          {!generatedCode && !isBuilding && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
               <Zap className="w-12 h-12 mb-2 opacity-20" />
               <p className="text-[10px] font-bold uppercase tracking-widest">Engine Standby</p>
             </div>
          )}
          <div className={`absolute inset-0 ${activeTab === 'code' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <Editor height="100%" defaultLanguage="html" theme="light" value={generatedCode} onChange={(value) => setGeneratedCode(value || "")}
              options={{ minimap: { enabled: false }, fontSize: 13, wordWrap: "on", padding: { top: 20 }, formatOnPaste: true, smoothScrolling: true }}
            />
          </div>
          <div className={`absolute inset-0 bg-white ${activeTab === 'preview' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            {generatedCode && <iframe srcDoc={generatedCode} className="w-full h-full border-none" title="App Preview" sandbox="allow-scripts allow-forms allow-same-origin allow-modals allow-popups" />}
            {isBuilding && (
              <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center z-50">
                <div className="relative w-16 h-16 flex items-center justify-center mb-4">
                  <div className="absolute inset-0 border-2 border-cto-blue border-t-transparent rounded-full animate-spin"></div>
                  <Zap className="w-5 h-5 text-cto-blue animate-pulse" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-1">Building Prototype</h3>
                <p className="text-[10px] font-medium text-gray-400">Consulting all AI Engines...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
