import React, { useState } from 'react';
import { OnboardingWorkflow, Client, OnboardingTask } from '../types';
import { generateOnboardingChecklist } from '../services/geminiService';
import { ClipboardCheck, Plus, CheckSquare, Square, MoreHorizontal, Wand2, ChevronDown, ChevronUp } from 'lucide-react';

interface OnboardingProps {
  workflows: OnboardingWorkflow[];
  setWorkflows: React.Dispatch<React.SetStateAction<OnboardingWorkflow[]>>;
  clients: Client[];
}

const Onboarding: React.FC<OnboardingProps> = ({ workflows, setWorkflows, clients }) => {
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // New Workflow State
  const [selectedClientId, setSelectedClientId] = useState('');
  const [templateType, setTemplateType] = useState('Web Development');
  const [customTasks, setCustomTasks] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  const toggleTask = (workflowId: string, taskId: string) => {
    setWorkflows(workflows.map(wf => {
      if (wf.id !== workflowId) return wf;
      return {
        ...wf,
        tasks: wf.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
      };
    }));
  };

  const handleGenerateAI = async () => {
    setGenerating(true);
    const tasks = await generateOnboardingChecklist(templateType);
    setCustomTasks(tasks);
    setGenerating(false);
  };

  const handleCreateWorkflow = () => {
    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return;

    // Use AI tasks if generated, otherwise default tasks
    const taskList = customTasks.length > 0 
        ? customTasks 
        : ["Send Welcome Packet", "Sign Contract", "Invoice Deposit", "Setup Slack Channel", "Schedule Kickoff"];

    const newWorkflow: OnboardingWorkflow = {
        id: Date.now().toString(),
        clientId: client.id,
        clientName: client.name,
        templateName: templateType,
        status: 'Active',
        startDate: new Date().toLocaleDateString(),
        tasks: taskList.map((t, i) => ({ id: `t-${i}`, label: t, completed: false }))
    };

    setWorkflows([newWorkflow, ...workflows]);
    setShowModal(false);
    setSelectedClientId('');
    setCustomTasks([]);
  };

  const calculateProgress = (tasks: OnboardingTask[]) => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Client Onboarding</h2>
          <p className="text-slate-400 mt-1">Track setup progress for new accounts and projects.</p>
        </div>
        <button 
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
        >
            <Plus size={18} /> Start Onboarding
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {workflows.map(wf => {
            const progress = calculateProgress(wf.tasks);
            const isExpanded = expandedId === wf.id;

            return (
                <div key={wf.id} className={`glass-panel rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-1 ring-indigo-500/30' : ''}`}>
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                                    <ClipboardCheck size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{wf.clientName}</h3>
                                    <p className="text-sm text-slate-400">{wf.templateName} • {wf.startDate}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="text-right mr-2">
                                    <div className="text-2xl font-bold text-white">{progress}%</div>
                                </div>
                                <button className="text-slate-500 hover:text-white">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
                            <div 
                                className={`h-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <div className="flex justify-between items-center">
                            <span className={`px-2 py-1 rounded text-xs font-bold border ${progress === 100 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                                {progress === 100 ? 'Completed' : 'Active'}
                            </span>
                            <button 
                                onClick={() => setExpandedId(isExpanded ? null : wf.id)}
                                className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                            >
                                {isExpanded ? 'Hide Tasks' : 'View Tasks'}
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Expandable Tasks Area */}
                    {isExpanded && (
                        <div className="bg-slate-900/50 border-t border-white/5 p-4 space-y-2">
                            {wf.tasks.map(task => (
                                <div 
                                    key={task.id} 
                                    onClick={() => toggleTask(wf.id, task.id)}
                                    className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-all duration-200 group active:scale-[0.99] select-none"
                                >
                                    <div className={`transform transition-all duration-300 ${task.completed ? 'text-emerald-400 scale-110' : 'text-slate-600 group-hover:text-slate-400 scale-100'}`}>
                                        {task.completed ? <CheckSquare size={20} /> : <Square size={20} />}
                                    </div>
                                    <span className={`text-sm transition-all duration-300 ${task.completed ? 'text-slate-500 line-through decoration-slate-600/50' : 'text-slate-200'}`}>
                                        {task.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        })}
      </div>

      {/* New Onboarding Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
             <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
                <h3 className="text-2xl font-bold text-white mb-6">Start Onboarding</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Client</label>
                        <select 
                            value={selectedClientId}
                            onChange={(e) => setSelectedClientId(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                        >
                            <option value="">-- Choose Client --</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Workflow Type</label>
                        <select 
                            value={templateType}
                            onChange={(e) => setTemplateType(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                        >
                            <option>Web Development</option>
                            <option>AI Solution Implementation</option>
                            <option>Consulting Retainer</option>
                            <option>Mobile App Launch</option>
                        </select>
                    </div>

                    {customTasks.length > 0 ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                            <h4 className="text-emerald-400 text-xs font-bold uppercase mb-2">AI Generated Steps</h4>
                            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                                {customTasks.map((t, i) => <li key={i}>{t}</li>)}
                            </ul>
                        </div>
                    ) : (
                        <button 
                            onClick={handleGenerateAI}
                            disabled={generating}
                            className="w-full py-2 bg-slate-800 border border-indigo-500/30 text-indigo-300 rounded-xl text-sm font-medium hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-center gap-2"
                        >
                           {generating ? <span className="animate-spin">⟳</span> : <Wand2 size={16} />}
                           Generate Checklist with AI
                        </button>
                    )}
                </div>

                <div className="flex gap-3 mt-8">
                    <button 
                        onClick={() => setShowModal(false)}
                        className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-medium hover:bg-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleCreateWorkflow}
                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        Start Workflow
                    </button>
                </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
