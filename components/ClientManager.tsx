import React, { useState } from 'react';
import { Client } from '../types';
import { User, Mail, Building, Plus, MoreHorizontal, Search, CheckCircle, XCircle, Trash2, Tag } from 'lucide-react';

interface ClientManagerProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
}

const ClientManager: React.FC<ClientManagerProps> = ({ clients, setClients }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState<Partial<Client>>({ name: '', company: '', email: '', status: 'Active', customFields: {} });
  
  // State for new custom field inputs
  const [customFieldKey, setCustomFieldKey] = useState('');
  const [customFieldValue, setCustomFieldValue] = useState('');

  const handleAddClient = () => {
    if (!newClient.name || !newClient.company) return;
    const client: Client = {
      id: Date.now().toString(),
      name: newClient.name || '',
      company: newClient.company || '',
      email: newClient.email || '',
      status: 'Active',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newClient.name}`,
      customFields: newClient.customFields || {}
    };
    setClients([...clients, client]);
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
      setNewClient({ name: '', company: '', email: '', status: 'Active', customFields: {} });
      setCustomFieldKey('');
      setCustomFieldValue('');
  };

  const addCustomField = () => {
      if (!customFieldKey || !customFieldValue) return;
      setNewClient({
          ...newClient,
          customFields: {
              ...newClient.customFields,
              [customFieldKey]: customFieldValue
          }
      });
      setCustomFieldKey('');
      setCustomFieldValue('');
  };

  const removeCustomField = (key: string) => {
      const updatedFields = { ...newClient.customFields };
      delete updatedFields[key];
      setNewClient({ ...newClient, customFields: updatedFields });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Client Management</h2>
          <p className="text-slate-400 mt-1">Manage client relationships and contact details.</p>
        </div>
        <button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
            <Plus size={18} /> Add New Client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
            <div key={client.id} className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all duration-300 group relative overflow-hidden flex flex-col h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-indigo-500 to-violet-500">
                        <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden">
                             <img src={client.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${client.name}`} alt={client.name} className="w-full h-full" />
                        </div>
                    </div>
                    <button className="text-slate-500 hover:text-white transition-colors">
                        <MoreHorizontal size={20} />
                    </button>
                </div>
                
                <div className="relative z-10 space-y-1 mb-6 flex-grow">
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">{client.name}</h3>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Building size={14} />
                        {client.company}
                    </div>

                    {/* Display Custom Fields */}
                    {client.customFields && Object.keys(client.customFields).length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-y-3 gap-x-2">
                            {Object.entries(client.customFields).map(([key, value]) => (
                                <div key={key}>
                                    <div className="text-[10px] uppercase text-indigo-400/80 font-bold mb-0.5">{key}</div>
                                    <div className="text-xs text-slate-300 truncate" title={value}>{value}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="relative z-10 pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Mail size={14} />
                        <span className="truncate max-w-[120px]">{client.email}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-xs font-bold border ${
                        client.status === 'Active' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                        {client.status}
                    </span>
                </div>
            </div>
        ))}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-y-auto max-h-[90vh]">
                <h3 className="text-2xl font-bold text-white mb-6">Add New Client</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                        <input 
                            type="text" 
                            value={newClient.name}
                            onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                            placeholder="e.g. Sarah Connor"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Company</label>
                        <input 
                            type="text" 
                            value={newClient.company}
                            onChange={(e) => setNewClient({...newClient, company: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                            placeholder="e.g. Cyberdyne Systems"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                        <input 
                            type="email" 
                            value={newClient.email}
                            onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                            placeholder="sarah@example.com"
                        />
                    </div>

                    {/* Custom Fields Section */}
                    <div className="pt-4 border-t border-white/10">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                             <Tag size={12} /> Custom Fields
                        </label>
                        
                        <div className="space-y-2 mb-3">
                            {newClient.customFields && Object.entries(newClient.customFields).map(([key, value]) => (
                                <div key={key} className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-white/5 group">
                                    <div className="flex-1 text-xs">
                                        <span className="text-indigo-400 font-semibold">{key}:</span> <span className="text-slate-300">{value}</span>
                                    </div>
                                    <button 
                                        onClick={() => removeCustomField(key)} 
                                        className="text-slate-500 hover:text-red-400 transition-colors p-1"
                                    >
                                        <Trash2 size={14}/>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={customFieldKey}
                                onChange={(e) => setCustomFieldKey(e.target.value)}
                                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-2 text-sm text-white focus:border-indigo-500 outline-none placeholder:text-slate-600"
                                placeholder="Label (e.g. Source)"
                            />
                            <input 
                                type="text" 
                                value={customFieldValue}
                                onChange={(e) => setCustomFieldValue(e.target.value)}
                                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-2 text-sm text-white focus:border-indigo-500 outline-none placeholder:text-slate-600"
                                placeholder="Value"
                            />
                            <button 
                                onClick={addCustomField}
                                className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-xl border border-white/10 transition-colors"
                                disabled={!customFieldKey || !customFieldValue}
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button 
                        onClick={() => { setShowAddModal(false); resetForm(); }}
                        className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-medium hover:bg-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleAddClient}
                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        Create Client
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ClientManager;
