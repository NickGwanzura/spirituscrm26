import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { Project, ProjectStatus, HostingPackage, Client, Invoice } from '../types';
import { Activity, DollarSign, Server, Users, TrendingUp, ArrowUpRight } from 'lucide-react';

interface DashboardProps {
  projects: Project[];
  hostingPackages: HostingPackage[];
  clients: Client[];
  invoices: Invoice[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

const Dashboard: React.FC<DashboardProps> = ({ projects, hostingPackages, clients, invoices }) => {
  
  // Calculate Stats
  const totalRevenue = invoices
    .filter(i => i.status === 'Paid')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const activeProjects = projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length;
  const monthlyRecurring = hostingPackages.reduce((acc, curr) => acc + curr.monthlyCost, 0);
  const totalClients = clients.length;

  // Chart Data Preparation
  const statusCounts = projects.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(statusCounts).map((key, index) => ({
    name: key,
    value: statusCounts[key],
  }));

  const revenueData = [
    { name: 'Jan', uv: 4000 },
    { name: 'Feb', uv: 3000 },
    { name: 'Mar', uv: 2000 },
    { name: 'Apr', uv: 2780 },
    { name: 'May', uv: 1890 },
    { name: 'Jun', uv: 2390 },
    { name: 'Jul', uv: 3490 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="Total Revenue" 
            value={`$${totalRevenue.toLocaleString()}`} 
            trend="+12.5%"
            icon={<DollarSign className="w-6 h-6 text-indigo-400" />} 
            gradient="from-indigo-500/10 to-violet-500/10"
            border="group-hover:border-indigo-500/50"
        />
        <StatCard 
            title="Active Projects" 
            value={activeProjects.toString()} 
            trend="+2"
            icon={<Activity className="w-6 h-6 text-emerald-400" />} 
             gradient="from-emerald-500/10 to-teal-500/10"
             border="group-hover:border-emerald-500/50"
        />
        <StatCard 
            title="Monthly Recurring" 
            value={`$${monthlyRecurring.toLocaleString()}`} 
            trend="+5.2%"
            icon={<Server className="w-6 h-6 text-blue-400" />} 
             gradient="from-blue-500/10 to-cyan-500/10"
             border="group-hover:border-blue-500/50"
        />
        <StatCard 
            title="Total Clients" 
            value={totalClients.toString()} 
            trend="+1"
            icon={<Users className="w-6 h-6 text-purple-400" />} 
             gradient="from-purple-500/10 to-pink-500/10"
             border="group-hover:border-purple-500/50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl shadow-xl border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
          <div className="flex justify-between items-center mb-6">
            <div>
                 <h3 className="text-lg font-bold text-white">Revenue Trends</h3>
                 <p className="text-sm text-slate-400">Monthly earnings overview</p>
            </div>
            <button className="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-slate-400 transition-colors">
                <TrendingUp size={18} />
            </button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#64748b" axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="uv" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl shadow-xl border border-white/5 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl -ml-32 -mt-32 pointer-events-none"></div>
          <h3 className="text-lg font-bold text-white mb-1">Project Status</h3>
          <p className="text-sm text-slate-400 mb-6">Distribution by phase</p>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} 
                   itemStyle={{ color: '#e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-white">{projects.length}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider">Total</span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {pieData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-slate-300">{entry.name}</span>
                    </div>
                    <span className="font-medium text-slate-400">{entry.value}</span>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, trend, icon, gradient, border }: any) => (
  <div className={`glass-panel p-6 rounded-2xl border border-white/5 shadow-lg group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden ${border}`}>
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
    <div className="relative z-10 flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-800/50 rounded-xl border border-white/5 backdrop-blur-sm group-hover:bg-slate-800 transition-colors">
            {icon}
        </div>
        <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg text-xs font-medium">
            <ArrowUpRight size={12} />
            {trend}
        </div>
    </div>
    <div className="relative z-10">
        <div className="text-slate-400 text-sm font-medium mb-1">{title}</div>
        <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
    </div>
  </div>
);

export default Dashboard;
