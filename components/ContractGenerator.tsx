import React, { useState, useRef } from 'react';
import { Client, Contract } from '../types';
import { generateLegalContract } from '../services/geminiService';
import { 
  FileSignature, 
  Download, 
  Wand2, 
  ShieldCheck, 
  Printer, 
  Copy, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Save, 
  History, 
  PenTool,
  Archive,
  ArrowRight
} from 'lucide-react';

// Declaration for html2pdf which is loaded via script tag in index.html
declare var html2pdf: any;

interface ContractGeneratorProps {
  clients: Client[];
  contracts: Contract[];
  setContracts: React.Dispatch<React.SetStateAction<Contract[]>>;
}

const ContractGenerator: React.FC<ContractGeneratorProps> = ({ clients, contracts, setContracts }) => {
  const [activeSubTab, setActiveSubTab] = useState<'create' | 'history'>('create');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [contractType, setContractType] = useState('Non-Disclosure Agreement (NDA)');
  const [jurisdiction, setJurisdiction] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentTerms, setPaymentTerms] = useState('');
  const [details, setDetails] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // We target the inner content to avoid overflow issues of the scrollable parent
  const contractContentRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!selectedClientId) {
      alert("Please select a client.");
      return;
    }
    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return;

    setGenerating(true);

    const structuredDetails = `
Key Information Provided:
- Jurisdiction/Governing Law: ${jurisdiction || 'Not specified (Default to Provider location)'}
- Effective Date: ${effectiveDate}
- Payment Terms: ${paymentTerms || 'Not applicable'}

Project Scope & Deliverables:
${details || 'Standard agency services.'}
    `.trim();

    const content = await generateLegalContract(contractType, client.name, structuredDetails);
    setGeneratedContent(content);
    setGenerating(false);
  };

  const handleSave = () => {
    if (!generatedContent || !selectedClientId) return;
    
    setSaving(true);
    const client = clients.find(c => c.id === selectedClientId);
    
    const newContract: Contract = {
      id: Date.now().toString(),
      clientId: selectedClientId,
      clientName: client?.name || 'Unknown',
      type: contractType,
      content: generatedContent,
      status: 'Draft',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setContracts([newContract, ...contracts]);
    
    setTimeout(() => {
      setSaving(false);
      alert("Agreement saved successfully to the CRM vault.");
    }, 600);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    alert("Contract text copied to clipboard!");
  };

  const handleDownloadPDF = async () => {
    if (!contractContentRef.current || !generatedContent) return;
    
    setDownloading(true);
    const client = clients.find(c => c.id === selectedClientId);
    const fileName = `${client?.company || 'Spiritus'}_${contractType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

    // html2pdf options refined for multi-page support
    const opt = {
      margin: 15,
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        logging: false,
        letterRendering: true,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      // Important: 'avoid-all' often causes 1-page bugs. 
      // Using 'css' and 'legacy' ensures page breaks are respected.
      pagebreak: { mode: ['css', 'legacy'] }
    };

    try {
      // We pass the inner content specifically to avoid height truncation from the scrollable parent
      const element = contractContentRef.current;
      await html2pdf().from(element).set(opt).save();
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Failed to generate PDF. Please try browser printing (Ctrl+P) as a fallback.");
    } finally {
      setDownloading(false);
    }
  };

  const loadContractFromHistory = (contract: Contract) => {
    setGeneratedContent(contract.content);
    setContractType(contract.type);
    setSelectedClientId(contract.clientId);
    setActiveSubTab('create');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-[calc(100vh-140px)] animate-fade-in">
      {/* Controls Section */}
      <div className="flex flex-col gap-6 overflow-hidden no-print">
        {/* Tab Switcher */}
        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/10 w-fit">
            <button 
                onClick={() => setActiveSubTab('create')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeSubTab === 'create' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
                <PenTool size={16} /> New Draft
            </button>
            <button 
                onClick={() => setActiveSubTab('history')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeSubTab === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
                <History size={16} /> Agreement Vault ({contracts.length})
            </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {activeSubTab === 'create' ? (
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-5">
                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <FileSignature className="text-indigo-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">AI Contract Drafter</h2>
                        <p className="text-sm text-slate-400">Draft customized legal docs in seconds.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Client</label>
                        <select 
                            value={selectedClientId}
                            onChange={(e) => setSelectedClientId(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-indigo-500 outline-none transition-all"
                        >
                            <option value="">-- Choose Client --</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.name} - {c.company}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Contract Type</label>
                        <select 
                            value={contractType}
                            onChange={(e) => setContractType(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-indigo-500 outline-none transition-all"
                        >
                            <option>Non-Disclosure Agreement (NDA)</option>
                            <option>Master Services Agreement (MSA)</option>
                            <option>Statement of Work (SOW)</option>
                            <option>Independent Contractor Agreement</option>
                            <option>Retainer Agreement</option>
                            <option>Web Development Contract</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <MapPin size={12}/> Jurisdiction
                            </label>
                            <input 
                                type="text" 
                                value={jurisdiction}
                                onChange={(e) => setJurisdiction(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                                placeholder="e.g. California, USA"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <Calendar size={12}/> Effective Date
                            </label>
                            <input 
                                type="date" 
                                value={effectiveDate}
                                onChange={(e) => setEffectiveDate(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <DollarSign size={12}/> Payment Terms (Optional)
                        </label>
                        <input 
                            type="text" 
                            value={paymentTerms}
                            onChange={(e) => setPaymentTerms(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                            placeholder="e.g. 50% upfront, Net 30"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Project Scope & Deliverables</label>
                        <textarea 
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 text-white h-32 focus:border-indigo-500 outline-none resize-none placeholder:text-slate-600"
                            placeholder="Describe specific services or requirements..."
                        />
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={generating}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl text-white font-bold hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {generating ? (
                            <>
                                <span className="animate-spin">⟳</span> Drafting Legal Text...
                            </>
                        ) : (
                            <>
                                < Wand2 size={18} className="group-hover:rotate-12 transition-transform" /> Generate Contract
                            </>
                        )}
                    </button>
                </div>
            </div>
          ) : (
            <div className="space-y-4">
                {contracts.length > 0 ? (
                    contracts.map(contract => (
                        <div key={contract.id} className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all duration-300 group flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-slate-800 rounded-xl text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <Archive size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">{contract.clientName}</h4>
                                    <p className="text-xs text-slate-500">{contract.type} • {contract.createdAt}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-[10px] font-bold uppercase tracking-wider">
                                    {contract.status}
                                </span>
                                <button 
                                    onClick={() => loadContractFromHistory(contract)}
                                    className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="glass-panel p-12 rounded-2xl border border-dashed border-white/10 flex flex-col items-center text-center">
                        <Archive size={48} className="text-slate-700 mb-4" />
                        <h3 className="text-white font-bold">No saved agreements</h3>
                        <p className="text-slate-500 text-sm mt-1">Generate and save a contract to see it here.</p>
                    </div>
                )}
            </div>
          )}
          
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-center items-center text-center opacity-80 mt-6">
              <ShieldCheck size={48} className="text-emerald-500/50 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Legal Disclaimer</h3>
              <p className="text-sm text-slate-400 max-w-sm">
                  Generated by Gemini Pro. Review by legal counsel is recommended. Spiritus CRM is not a law firm.
              </p>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col h-full relative">
        <div className="bg-slate-100 border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-10 no-print">
            <div className="flex items-center gap-2 text-slate-600">
                <FileSignature size={18} />
                <span className="font-semibold text-sm">Agreement Preview</span>
            </div>
            <div className="flex gap-2">
                {generatedContent && (
                    <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                    >
                        <Save size={14} /> {saving ? 'Saving...' : 'Save to CRM'}
                    </button>
                )}
                <button onClick={handleCopy} className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors" title="Copy Text">
                    <Copy size={18} />
                </button>
                <button onClick={() => window.print()} className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors" title="Print">
                    <Printer size={18} />
                </button>
                <button 
                  onClick={handleDownloadPDF} 
                  disabled={downloading || !generatedContent}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-50"
                >
                    <Download size={14} /> {downloading ? 'Preparing...' : 'Download PDF'}
                </button>
            </div>
        </div>

        {/* This scrollable container is for the UI only. html2pdf targets the inner ref. */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 bg-white scroll-smooth no-print">
            <div ref={contractContentRef} className="bg-white p-4">
                {generatedContent ? (
                    <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-li:text-slate-700 print:text-black">
                        <div className="whitespace-pre-wrap">{generatedContent}</div>
                        
                        {/* Signature Block */}
                        <div className="mt-16 pt-8 border-t border-slate-300 grid grid-cols-2 gap-12 not-prose break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                            <div>
                                <div className="h-12 border-b border-slate-400 mb-2"></div>
                                <p className="font-bold text-slate-900">Spiritus Agency</p>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Provider Signature</p>
                            </div>
                            <div>
                                <div className="h-12 border-b border-slate-400 mb-2"></div>
                                <p className="font-bold text-slate-900">{clients.find(c => c.id === selectedClientId)?.name || 'Client Representative'}</p>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Client Signature</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300">
                        <FileSignature size={64} className="mb-4 opacity-20" />
                        <p className="text-xl font-bold text-slate-400">Ready to Draft</p>
                        <p className="text-sm">Select a client and enter deal terms to begin.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ContractGenerator;