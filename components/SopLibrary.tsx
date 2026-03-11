import React, { useState } from 'react';
import { SOP } from '../types';
import { generateSOP } from '../services/geminiService';
import { Book, FileText, Bot, ChevronRight, Search } from 'lucide-react';

interface SopLibraryProps {
  sops: SOP[];
  setSops: React.Dispatch<React.SetStateAction<SOP[]>>;
}

const SopLibrary: React.FC<SopLibraryProps> = ({ sops, setSops }) => {
  const [selectedSop, setSelectedSop] = useState<SOP | null>(null);
  const [newTopic, setNewTopic] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleCreateSOP = async () => {
    if (!newTopic) return;
    setGenerating(true);
    const content = await generateSOP(newTopic);
    
    const newSop: SOP = {
        id: Date.now().toString(),
        title: newTopic,
        category: 'General',
        content: content,
        lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    setSops([newSop, ...sops]);
    setSelectedSop(newSop);
    setNewTopic('');
    setGenerating(false);
  };

  return (
    <div className="flex h-[calc(100vh-180px)] gap-8">
      {/* Sidebar List */}
      <div className="w-1/3 glass-panel rounded-2xl border border-white/5 flex flex-col overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 bg-slate-900/30">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-indigo-600/20 rounded-lg text-indigo-400">
                    <Book size={20} /> 
                </div>
                SOP Library
            </h2>
            
            <div className="relative group">
                <Bot className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:animate-pulse" size={18} />
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        placeholder="Ask AI to write a procedure..."
                        className="flex-1 bg-slate-950/50 border border-slate-700/50 rounded-xl pl-10 pr-3 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-500"
                    />
                    <button 
                        onClick={handleCreateSOP}
                        disabled={generating}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 rounded-xl disabled:opacity-50 transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        {generating ? <span className="animate-spin">⟳</span> : <ChevronRight size={20} />}
                    </button>
                </div>
            </div>
            {generating && <p className="text-xs text-indigo-400 mt-3 flex items-center gap-2 animate-pulse">
                <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                Generating standard procedure...
            </p>}
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
            {sops.map(sop => (
                <button
                    key={sop.id}
                    onClick={() => setSelectedSop(sop)}
                    className={`w-full text-left p-4 rounded-xl flex items-center justify-between transition-all duration-200 group border border-transparent ${
                        selectedSop?.id === sop.id 
                        ? 'bg-indigo-600/10 border-indigo-500/20 shadow-inner' 
                        : 'hover:bg-white/5 hover:border-white/5'
                    }`}
                >
                    <div className="flex items-center gap-4 overflow-hidden">
                        <div className={`p-2 rounded-lg transition-colors ${selectedSop?.id === sop.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-800 text-slate-400 group-hover:text-white'}`}>
                            <FileText size={18} />
                        </div>
                        <div className="overflow-hidden">
                            <div className={`font-semibold truncate ${selectedSop?.id === sop.id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{sop.title}</div>
                            <div className="text-xs text-slate-500 truncate mt-0.5">{sop.category} • {sop.lastUpdated}</div>
                        </div>
                    </div>
                </button>
            ))}
        </div>
      </div>

      {/* Content Viewer */}
      <div className="flex-1 glass-panel rounded-2xl border border-white/5 overflow-hidden flex flex-col shadow-2xl relative">
        {selectedSop ? (
            <>
                <div className="p-8 border-b border-white/5 bg-slate-900/30 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                    {selectedSop.category}
                                </span>
                                <span className="text-slate-500 text-xs">ID: {selectedSop.id}</span>
                            </div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">{selectedSop.title}</h1>
                        </div>
                        <div className="text-right">
                             <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Last Updated</div>
                             <div className="text-slate-300 font-mono">{selectedSop.lastUpdated}</div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-10 bg-slate-950/20">
                    <div className="prose prose-invert prose-lg max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed text-base">{selectedSop.content}</pre>
                    </div>
                </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                    <Book size={48} className="opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Procedure Selected</h3>
                <p className="text-slate-400 max-w-xs text-center">Select an SOP from the library to view details or use the AI tool to generate a new one.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default SopLibrary;
