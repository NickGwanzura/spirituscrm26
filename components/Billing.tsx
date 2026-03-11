import React, { useState } from 'react';
import { HostingPackage, PaymentStatus, Invoice, Client } from '../types';
import { Server, MoreHorizontal, CheckCircle, AlertCircle, Clock, FileText, Download, Receipt, Repeat, Plus } from 'lucide-react';

interface BillingProps {
  packages: HostingPackage[];
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  clients: Client[];
}

const Billing: React.FC<BillingProps> = ({ packages, invoices, setInvoices, clients }) => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'hosting'>('invoices');
  const [showModal, setShowModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    amount: 1000,
    status: 'Pending',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const handleCreateInvoice = () => {
    if (!newInvoice.clientId || !newInvoice.amount) {
        alert("Please select a client and enter an amount.");
        return;
    }

    const client = clients.find(c => c.id === newInvoice.clientId);
    
    const invoice: Invoice = {
        id: Date.now().toString(),
        invoiceNumber: newInvoice.invoiceNumber!,
        clientId: newInvoice.clientId!,
        clientName: client ? client.name : 'Unknown Client',
        amount: Number(newInvoice.amount),
        status: newInvoice.status as any,
        issueDate: newInvoice.issueDate!,
        dueDate: newInvoice.dueDate!
    };

    setInvoices([invoice, ...invoices]);
    setShowModal(false);
    
    // Simulate PDF generation/download
    setTimeout(() => {
        alert(`Generating PDF for ${invoice.invoiceNumber}...\n\nIn a real app, the file would download now.`);
    }, 500);

    // Reset form
    setNewInvoice({
        invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        amount: 1000,
        status: 'Pending',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  };

  const handleDownloadInvoice = (identifier: string, amount: number) => {
    alert(`Downloading PDF for ${identifier}...\nAmount: $${amount}\n\n(Mock functionality)`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Paid':
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle size={14} /> Paid
                </span>
            );
        case 'Overdue':
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <AlertCircle size={14} /> Overdue
                </span>
            );
        case 'Pending':
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Clock size={14} /> Pending
                </span>
            );
        default:
            return null;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-6">
        <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Billing & Invoices</h2>
            <p className="text-slate-400 mt-1">Manage one-off invoices and recurring hosting subscriptions.</p>
        </div>
        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/10 backdrop-blur-sm">
           <button 
             onClick={() => setActiveTab('invoices')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'invoices' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
           >
             <Receipt size={16} /> All Invoices
           </button>
           <button 
             onClick={() => setActiveTab('hosting')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'hosting' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
           >
             <Repeat size={16} /> Recurring Hosting
           </button>
        </div>
      </div>

      {activeTab === 'invoices' && (
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h3 className="font-bold text-white">Invoice History</h3>
                <button 
                    onClick={() => setShowModal(true)}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 flex items-center gap-2"
                >
                    <Plus size={14} /> Create New Invoice
                </button>
            </div>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-white/5 border-b border-white/5">
                        <th className="p-5 text-xs font-bold text-slate-300 uppercase tracking-wider">Invoice #</th>
                        <th className="p-5 text-xs font-bold text-slate-300 uppercase tracking-wider">Client</th>
                        <th className="p-5 text-xs font-bold text-slate-300 uppercase tracking-wider">Issue Date</th>
                        <th className="p-5 text-xs font-bold text-slate-300 uppercase tracking-wider">Due Date</th>
                        <th className="p-5 text-xs font-bold text-slate-300 uppercase tracking-wider">Amount</th>
                        <th className="p-5 text-xs font-bold text-slate-300 uppercase tracking-wider">Status</th>
                        <th className="p-5 text-xs font-bold text-slate-300 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {invoices.map((inv) => (
                        <tr key={inv.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="p-5 text-slate-300 font-mono text-sm">{inv.invoiceNumber}</td>
                            <td className="p-5 font-bold text-white">{inv.clientName}</td>
                            <td className="p-5 text-slate-400 text-sm">{inv.issueDate}</td>
                            <td className="p-5 text-slate-400 text-sm">{inv.dueDate}</td>
                            <td className="p-5 text-white font-mono font-medium">${inv.amount.toLocaleString()}</td>
                            <td className="p-5">{getStatusBadge(inv.status)}</td>
                            <td className="p-5 text-right flex justify-end gap-2">
                                <button 
                                    onClick={() => handleDownloadInvoice(inv.invoiceNumber, inv.amount)}
                                    title="Download PDF"
                                    className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <Download size={18} />
                                </button>
                                <button className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                    <MoreHorizontal size={20} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}

      {activeTab === 'hosting' && (
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
             <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h3 className="font-bold text-white">Active Subscriptions</h3>
            </div>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-white/5 border-b border-white/5">
                        <th className="p-5 text-xs font-bold text-slate-300 uppercase tracking-wider">Client / App</th>
                        <th className="p-5 text-xs font-bold text-slate-300 uppercase tracking-wider">Monthly Cost</th>
                        <th className="p-5 text-xs font-bold text-slate-300 uppercase tracking-wider">Last Paid</th>
                        <th className="p-5 text-xs font-bold text-slate-300 uppercase tracking-wider">Next Due</th>
                        <th className="p-5 text-xs font-bold text-slate-300 uppercase tracking-wider">Status</th>
                        <th className="p-5 text-xs font-bold text-slate-300 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {packages.map((pkg) => (
                        <tr key={pkg.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="p-5">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-slate-800 rounded-xl border border-white/10 group-hover:border-indigo-500/30 transition-colors">
                                        <Server className="text-indigo-400" size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white text-sm">{pkg.appName}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">ID: {pkg.clientId}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-5 text-slate-200 font-mono font-medium">${pkg.monthlyCost.toFixed(2)}</td>
                            <td className="p-5 text-slate-400 text-sm">{pkg.lastPaymentDate}</td>
                            <td className="p-5 text-slate-400 text-sm">{pkg.nextPaymentDate}</td>
                            <td className="p-5">{getStatusBadge(pkg.status)}</td>
                            <td className="p-5 text-right flex justify-end gap-2">
                                <button 
                                    onClick={() => handleDownloadInvoice(pkg.appName, pkg.monthlyCost)}
                                    title="Download Receipt"
                                    className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <FileText size={18} />
                                </button>
                                <button className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                    <MoreHorizontal size={20} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}

      {/* New Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
                <h3 className="text-2xl font-bold text-white mb-6">Create New Invoice</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Invoice Number</label>
                        <input 
                            type="text" 
                            value={newInvoice.invoiceNumber}
                            onChange={(e) => setNewInvoice({...newInvoice, invoiceNumber: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Client</label>
                        <select 
                            value={newInvoice.clientId || ''}
                            onChange={(e) => setNewInvoice({...newInvoice, clientId: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                        >
                            <option value="" disabled>Select a Client</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.name} - {c.company}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Amount ($)</label>
                        <input 
                            type="number" 
                            value={newInvoice.amount}
                            onChange={(e) => setNewInvoice({...newInvoice, amount: Number(e.target.value)})}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Issue Date</label>
                            <input 
                                type="date" 
                                value={newInvoice.issueDate}
                                onChange={(e) => setNewInvoice({...newInvoice, issueDate: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Due Date</label>
                            <input 
                                type="date" 
                                value={newInvoice.dueDate}
                                onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button 
                        onClick={() => setShowModal(false)}
                        className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-medium hover:bg-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleCreateInvoice}
                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        Generate & Download
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Billing;