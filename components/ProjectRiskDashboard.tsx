import React from 'react';
import { SystemRisk } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ScatterChart, Scatter, ZAxis } from 'recharts';
import { Activity, CheckCircle2, HelpCircle, Info } from 'lucide-react';

// Hardcoded data from the Python script
const RAW_RISKS = [
  {
    category: "Data Migration Errors",
    description: "Contracts uploaded with missing deadlines or metadata.",
    likelihood: 3, impact: 4,
    mitigation: "Run double-checks, use automated data validation scripts."
  },
  {
    category: "User Adoption Resistance",
    description: "Staff may prefer manual processes.",
    likelihood: 4, impact: 3,
    mitigation: "Training, clear guidelines, change-management incentives."
  },
  {
    category: "Legal/Compliance Oversight",
    description: "Some clauses not mapped correctly by compliance engine.",
    likelihood: 2, impact: 5,
    mitigation: "Regular updates with national/EU legal databases."
  },
  {
    category: "Cybersecurity Breach",
    description: "Sensitive contracts exposed.",
    likelihood: 2, impact: 5,
    mitigation: "Encrypt uploads, strong RBAC, MFA, logging & monitoring."
  },
  {
    category: "Vendor Pushback",
    description: "Contractors resist new transparency.",
    likelihood: 3, impact: 3,
    mitigation: "Educate vendors; provide onboarding support & documentation."
  },
  {
    category: "System Downtime",
    description: "Delays in dashboards during council sessions.",
    likelihood: 2, impact: 4,
    mitigation: "Redundancy, uptime SLO/SLA, failover & backups."
  },
  {
    category: "Audit Inconsistencies",
    description: "Departments fail to log touch points.",
    likelihood: 3, impact: 3,
    mitigation: "Make logging mandatory; automated reminders & checks."
  },
  {
    category: "Budget Overrun (Platform Costs)",
    description: "Unexpected license/maintenance costs.",
    likelihood: 2, impact: 3,
    mitigation: "Negotiate fixed annual contracts; track TCO vs. benefits."
  },
];

// Process data to match SystemRisk interface
const SYSTEM_RISKS: SystemRisk[] = RAW_RISKS.map((r, i) => {
  const score = r.likelihood * r.impact;
  let level: 'High' | 'Medium' | 'Low' = 'Low';
  if (score >= 15) level = 'High';
  else if (score >= 8) level = 'Medium';
  
  return {
    id: `sys-risk-${i}`,
    ...r,
    score,
    level
  };
});

const RiskMatrix = ({ risks }: { risks: SystemRisk[] }) => {
  // Generate 5x5 grid data
  const grid = Array.from({ length: 5 }, (_, i) => {
    const impact = 5 - i; // 5 down to 1
    return Array.from({ length: 5 }, (_, j) => {
      const likelihood = j + 1; // 1 to 5
      const count = risks.filter(r => r.impact === impact && r.likelihood === likelihood).length;
      const score = impact * likelihood;
      
      let bgColor = 'bg-emerald-50';
      let textColor = 'text-slate-400';
      let hoverRing = 'hover:ring-emerald-400';
      
      if (score >= 15) { 
        bgColor = 'bg-red-500'; 
        textColor = 'text-white'; 
        hoverRing = 'hover:ring-red-400';
      }
      else if (score >= 8) { 
        bgColor = 'bg-amber-400'; 
        textColor = 'text-white'; 
        hoverRing = 'hover:ring-amber-400';
      }
      else if (score >= 5) { 
        bgColor = 'bg-emerald-400'; 
        textColor = 'text-white'; 
        hoverRing = 'hover:ring-emerald-400';
      }
      
      return { impact, likelihood, count, bgColor, textColor, score, hoverRing };
    });
  });

  return (
    <div className="flex flex-col items-center py-4">
      <div className="flex gap-3">
        {/* Y-Axis */}
        <div className="flex items-center gap-2">
            <div className="text-xs font-bold text-slate-400 -rotate-90 whitespace-nowrap tracking-wider">IMPACT</div>
            <div className="flex flex-col justify-between h-[250px] py-3 text-xs font-medium text-slate-500">
                <span>5</span>
                <span>4</span>
                <span>3</span>
                <span>2</span>
                <span>1</span>
            </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-5 gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100 shadow-inner">
          {grid.map((row, i) => (
            row.map((cell, j) => (
              <div 
                key={`${i}-${j}`} 
                className={`
                  w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg text-sm font-bold transition-all duration-200 relative
                  ${cell.bgColor} 
                  ${cell.count > 0 ? 'opacity-100 shadow-sm' : 'opacity-20 hover:opacity-100'}
                  hover:scale-110 hover:z-10 hover:ring-2 ring-offset-2 ring-offset-white cursor-pointer ${cell.hoverRing}
                `}
                title={`Impact: ${cell.impact}, Likelihood: ${cell.likelihood} (Score: ${cell.score})`}
              >
                {cell.count > 0 && <span className={cell.textColor}>{cell.count}</span>}
                {cell.count === 0 && <span className="text-[10px] text-slate-500 opacity-0 hover:opacity-100">0</span>}
              </div>
            ))
          ))}
        </div>
      </div>

      {/* X-Axis */}
      <div className="flex flex-col items-center mt-2 ml-8">
         <div className="flex gap-1.5 px-2 w-full justify-between mb-1">
             {[1, 2, 3, 4, 5].map(n => (
                 <div key={n} className="w-10 sm:w-12 text-center text-xs font-medium text-slate-500">{n}</div>
             ))}
         </div>
         <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">LIKELIHOOD</div>
      </div>
    </div>
  );
};

const ProjectRiskDashboard: React.FC = () => {
  const sortedRisks = [...SYSTEM_RISKS].sort((a, b) => b.score - a.score);
  
  const highRiskCount = SYSTEM_RISKS.filter(r => r.level === 'High').length;
  const mediumRiskCount = SYSTEM_RISKS.filter(r => r.level === 'Medium').length;
  const avgScore = (SYSTEM_RISKS.reduce((acc, r) => acc + r.score, 0) / SYSTEM_RISKS.length).toFixed(1);

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold mb-1">RiGoPA System Implementation Risks</h2>
            <p className="text-slate-400 text-sm">City Council Project Risk Assessment Matrix</p>
          </div>
          <div className="hidden md:flex gap-4">
             <div className="text-center">
                <p className="text-2xl font-bold text-red-400">{highRiskCount}</p>
                <p className="text-xs text-slate-400 uppercase">High Risks</p>
             </div>
             <div className="w-px bg-slate-700"></div>
             <div className="text-center">
                <p className="text-2xl font-bold text-amber-400">{mediumRiskCount}</p>
                <p className="text-xs text-slate-400 uppercase">Med Risks</p>
             </div>
             <div className="w-px bg-slate-700"></div>
             <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">{avgScore}</p>
                <p className="text-xs text-slate-400 uppercase">Avg Score</p>
             </div>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-20 w-60 h-60 bg-slate-700 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Matrix Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <Activity size={20} className="text-indigo-600" /> Risk Heatmap
          </h3>
          <RiskMatrix risks={SYSTEM_RISKS} />
          <div className="mt-6 flex gap-4 text-xs">
             <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> High (15-25)</span>
             <span className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-400 rounded-sm"></div> Med (8-14)</span>
             <span className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-400 rounded-sm"></div> Low (1-7)</span>
          </div>
        </div>

        {/* Bar Chart Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Risk Severity Ranking</h3>
          <div className="flex-1 h-64 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedRisks} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 25]} hide />
                <YAxis dataKey="category" type="category" width={150} tick={{fontSize: 11}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as SystemRisk;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded shadow-xl text-xs max-w-xs">
                          <p className="font-bold mb-1">{data.category}</p>
                          <p className="text-slate-300 mb-2">{data.description}</p>
                          <div className="flex justify-between border-t border-slate-700 pt-2">
                            <span>Score: {data.score}</span>
                            <span className={data.level === 'High' ? 'text-red-400' : 'text-amber-400'}>{data.level}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                  {sortedRisks.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.level === 'High' ? '#ef4444' : entry.level === 'Medium' ? '#f59e0b' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Plain Language Explanation for Bar Chart */}
          <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex gap-3">
             <div className="shrink-0 text-indigo-500 mt-0.5"><HelpCircle size={18} /></div>
             <div>
                <h4 className="font-bold text-indigo-900 text-xs uppercase tracking-wide mb-1">How to read this chart</h4>
                <p className="text-xs text-indigo-800 leading-relaxed">
                   This lists problems from biggest to smallest. <span className="font-bold text-red-600">Red</span> means "Action Needed Now". <span className="font-bold text-emerald-600">Green</span> means "Under Control".
                </p>
             </div>
          </div>
        </div>

      </div>

      {/* Bubble Chart & Detailed List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
             <h3 className="text-lg font-semibold text-slate-800 mb-2">Impact vs Likelihood</h3>
             <p className="text-xs text-slate-500 mb-4">Bubble size represents total Risk Score</p>
             <div className="flex-1 h-64 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                   <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                      <CartesianGrid />
                      <XAxis type="number" dataKey="likelihood" name="Likelihood" unit="" domain={[0, 6]} tickCount={6} label={{ value: 'Likelihood', position: 'bottom', fontSize: 12 }} />
                      <YAxis type="number" dataKey="impact" name="Impact" unit="" domain={[0, 6]} tickCount={6} label={{ value: 'Impact', angle: -90, position: 'insideLeft', fontSize: 12 }} />
                      <ZAxis type="number" dataKey="score" range={[100, 600]} name="Score" />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                             const data = payload[0].payload;
                             return (
                                <div className="bg-white border border-slate-200 p-2 rounded shadow text-xs">
                                   <p className="font-bold">{data.category}</p>
                                   <p>Score: {data.score}</p>
                                </div>
                             )
                          }
                          return null;
                      }} />
                      <Scatter name="Risks" data={SYSTEM_RISKS} fill="#6366f1">
                        {SYSTEM_RISKS.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.level === 'High' ? '#ef4444' : entry.level === 'Medium' ? '#f59e0b' : '#10b981'} />
                        ))}
                      </Scatter>
                   </ScatterChart>
                </ResponsiveContainer>
             </div>

             {/* Plain Language Explanation for Bubble Chart */}
             <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex gap-3">
                 <div className="shrink-0 text-indigo-500 mt-0.5"><HelpCircle size={18} /></div>
                 <div>
                    <h4 className="font-bold text-indigo-900 text-xs uppercase tracking-wide mb-1">How to read this chart</h4>
                    <p className="text-xs text-indigo-800 leading-relaxed">
                       Think of this as a map. <br/>
                       <strong>Top-Right</strong> = High Danger (Likely to happen & Big Impact). <br/>
                       <strong>Bottom-Left</strong> = Low Danger (Unlikely & Small Impact).
                    </p>
                 </div>
             </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden lg:col-span-2 flex flex-col">
              <div className="p-6 border-b border-slate-200">
                 <h3 className="text-lg font-semibold text-slate-800">Risk Mitigation Register</h3>
              </div>
              <div className="overflow-y-auto max-h-[400px]">
                 <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-900 font-semibold sticky top-0">
                       <tr>
                          <th className="px-6 py-3">Category</th>
                          <th className="px-6 py-3">Mitigation Strategy</th>
                          <th className="px-6 py-3">Level</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {sortedRisks.map(risk => (
                          <tr key={risk.id} className="hover:bg-slate-50">
                             <td className="px-6 py-4">
                                <p className="font-medium text-slate-800">{risk.category}</p>
                                <p className="text-xs text-slate-500 mt-1">{risk.description}</p>
                             </td>
                             <td className="px-6 py-4">
                                <div className="flex items-start gap-2">
                                   <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                                   <span className="text-slate-700">{risk.mitigation}</span>
                                </div>
                             </td>
                             <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                   risk.level === 'High' ? 'bg-red-100 text-red-700' :
                                   risk.level === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                   'bg-emerald-100 text-emerald-700'
                                }`}>
                                   {risk.level}
                                </span>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
          </div>
      </div>

      {/* NEW SECTION: Simplified Risk Concepts Guide */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
             <Info className="text-indigo-600" size={24} />
             <h3 className="text-lg font-bold text-slate-800">Simple Guide to Risk Terms</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h4 className="font-bold text-slate-700 mb-2 text-sm uppercase">1. Severity Ranking (Traffic Lights)</h4>
                <p className="text-xs text-slate-500 mb-3">We use colors to show how worried you should be:</p>
                <ul className="space-y-3">
                   <li className="flex items-start gap-3">
                      <div className="mt-1 w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-700 text-sm block">Low (Green)</span>
                        <p className="text-xs text-slate-500">Safe. No immediate action needed. Just keep an eye on it.</p>
                      </div>
                   </li>
                   <li className="flex items-start gap-3">
                      <div className="mt-1 w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-700 text-sm block">Medium (Amber)</span>
                        <p className="text-xs text-slate-500">Caution. Something might go wrong. Plan for it.</p>
                      </div>
                   </li>
                   <li className="flex items-start gap-3">
                      <div className="mt-1 w-3 h-3 rounded-full bg-red-500 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-700 text-sm block">High (Red)</span>
                        <p className="text-xs text-slate-500">Danger. Needs immediate fixing or strong protection.</p>
                      </div>
                   </li>
                </ul>
             </div>

             <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h4 className="font-bold text-slate-700 mb-2 text-sm uppercase">2. Impact vs. Likelihood</h4>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                   We measure risk by asking two simple questions to place it on the map:
                </p>
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg font-bold text-xs w-24 text-center shrink-0">Likelihood</div>
                      <p className="text-xs text-slate-600"><strong>"Will it happen?"</strong> <br/>(Rarely &rarr; Almost Certain)</p>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="bg-purple-100 text-purple-600 p-2 rounded-lg font-bold text-xs w-24 text-center shrink-0">Impact</div>
                      <p className="text-xs text-slate-600"><strong>"How bad is it?"</strong> <br/>(Annoying &rarr; Disaster)</p>
                   </div>
                   <div className="pt-2 border-t border-slate-200 mt-2">
                      <p className="text-xs text-slate-500 italic">
                         A risk that is <strong>Very Likely</strong> to happen and has a <strong>Huge Impact</strong> is the most dangerous.
                      </p>
                   </div>
                </div>
             </div>
          </div>
       </div>

    </div>
  );
};

export default ProjectRiskDashboard;