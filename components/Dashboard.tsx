import React from 'react';
import { Contract } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LabelList } from 'recharts';
import { AlertTriangle, ShieldCheck, DollarSign, FileText, CheckCircle2, Network, Globe2, Layers, Database, Compass, BookOpen } from 'lucide-react';

interface DashboardProps {
  contracts: Contract[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 backdrop-blur-sm text-white p-4 rounded-xl shadow-2xl border border-slate-700 max-w-[320px] animate-fade-in z-50">
        <h4 className="font-semibold text-sm mb-2 text-slate-100">{data.fullTitle}</h4>
        
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-slate-400">Early Warning Score:</span>
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
            data.score > 50 ? 'bg-red-500/20 text-red-400' : 
            data.score > 20 ? 'bg-amber-500/20 text-amber-400' : 
            'bg-emerald-500/20 text-emerald-400'
          }`}>
            {data.score}
          </span>
        </div>

        {data.aiAnalysis && (
          <div className="border-t border-slate-700/50 pt-3">
            <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 mb-1">AI Insight</p>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              {data.aiAnalysis}
            </p>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC<DashboardProps> = ({ contracts }) => {
  
  const totalValue = contracts.reduce((acc, c) => acc + c.value, 0);
  const highRiskCount = contracts.filter(c => (c.riskAnalysis?.score || 0) > 50).length;
  const avgRisk = contracts.length > 0 
    ? (contracts.reduce((acc, c) => acc + (c.riskAnalysis?.score || 0), 0) / contracts.length).toFixed(1) 
    : 0;

  const riskData = contracts.map(c => ({
    name: c.title.length > 15 ? c.title.substring(0, 15) + '...' : c.title,
    fullTitle: c.title,
    score: c.riskAnalysis?.score || 0,
    riskLevel: (c.riskAnalysis?.score || 0) > 50 ? 'High' : (c.riskAnalysis?.score || 0) > 20 ? 'Medium' : 'Low',
    aiAnalysis: c.riskAnalysis?.aiAnalysis
  }));

  const riskDistribution = [
    { name: 'Low Signal', value: contracts.filter(c => (c.riskAnalysis?.score || 0) <= 20).length, color: '#4ade80' },
    { name: 'Medium Signal', value: contracts.filter(c => (c.riskAnalysis?.score || 0) > 20 && (c.riskAnalysis?.score || 0) <= 50).length, color: '#fbbf24' },
    { name: 'High Signal', value: contracts.filter(c => (c.riskAnalysis?.score || 0) > 50).length, color: '#f87171' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Decentralized Framing Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-xl p-6 text-white shadow-xl relative overflow-hidden border border-indigo-800">
        
        <div className="relative z-10 mb-6 border-b border-indigo-800/50 pb-4">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                 <h2 className="text-2xl font-bold mb-1">Contracts Done Right and On Time</h2>
                 <p className="text-indigo-200 text-sm flex items-center gap-2">
                    <Globe2 size={14} />
                    Decentralization strengthens implementation via interoperable standards + local decisions.
                 </p>
              </div>
              <div className="bg-indigo-950/50 backdrop-blur px-3 py-1 rounded-full border border-indigo-500/30 text-xs font-mono text-indigo-300">
                Formula v3.0: Decentralized
              </div>
           </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Pillar 1: Good Data */}
            <div className="group bg-indigo-800/20 hover:bg-indigo-800/40 transition-all duration-300 p-4 rounded-lg border border-indigo-700/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                   <div className="bg-emerald-500/20 p-1.5 rounded-md text-emerald-400">
                     <Database size={16} />
                   </div>
                   <h3 className="font-semibold text-sm text-white">Good Data</h3>
                </div>
                <p className="text-xs text-indigo-200 leading-snug">
                   Local offices access central datasets (procurement, budgets, history) via standardized pipelines.
                </p>
            </div>

            {/* Pillar 2: Early Warnings */}
            <div className="group bg-indigo-800/20 hover:bg-indigo-800/40 transition-all duration-300 p-4 rounded-lg border border-indigo-700/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                   <div className="bg-amber-500/20 p-1.5 rounded-md text-amber-400">
                     <Network size={16} />
                   </div>
                   <h3 className="font-semibold text-sm text-white">Early Warnings</h3>
                </div>
                <p className="text-xs text-indigo-200 leading-snug">
                   Local actors flag risks. Distributed signals reach the center instantly for rapid response.
                </p>
            </div>

            {/* Pillar 3: Complete & Clear Docs */}
            <div className="group bg-indigo-800/20 hover:bg-indigo-800/40 transition-all duration-300 p-4 rounded-lg border border-indigo-700/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                   <div className="bg-blue-500/20 p-1.5 rounded-md text-blue-400">
                     <FileText size={16} />
                   </div>
                   <h3 className="font-semibold text-sm text-white">Portable Clarity</h3>
                </div>
                <p className="text-xs text-indigo-200 leading-snug">
                   Standard templates and rules used by HQ and municipalities alike to ensure no ambiguity.
                </p>
            </div>

            {/* Pillar 4: Step-by-Step Checks */}
            <div className="group bg-indigo-800/20 hover:bg-indigo-800/40 transition-all duration-300 p-4 rounded-lg border border-indigo-700/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                   <div className="bg-purple-500/20 p-1.5 rounded-md text-purple-400">
                     <Layers size={16} />
                   </div>
                   <h3 className="font-semibold text-sm text-white">Decentralized Checks</h3>
                </div>
                <p className="text-xs text-indigo-200 leading-snug">
                   Layered local checks at milestones using standard checklists. Rolled up for central oversight.
                </p>
            </div>
        </div>

        {/* Decor */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-600 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-purple-600 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
      </div>

      {/* Agile Approach - Non Expert Explanation */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex items-start gap-4 shadow-sm">
        <div className="bg-white p-2 rounded-full text-indigo-600 shrink-0 shadow-sm border border-indigo-100">
            <Compass size={24} />
        </div>
        <div>
            <h3 className="font-bold text-indigo-900 text-sm uppercase tracking-wide mb-1">Agile Approach (Simplified)</h3>
            <p className="text-indigo-800 text-sm leading-relaxed">
                <strong>Think of it like checking your map while you walk, instead of realizing you are lost only when you arrive.</strong> We fix small things today using this dashboard, rather than waiting for big audits next year.
            </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Contracts</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{contracts.length}</h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FileText size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Exposure</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                ${totalValue.toLocaleString()}
              </h3>
            </div>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <DollarSign size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Avg Risk Signal</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{avgRisk}</h3>
            </div>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <ShieldCheck size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">High Risk Alerts</p>
              <h3 className="text-2xl font-bold text-red-600 mt-1">{highRiskCount}</h3>
            </div>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <AlertTriangle size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Early Risk Signal by Contract</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {riskData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.score > 50 ? '#ef4444' : entry.score > 20 ? '#f59e0b' : '#10b981'} 
                    />
                  ))}
                  <LabelList 
                    dataKey="riskLevel" 
                    position="top" 
                    content={(props: any) => {
                      const { x, y, width, value } = props;
                      const color = value === 'High' ? '#ef4444' : value === 'Medium' ? '#f59e0b' : '#10b981';
                      return (
                        <text x={x + width / 2} y={y - 5} fill={color} textAnchor="middle" fontSize={11} fontWeight={700}>
                          {value}
                        </text>
                      );
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Signal Distribution</h3>
          <div className="h-64 flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
             </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {riskDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contract Types Cheat Sheet */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
         <div className="flex items-center gap-2 mb-4">
             <BookOpen size={18} className="text-slate-500" />
             <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Contract Types Guide</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
               <span className="text-xs font-bold text-indigo-600 block mb-1">SOW (Statement of Work)</span>
               <p className="text-xs text-slate-500 leading-snug">The "Recipe". Lists exactly what needs to be built, the deadlines, and the costs.</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
               <span className="text-xs font-bold text-indigo-600 block mb-1">PO (Purchase Order)</span>
               <p className="text-xs text-slate-500 leading-snug">The "Check". An official request to buy products or services and promise to pay.</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
               <span className="text-xs font-bold text-indigo-600 block mb-1">MSA (Master Agreement)</span>
               <p className="text-xs text-slate-500 leading-snug">The "Rulebook". A long-term contract setting the ground rules for future projects.</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
               <span className="text-xs font-bold text-indigo-600 block mb-1">TPH (Third Party Hold)</span>
               <p className="text-xs text-slate-500 leading-snug">The "Waiting Room". Tracks delays caused by waiting for an outside vendor.</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
               <span className="text-xs font-bold text-indigo-600 block mb-1">NDA (Non-Disclosure)</span>
               <p className="text-xs text-slate-500 leading-snug">The "Secret". A legal promise to keep confidential information private.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;