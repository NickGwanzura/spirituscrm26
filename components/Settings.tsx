import React, { useState } from 'react';
import { SystemUser, ReleaseNote } from '../types';
import { Shield, Save, Upload, Download, History, UserPlus, Database, FileJson, Check, AlertTriangle } from 'lucide-react';

interface SettingsProps {
  users: SystemUser[];
  setUsers: React.Dispatch<React.SetStateAction<SystemUser[]>>;
  releaseNotes: ReleaseNote[];
  exportData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ users, setUsers, releaseNotes, exportData }) => {
  const [activeTab, setActiveTab] = useState<'access' | 'backup' | 'notes'>('access');
  const [newUser, setNewUser] = useState<Partial<SystemUser>>({ name: '', email: '', role: 'Viewer' });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) return;
    const user: SystemUser = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as any,
      lastLogin: 'Never',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUser.name}`
    };
    setUsers([...users, user]);
    setNewUser({ name: '', email: '', role: 'Viewer' });
  };

  const handleImportLogins = () => {
    alert("Simulating Bulk User Import...\n\nIn a real app, this would parse a CSV/JSON file and create user accounts.");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">System Settings</h2>
          <p className="text-slate-400 mt-1">Manage access, backups, and view release history.</p>
        </div>
        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/10 backdrop-blur-sm">
           <button 
             onClick={() => setActiveTab('access')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'access' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
           >
             <Shield size={16} /> Access Control
           </button>
           <button 
             onClick={() => setActiveTab('backup')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'backup' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
           >
             <Database size={16} /> Backup & Data
           </button>
           <button 
             onClick={() => setActiveTab('notes')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'notes' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
           >
             <History size={16} /> Release Notes
           </button>
        </div>
      </div>

      {/* Access Control Tab */}
      {activeTab === 'access' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2"><Shield className="text-indigo-400" size={20}/> Team Members</h3>
                        <button onClick={handleImportLogins} className="text-xs text-indigo-300 hover:text-white flex items-center gap-1">
                            <Upload size={14} /> Import Logins (CSV)
                        </button>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase">User</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Role</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Last Login</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map(user => (
                                <tr key={user.id} className="group hover:bg-white/[0.02]">
                                    <td className="p-4 flex items-center gap-3">
                                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full bg-slate-800" />
                                        <div>
                                            <div className="text-sm font-medium text-white">{user.name}</div>
                                            <div className="text-xs text-slate-500">{user.email}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <select 
                                            defaultValue={user.role} 
                                            className="bg-transparent text-sm text-slate-300 border-none outline-none cursor-pointer hover:text-indigo-400"
                                            onChange={(e) => {
                                                const updatedUsers = users.map(u => u.id === user.id ? {...u, role: e.target.value as any} : u);
                                                setUsers(updatedUsers);
                                            }}
                                        >
                                            <option className="bg-slate-900 text-slate-300">Admin</option>
                                            <option className="bg-slate-900 text-slate-300">Manager</option>
                                            <option className="bg-slate-900 text-slate-300">Viewer</option>
                                        </select>
                                    </td>
                                    <td className="p-4 text-sm text-slate-500 font-mono">{user.lastLogin}</td>
                                    <td className="p-4 text-right">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            <Check size={10} /> Active
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/5 h-fit">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><UserPlus className="text-indigo-400" size={20}/> Invite User</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Name</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                            placeholder="John Doe"
                            value={newUser.name}
                            onChange={e => setNewUser({...newUser, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Email</label>
                        <input 
                            type="email" 
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                            placeholder="john@spiritus.agency"
                            value={newUser.email}
                            onChange={e => setNewUser({...newUser, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Role</label>
                        <select 
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                            value={newUser.role}
                            onChange={e => setNewUser({...newUser, role: e.target.value as any})}
                        >
                            <option>Admin</option>
                            <option>Manager</option>
                            <option>Viewer</option>
                        </select>
                    </div>
                    <button 
                        onClick={handleAddUser}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        Send Invitation
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Backup Tab */}
      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                    <Download className="text-indigo-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Export Data</h3>
                <p className="text-slate-400 text-sm mb-6 max-w-xs">Download a full JSON backup of clients, projects, invoices, and settings.</p>
                <button 
                    onClick={exportData}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                >
                    <FileJson size={18} /> Download Backup
                </button>
            </div>

            <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                    <Upload className="text-emerald-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Restore Data</h3>
                <p className="text-slate-400 text-sm mb-6 max-w-xs">Upload a previously exported JSON file to restore your system state.</p>
                <label className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-600 cursor-pointer flex items-center gap-2">
                    <Database size={18} /> Select File
                    <input type="file" className="hidden" onChange={(e) => alert(`File ${e.target.files?.[0]?.name} selected for restore (Mock).`)} />
                </label>
            </div>

            <div className="md:col-span-2 glass-panel p-6 rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/5 flex items-start gap-4">
                <AlertTriangle className="text-amber-400 shrink-0 mt-1" size={24} />
                <div>
                    <h4 className="font-bold text-amber-200">Security Warning</h4>
                    <p className="text-sm text-amber-200/70 mt-1">Downloading user backups includes sensitive data. Ensure you store backup files in a secure, encrypted location.</p>
                </div>
            </div>
        </div>
      )}

      {/* Release Notes Tab */}
      {activeTab === 'notes' && (
        <div className="max-w-3xl mx-auto">
            <div className="relative border-l border-white/10 ml-6 space-y-12">
                {releaseNotes.map((note, idx) => (
                    <div key={idx} className="relative pl-8">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-900 border-2 border-indigo-500"></div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                            <span className="text-2xl font-bold text-white tracking-tight">{note.version}</span>
                            <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-mono text-slate-400 border border-white/5">{note.date}</span>
                        </div>
                        <h4 className="text-lg font-semibold text-indigo-300 mb-3">{note.title}</h4>
                        <ul className="space-y-2">
                            {note.changes.map((change, i) => (
                                <li key={i} className="text-slate-400 text-sm flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 shrink-0"></div>
                                    {change}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
