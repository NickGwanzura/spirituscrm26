import React, { useState } from 'react';
import { Project, ProjectStatus, Client } from '../types';
import { Calendar, List, CheckCircle, Clock, AlertCircle, MoreHorizontal, Plus } from 'lucide-react';
import { analyzeProjectRisk } from '../services/geminiService';

interface ProjectManagerProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  clients: Client[];
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ projects, setProjects, clients }) => {
  const [view, setView] = useState<'list' | 'gantt'>('list');
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // New Project State
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    type: 'Web App',
    budget: 5000,
    status: ProjectStatus.PLANNING,
    progress: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const handleAIAnalysis = async () => {
    setLoading(true);
    const dataSummary = projects.map(p => `${p.name}: ${p.status}, Budget ${p.budget}, Progress ${p.progress}%`).join('\n');
    const result = await analyzeProjectRisk(dataSummary);
    setAnalysis(result);
    setLoading(false);
  };

  const handleCreateProject = () => {
    if(!newProject.name || !newProject.clientId) {
        alert("Please provide a project name and select a client.");
        return;
    }
    const project: Project = {
        id: Date.now().toString(),
        clientId: newProject.clientId!,
        name: newProject.name!,
        type: newProject.type as any,
        status: newProject.status as ProjectStatus,
        startDate: newProject.startDate!,
        endDate: newProject.endDate!,
        budget: Number(newProject.budget),
        progress: 0
    };
    setProjects([project, ...projects]);
    setShowNewProjectModal(false);
    setNewProject({
        name: '',
        type: 'Web App',
        budget: 5000,
        status: ProjectStatus.PLANNING,
        progress: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Project Management</h2>
          <p className="text-slate-400 mt-1">Track tasks, timelines, and milestones.</p>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setShowNewProjectModal(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
            >
                <Plus size={18} /> New Project
            </button>
            <div className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-xl border border-white/10 backdrop-blur-sm">
            <button 
                onClick={() => setView('list')} 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    view === 'list' 
                    ? 'bg-slate-700 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
                <List size={16} /> List
            </button>
            <button 
                onClick={() => setView('gantt')} 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    view === 'gantt' 
                    ? 'bg-slate-700 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
                <Calendar size={16} /> Gantt
            </button>
            </div>
        </div>
      </div>

      {view === 'list' ? (
        <div className="grid gap-4">
          {projects.map((project) => (
            <div key={project.id} className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all duration-300 group flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              
              <div className="flex-1 relative z-10">
                <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors">{project.name}</h3>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md border ${
                        project.status === ProjectStatus.COMPLETED ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        project.status === ProjectStatus.IN_PROGRESS ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                        {project.status}
                    </span>
                </div>
                <p className="text-sm text-slate-400 mt-1">{project.type} • Client: <span className="text-slate-300">{clients.find(c => c.id === project.clientId)?.name || project.clientId}</span></p>
              </div>
              
              <div className="flex-1 max-w-sm relative z-10">
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-2">
                    <span>Progress</span>
                    <span className="text-indigo-400">{project.progress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-white/5">
                    <div 
                        className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                        style={{ width: `${project.progress}%` }}
                    />
                </div>
              </div>

              <div className="flex items-center gap-8 relative z-10">
                <div className="text-right">
                    <div className="text-xs text-slate-500 mb-1">Deadline</div>
                    <div className="flex items-center gap-1.5 text-slate-300 text-sm font-medium bg-slate-800/50 px-3 py-1.5 rounded-lg border border-white/5">
                        <Clock size={14} className="text-indigo-400" />
                        <span>{project.endDate}</span>
                    </div>
                </div>
                <div className="text-right">
                     <div className="text-xs text-slate-500 mb-1">Budget</div>
                    <div className="font-mono font-bold text-white text-lg">${project.budget.toLocaleString()}</div>
                </div>
                <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                    <MoreHorizontal size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-2xl border border-white/5 overflow-x-auto">
            <h3 className="text-lg font-bold text-white mb-8">Project Timeline</h3>
            <div className="min-w-[800px] space-y-8">
                {projects.map(project => {
                    const width = Math.max(10, project.progress * 3); 
                    const left = Math.random() * 200; 
                    
                    return (
                        <div key={project.id} className="relative">
                            <div className="flex justify-between text-sm text-slate-300 mb-2 px-1">
                                <span className="font-medium">{project.name}</span>
                                <span className="text-xs text-slate-500 font-mono">{project.startDate} - {project.endDate}</span>
                            </div>
                            <div className="h-10 bg-slate-800/50 rounded-xl relative overflow-hidden border border-white/5">
                                <div 
                                    className="absolute top-1 bottom-1 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg flex items-center px-3 text-xs font-bold text-white whitespace-nowrap shadow-lg shadow-indigo-500/20"
                                    style={{ left: `${left}px`, width: `${width + 100}px` }}
                                >
                                    {project.status}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
      )}

      <div className="glass-panel p-6 rounded-2xl border border-dashed border-indigo-500/30 bg-indigo-500/5">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertCircle className="text-indigo-400" />
                AI Risk Analysis
            </h3>
            <button 
                onClick={handleAIAnalysis}
                disabled={loading}
                className="px-6 py-2.5 bg-slate-900 border border-indigo-500/30 text-indigo-300 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 rounded-lg text-sm font-medium disabled:opacity-50 transition-all duration-300 shadow-lg shadow-indigo-900/20"
            >
                {loading ? 'Analyzing...' : 'Analyze Risks'}
            </button>
        </div>
        {analysis ? (
             <div className="prose prose-invert prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-slate-300">{analysis}</pre>
             </div>
        ) : (
            <p className="text-slate-400 text-sm">Click analyze to generate insights on project deadlines and budgets using Gemini AI.</p>
        )}
      </div>

       {/* Create Project Modal */}
       {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-lg w-full shadow-2xl relative">
                <h3 className="text-2xl font-bold text-white mb-6">Create New Project</h3>
                
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Project Name</label>
                        <input 
                            type="text" 
                            value={newProject.name}
                            onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                            placeholder="e.g. NextGen Platform"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Client</label>
                        <select 
                            value={newProject.clientId || ''}
                            onChange={(e) => setNewProject({...newProject, clientId: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                        >
                            <option value="" disabled>Select a Client</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.name} - {c.company}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Type</label>
                            <select 
                                value={newProject.type}
                                onChange={(e) => setNewProject({...newProject, type: e.target.value as any})}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                            >
                                <option>AI Solution</option>
                                <option>Web App</option>
                                <option>Consulting</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Budget ($)</label>
                            <input 
                                type="number" 
                                value={newProject.budget}
                                onChange={(e) => setNewProject({...newProject, budget: Number(e.target.value)})}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Start Date</label>
                            <input 
                                type="date" 
                                value={newProject.startDate}
                                onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Deadline</label>
                            <input 
                                type="date" 
                                value={newProject.endDate}
                                onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button 
                        onClick={() => setShowNewProjectModal(false)}
                        className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-medium hover:bg-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleCreateProject}
                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        Create Project
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;
