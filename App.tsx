import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileEdit, 
  FolderKanban, 
  CreditCard, 
  BookOpen, 
  Menu,
  X,
  Zap,
  Search,
  Bell,
  Users,
  Settings as SettingsIcon,
  ClipboardCheck,
  FileSignature,
  LogOut
} from 'lucide-react';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProjectManager from './components/ProjectManager';
import QuoteBuilder from './components/QuoteBuilder';
import Billing from './components/Billing';
import SopLibrary from './components/SopLibrary';
import ClientManager from './components/ClientManager';
import Settings from './components/Settings';
import Onboarding from './components/Onboarding';
import ContractGenerator from './components/ContractGenerator';

import { api } from './services/api';
import { Project, ProjectStatus, HostingPackage, PaymentStatus, SOP, Client, SystemUser, ReleaseNote, OnboardingWorkflow, Invoice, Contract } from './types';

const RELEASE_NOTES: ReleaseNote[] = [
  { 
    version: 'v2.5.0', 
    date: '2024-03-11', 
    title: 'Database & Authentication', 
    changes: [
        'Connected to Neon PostgreSQL database.',
        'Added JWT-based authentication.',
        'All data now persists to the cloud.',
        'Multi-user support with role-based access.'
    ] 
  },
  { 
    version: 'v2.4.0', 
    date: '2023-11-25', 
    title: 'Agreement Vault', 
    changes: [
        'Ability to save generated contracts to the CRM.',
        'Agreement history and storage module.',
        'Persist drafted legal documents across sessions.'
    ] 
  },
  { 
    version: 'v2.3.0', 
    date: '2023-11-20', 
    title: 'Invoicing Platform', 
    changes: [
        'Added dedicated Invoicing module.',
        'Separated Recurring Hosting from standard Invoices.',
        'Added invoice status tracking (Paid/Pending/Overdue).'
    ] 
  },
];

function AppContent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Data states
  const [projects, setProjects] = useState<Project[]>([]);
  const [hostingPackages, setHostingPackages] = useState<HostingPackage[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sops, setSops] = useState<SOP[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [onboardings, setOnboardings] = useState<OnboardingWorkflow[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Load data from API
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      setIsDataLoading(true);
      try {
        const [
          clientsData,
          projectsData,
          invoicesData,
          hostingData,
          sopsData,
          contractsData,
          onboardingsData,
          usersData
        ] = await Promise.all([
          api.getClients(),
          api.getProjects(),
          api.getInvoices(),
          api.getHostingPackages(),
          api.getSOPs(),
          api.getContracts(),
          api.getOnboardingWorkflows(),
          api.getUsers()
        ]);

        setClients(clientsData);
        setProjects(projectsData);
        setInvoices(invoicesData);
        setHostingPackages(hostingData);
        setSops(sopsData);
        setContracts(contractsData);
        setOnboardings(onboardingsData);
        setUsers(usersData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsDataLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  // Data update handlers
  const handleUpdateClients = async (newClients: Client[]) => {
    setClients(newClients);
  };

  const handleUpdateProjects = async (newProjects: Project[]) => {
    setProjects(newProjects);
  };

  const handleUpdateInvoices = async (newInvoices: Invoice[]) => {
    setInvoices(newInvoices);
  };

  const handleUpdateSops = async (newSops: SOP[]) => {
    setSops(newSops);
  };

  const handleUpdateContracts = async (newContracts: Contract[]) => {
    setContracts(newContracts);
  };

  const handleUpdateOnboardings = async (newOnboardings: OnboardingWorkflow[]) => {
    setOnboardings(newOnboardings);
  };

  const handleUpdateUsers = async (newUsers: SystemUser[]) => {
    setUsers(newUsers);
  };

  const handleExportData = () => {
    const data = {
      users,
      clients,
      projects,
      sops,
      hostingPackages,
      invoices,
      contracts,
      onboardings,
      timestamp: new Date().toISOString()
    };
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `spiritus_backup_${Date.now()}.json`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const NavButton = ({ id, label, icon: Icon }: { id: string; label: string; icon: any }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`relative w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 group ${
        activeTab === id 
        ? 'text-white' 
        : 'text-slate-400 hover:text-white'
      }`}
    >
      {activeTab === id && (
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-transparent border-l-4 border-indigo-500" />
      )}
      
      <div className={`relative z-10 p-1 rounded-md transition-colors ${activeTab === id ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
        <Icon size={20} />
      </div>
      
      {sidebarOpen && <span className="relative z-10">{label}</span>}
    </button>
  );

  return (
    <div className="flex min-h-screen text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden">
      
      {/* Sidebar */}
      <aside 
        className={`${sidebarOpen ? 'w-72' : 'w-20'} glass-panel border-r-0 border-r-white/5 transition-all duration-300 flex flex-col fixed h-full z-20 shadow-2xl`}
      >
        <div className="h-20 flex items-center gap-3 px-6 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
             <Zap className="text-white w-6 h-6" fill="currentColor" />
          </div>
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white leading-none">Spiritus</span>
              <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-semibold mt-1">Agency CRM</span>
            </div>
          )}
        </div>

        <div className="px-4 py-6 flex-1 overflow-y-auto">
            <div className={`text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-4 ${!sidebarOpen && 'text-center'}`}>
                {sidebarOpen ? 'Main Menu' : 'Menu'}
            </div>
            <nav className="space-y-1">
                <NavButton id="dashboard" label="Dashboard" icon={LayoutDashboard} />
                <NavButton id="clients" label="Clients" icon={Users} />
                <NavButton id="onboarding" label="Onboarding" icon={ClipboardCheck} />
                <NavButton id="projects" label="Projects" icon={FolderKanban} />
                <NavButton id="quotes" label="Quotes & Proposals" icon={FileEdit} />
                <NavButton id="contracts" label="Legal Contracts" icon={FileSignature} />
                <NavButton id="billing" label="Invoices & Billing" icon={CreditCard} />
                <NavButton id="sops" label="SOP Library" icon={BookOpen} />
                <div className="my-2 h-[1px] bg-white/5 mx-2"></div>
                <NavButton id="settings" label="Settings" icon={SettingsIcon} />
            </nav>
        </div>

        <div className="p-4 border-t border-white/5 space-y-2">
            <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-full flex justify-center items-center p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <button 
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 p-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
                <LogOut size={18} />
                {sidebarOpen && <span className="text-sm">Logout</span>}
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-20'} relative`}>
        {/* Top Header */}
        <header className="h-20 glass-panel border-b border-white/5 sticky top-0 z-10 flex items-center justify-between px-8 backdrop-blur-md">
            <div className="flex items-center gap-4">
               <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 capitalize">
                    {activeTab === 'billing' ? 'Invoices & Billing' : activeTab.replace('-', ' ')}
               </h1>
               {isDataLoading && (
                 <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
               )}
            </div>
            
            <div className="flex items-center gap-6">
                <div className="relative group hidden md:block">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                     <input 
                        type="text" 
                        placeholder="Search..." 
                        className="bg-slate-900/50 border border-white/5 rounded-full pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 w-64 transition-all"
                     />
                </div>
                
                <button className="relative text-slate-400 hover:text-white transition-colors">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></span>
                </button>

                <div className="h-8 w-[1px] bg-white/10 mx-2"></div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-semibold text-white">{user?.name}</div>
                        <div className="text-xs text-indigo-400">{user?.role}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-indigo-500 to-violet-500">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                             <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt="Avatar" className="w-full h-full" />
                        </div>
                    </div>
                </div>
            </div>
        </header>

        {/* Content Area */}
        <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
            {activeTab === 'dashboard' && <Dashboard projects={projects} hostingPackages={hostingPackages} clients={clients} invoices={invoices} />}
            {activeTab === 'clients' && <ClientManager clients={clients} setClients={handleUpdateClients} />}
            {activeTab === 'onboarding' && <Onboarding workflows={onboardings} setWorkflows={handleUpdateOnboardings} clients={clients} />}
            {activeTab === 'projects' && <ProjectManager projects={projects} setProjects={handleUpdateProjects} clients={clients} />}
            {activeTab === 'quotes' && <QuoteBuilder clients={clients} />}
            {activeTab === 'contracts' && <ContractGenerator clients={clients} contracts={contracts} setContracts={handleUpdateContracts} />}
            {activeTab === 'billing' && <Billing packages={hostingPackages} invoices={invoices} setInvoices={handleUpdateInvoices} clients={clients} />}
            {activeTab === 'sops' && <SopLibrary sops={sops} setSops={handleUpdateSops} />}
            {activeTab === 'settings' && (
                <Settings 
                    users={users} 
                    setUsers={handleUpdateUsers} 
                    releaseNotes={RELEASE_NOTES} 
                    exportData={handleExportData}
                />
            )}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
