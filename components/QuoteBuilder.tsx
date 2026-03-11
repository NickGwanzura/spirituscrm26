
import React, { useState } from 'react';
import { Client } from '../types';
import { generateProposalContent } from '../services/geminiService';
import { Wand2, Download, Send, Plus, Trash2, FileText, User } from 'lucide-react';

interface QuoteBuilderProps {
  clients?: Client[];
}

const QuoteBuilder: React.FC<QuoteBuilderProps> = ({ clients = [] }) => {
  const [clientName, setClientName] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [projectType, setProjectType] = useState('Web App');
  const [items, setItems] = useState<{ desc: string; cost: number }[]>([{ desc: 'Initial Consultation', cost: 0 }]);
  const [aiProposal, setAiProposal] = useState('');
  const [requirements, setRequirements] = useState('');
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);

  const addItem = () => setItems([...items, { desc: '', cost: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  
  const updateItem = (index: number, field: 'desc' | 'cost', value: string | number) => {
    const newItems = [...items];
    if (field === 'cost') newItems[index].cost = Number(value);
    else newItems[index].desc = value as string;
    setItems(newItems);
  };

  const total = items.reduce((acc, item) => acc + item.cost, 0);

  const handleClientSelect = (id: string) => {
    setSelectedClientId(id);
    const client = clients.find(c => c.id === id);
    if (client) {
      setClientName(client.name);
    }
  };

  const handleGenerateAI = async () => {
    if (!clientName || !requirements) {
      alert("Please fill in Client Name and Requirements");
      return;
    }
    setGenerating(true);
    const content = await generateProposalContent(clientName, projectType, requirements);
    setAiProposal(content);
    setGenerating(false);
  };

  const handleSendToClient = async () => {
    if (!clientName) {
      alert("Please provide a client name.");
      return;
    }

    setSending(true);

    const client = clients.find(c => c.id === selectedClientId || c.name === clientName);
    let email = client?.email;

    if (!email) {
      email = prompt(`No email found for "${clientName}". Please enter the destination email address:`, "");
      if (!email) {
        setSending(false);
        return;
      }
    }

    // Basic email validation
    if (!email.includes('@')) {
      alert("Invalid email address.");
      setSending(false);
      return;
    }

    // Simulate sending delay
    setTimeout(() => {
      const summary = items.map(i => `- ${i.desc}: $${i.cost.toLocaleString()}`).join('\n');
      const message = `
SIMULATED EMAIL DISPATCH
---------------------------------------
To: ${email}
Subject: Project Quote: ${projectType} - Spiritus Agency

Hi ${clientName},

Please find our proposal for your ${projectType} project.

TOTAL ESTIMATE: $${total.toLocaleString()}

Scope & Items:
${summary}

${aiProposal ? `\nProject Summary:\n${aiProposal}` : ''}

Best regards,
Spiritus Agency
      `.trim();

      alert(message);
      setSending(false);
    }, 1200);
  };

  const handleExportPDF = (name: string, type: string, quoteItems: typeof items, quoteTotal: number) => {
      const itemSummary = quoteItems.map(i => `• ${i.desc}: $${i.cost.toLocaleString()}`).join('\n');
      const date = new Date().toLocaleDateString();
      
      const message = `PDF GENERATION SIMULATION\n\n` +
          `-------------------------------------------\n` +
          `Client:   ${name || 'N/A'}\n` +
          `Project:  ${type}\n` +
          `Date:     ${date}\n` +
          `-------------------------------------------\n` +
          `Line Items:\n${itemSummary}\n` +
          `-------------------------------------------\n` +
          `TOTAL:    $${quoteTotal.toLocaleString()}\n` +
          `-------------------------------------------\n\n` +
          `[System] The PDF file would now be downloaded to the user's device.`;
          
      alert(message);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-fade-in">
      {/* Input Section */}
      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-indigo-500/10 rounded-lg">
                <FileText className="text-indigo-400" size={20} />
             </div>
             <h2 className="text-xl font-bold text-white">Project Details</h2>
          </div>
          
          <div className="space-y-5">
            <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Client (Optional)</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <select 
                      value={selectedClientId}
                      onChange={(e) => handleClientSelect(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-3 text-white outline-none appearance-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm"
                  >
                      <option value="">-- Quick Select Existing Client --</option>
                      {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                      ))}
                  </select>
                </div>
            </div>
            <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Client Name / Display Name</label>
                <input 
                    type="text" 
                    value={clientName}
                    onChange={(e) => {
                      setClientName(e.target.value);
                      if (selectedClientId) setSelectedClientId('');
                    }}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-600"
                    placeholder="e.g. Acme Corp"
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Project Type</label>
                <div className="relative">
                    <select 
                        value={projectType}
                        onChange={(e) => setProjectType(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 text-white outline-none appearance-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                    >
                        <option>AI Solution</option>
                        <option>Web App Development</option>
                        <option>Consulting</option>
                        <option>Mobile App</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
                </div>
            </div>
            <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Requirements (for AI)</label>
                <textarea 
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 text-white h-32 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none resize-none transition-all placeholder:text-slate-600"
                    placeholder="Describe the project scope to auto-generate the proposal..."
                />
            </div>
             <button 
                onClick={handleGenerateAI}
                disabled={generating}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl text-white font-bold hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
                <Wand2 size={18} className={generating ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'} />
                {generating ? 'Drafting Proposal...' : 'Generate Scope with AI'}
            </button>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Line Items</h2>
                <button onClick={addItem} className="text-indigo-300 hover:text-white text-sm font-medium flex items-center gap-1 px-3 py-1.5 bg-indigo-500/10 rounded-lg hover:bg-indigo-500/20 transition-colors">
                    <Plus size={16} /> Add Item
                </button>
            </div>
            <div className="space-y-3">
                {items.map((item, idx) => (
                    <div key={idx} className="flex gap-3 group">
                        <input 
                            type="text" 
                            value={item.desc}
                            onChange={(e) => updateItem(idx, 'desc', e.target.value)}
                            placeholder="Description"
                            className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 text-white text-sm focus:border-indigo-500/50 outline-none"
                        />
                        <input 
                            type="number" 
                            value={item.cost}
                            onChange={(e) => updateItem(idx, 'cost', e.target.value)}
                            placeholder="0.00"
                            className="w-28 bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 text-white text-sm text-right focus:border-indigo-500/50 outline-none font-mono"
                        />
                        <button onClick={() => removeItem(idx)} className="p-3 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                <span className="text-slate-400 font-medium">Total Estimate</span>
                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">${total.toLocaleString()}</span>
            </div>
        </div>
      </div>

      {/* Preview Section - Paper Effect */}
      <div className="relative">
        <div className="absolute inset-0 bg-white blur-xl opacity-5 rounded-2xl"></div>
        <div className="bg-slate-100 rounded-xl p-10 shadow-2xl text-slate-800 h-full min-h-[700px] flex flex-col relative z-10 mx-auto max-w-[650px] transform transition-transform hover:scale-[1.01] duration-500">
            <div className="flex justify-between items-start mb-10 border-b border-slate-300 pb-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">QUOTE</h1>
                    <p className="text-sm text-slate-500 mt-2 font-mono">#{Math.floor(Math.random() * 10000)}</p>
                </div>
                <div className="text-right">
                    <div className="flex items-center justify-end gap-2 mb-2">
                        <div className="w-6 h-6 bg-indigo-600 rounded-md"></div>
                        <h3 className="font-bold text-xl text-slate-900">Spiritus.</h3>
                    </div>
                    <p className="text-sm text-slate-500">AI Solutions & Custom Web Apps</p>
                    <p className="text-sm text-slate-500">contact@spiritus.agency</p>
                </div>
            </div>

            <div className="mb-10 grid grid-cols-2 gap-8">
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Prepared For</h4>
                    <div className="text-xl font-bold text-slate-900">{clientName || 'Client Name'}</div>
                    <div className="text-slate-500">{projectType}</div>
                </div>
                <div className="text-right">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date</h4>
                    <div className="text-slate-900 font-medium">{new Date().toLocaleDateString()}</div>
                </div>
            </div>

            {aiProposal && (
                <div className="mb-10 bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                    <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">Project Scope</h4>
                    <div className="prose prose-sm prose-slate max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">{aiProposal}</pre>
                    </div>
                </div>
            )}

            <table className="w-full mb-10">
                <thead>
                    <tr className="border-b-2 border-slate-200 text-left">
                        <th className="py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                        <th className="py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {items.map((item, i) => (
                        <tr key={i}>
                            <td className="py-4 text-sm font-medium text-slate-800">{item.desc || 'Item description'}</td>
                            <td className="py-4 text-sm text-slate-800 text-right font-mono">${item.cost.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-auto">
                <div className="flex justify-end items-center gap-8 pt-6 border-t border-slate-300">
                    <div className="text-sm text-slate-500 font-medium">Grand Total</div>
                    <div className="text-4xl font-bold text-indigo-600 tracking-tight">${total.toLocaleString()}</div>
                </div>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-200 flex gap-4 print:hidden">
                <button 
                    onClick={() => handleExportPDF(clientName, projectType, items, total)}
                    className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
                >
                    <Download size={18} /> Download PDF
                </button>
                <button 
                    onClick={handleSendToClient}
                    disabled={sending}
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 disabled:opacity-70"
                >
                    <Send size={18} className={sending ? 'animate-pulse' : ''} />
                    {sending ? 'Sending...' : 'Send to Client'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteBuilder;
