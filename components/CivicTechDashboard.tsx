
import React, { useState, useRef, useEffect } from 'react';
import { Contract } from '../types';
import { Users, Building2, Leaf, MessageCircle, ArrowRight, CheckCircle2, Info, Bot, Send, X, Loader2, FileText, Download, AlertTriangle, MapPin, Activity, Calendar, DollarSign, ShieldCheck, Siren, ListTodo } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { chatWithCivicAI } from '../services/geminiService';

interface CivicTechDashboardProps {
  contracts: Contract[];
}

const CivicTechDashboard: React.FC<CivicTechDashboardProps> = ({ contracts }) => {
  // Show 'Legal Review' and 'Pending Approval' as "In Planning" for transparency
  // We exclude 'Draft' as those are internal working documents
  const publicContracts = contracts.filter(c => c.status !== 'Draft');
  
  const totalInvestment = publicContracts.reduce((acc, c) => acc + c.value, 0);
  
  // Calculate a "Transparency Score" based on data completeness
  const transparencyScore = Math.round(
    (publicContracts.reduce((acc, c) => {
      let points = 0;
      if (c.title) points += 1;
      if (c.value > 0) points += 1;
      if (c.startDate && c.endDate) points += 1;
      if (c.clauses.length > 0) points += 1;
      return acc + points;
    }, 0) / (publicContracts.length * 4)) * 100
  ) || 0;

  // Identify Alerts
  const overdueContracts = publicContracts.filter(c => {
      // Logic for overdue: Has a risk reason including "overdue" or "timeline exceeded"
      return c.riskAnalysis?.reasons.some(r => r.toLowerCase().includes('overdue') || r.toLowerCase().includes('timeline exceeded'));
  });

  const highRiskContracts = publicContracts.filter(c => (c.riskAnalysis?.score || 0) > 50 && !overdueContracts.includes(c));
  
  const totalAlerts = overdueContracts.length + highRiskContracts.length;

  const projectsByType = publicContracts.reduce((acc: any, c) => {
     acc[c.type] = (acc[c.type] || 0) + 1;
     return acc;
  }, {});

  const chartData = Object.keys(projectsByType).map(key => ({
    name: key,
    count: projectsByType[key]
  }));

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
      { role: 'ai', text: "Hello! I'm the City Council AI Assistant. I can help you understand these public projects. Ask me about budgets, timelines, or specific contracts." }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Modal States
  const [showOpenDataModal, setShowOpenDataModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({ project: '', issue: 'delay', description: '' });
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim() || chatLoading) return;

      const userText = chatInput.trim();
      setMessages(prev => [...prev, { role: 'user', text: userText }]);
      setChatInput('');
      setChatLoading(true);

      const aiResponse = await chatWithCivicAI(publicContracts, userText);
      
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
      setChatLoading(false);
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setReportSubmitting(false);
      setReportSuccess(true);
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess(false);
        setReportForm({ project: '', issue: 'delay', description: '' });
      }, 2500);
    }, 1500);
  };

  // Helper: Friendly Status Labels
  const getCitizenStatus = (status: string) => {
    if (status === 'Legal Review' || status === 'Pending Approval') return { label: 'In Planning', color: 'bg-purple-100 text-purple-700', icon: <FileText size={14} /> };
    if (status === 'Active') return { label: 'In Progress', color: 'bg-emerald-100 text-emerald-700', icon: <Activity size={14} /> };
    if (status === 'Completed') return { label: 'Finished', color: 'bg-blue-100 text-blue-700', icon: <CheckCircle2 size={14} /> };
    return { label: status, color: 'bg-slate-100 text-slate-700', icon: <Info size={14} /> };
  };

  // Helper: Simple Description Generator based on title keywords
  const getSimpleDescription = (title: string, type: string) => {
    const t = title.toLowerCase();
    if (t.includes('infrastructure') || t.includes('upgrade') && t.includes('it')) return "Improving city computers and internet systems so public services run faster and more reliably.";
    if (t.includes('supplies') || t.includes('procurement')) return "Buying essential daily items like paper, pens, and desks for town hall staff.";
    if (t.includes('license') || t.includes('software')) return "Paying for the software programs that city staff use to do their jobs.";
    if (t.includes('cleaning') || t.includes('maintenance')) return "Keeping public buildings clean, safe, and in good repair.";
    if (t.includes('avenue') || t.includes('road') || t.includes('street')) return "Repairing roads and adding safety features like bike lanes or new crosswalks.";
    if (t.includes('school') || t.includes('education')) return "Upgrading facilities at local schools to ensure a safe and comfortable learning environment.";
    if (t.includes('bus') || t.includes('transport') || t.includes('trolley')) return "Purchasing new public transport vehicles to improve city transit capacity and comfort.";
    return `A contract to provide ${type} services to the city.`;
  };

  return (
    <div className="animate-fade-in space-y-8 max-w-6xl mx-auto relative min-h-screen pb-24">
      
      {/* Civic Header */}
      <div className="bg-gradient-to-r from-sky-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
         <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-3 mb-3">
                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                    <Users size={24} className="text-white" />
                </div>
                <span className="font-bold tracking-wider uppercase text-sm text-sky-100">Citizen Portal</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">Tracking Public Money, Together.</h1>
            <p className="text-sky-100 text-lg leading-relaxed">
               Welcome to the Open Council Monitor. We believe in radical transparency. 
               See exactly how public funds are being spent, track project progress, and ask questions.
            </p>
         </div>
         {/* Abstract City Illustration Background */}
         <div className="absolute right-0 bottom-0 opacity-10">
             <Building2 size={300} />
         </div>
      </div>

      {/* Community Alerts Banner - AUTOMATED */}
      {totalAlerts > 0 && (
          <div className="bg-white rounded-xl border-l-4 border-red-500 shadow-md p-6 animate-pulse-slow">
              <div className="flex items-start gap-4">
                  <div className="bg-red-100 text-red-600 p-2 rounded-full mt-1">
                      <Siren size={24} />
                  </div>
                  <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-1">Automated Community Alerts</h3>
                      <p className="text-slate-600 text-sm mb-3">
                          The system has automatically flagged <strong>{totalAlerts} projects</strong> requiring attention. 
                          These alerts are generated based on real-time data analysis of timelines and contracts.
                      </p>
                      <div className="flex flex-wrap gap-2">
                          {overdueContracts.map(c => (
                              <span key={c.id} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200">
                                  <AlertTriangle size={12} /> {c.title}: Delayed / Overdue
                              </span>
                          ))}
                          {highRiskContracts.map(c => (
                              <span key={c.id} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200">
                                  <Activity size={12} /> {c.title}: High Risk Flag
                              </span>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Key Metrics for Citizens */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
             <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full">
                <Leaf size={28} />
             </div>
             <div>
                <p className="text-slate-500 text-sm font-medium uppercase">Total Public Investment</p>
                <h3 className="text-3xl font-bold text-slate-800">${totalInvestment.toLocaleString()}</h3>
             </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
             <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
                <Building2 size={28} />
             </div>
             <div>
                <p className="text-slate-500 text-sm font-medium uppercase">Active Public Projects</p>
                <h3 className="text-3xl font-bold text-slate-800">{publicContracts.length}</h3>
             </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
             <div className="p-4 bg-purple-50 text-purple-600 rounded-full">
                <CheckCircle2 size={28} />
             </div>
             <div>
                <p className="text-slate-500 text-sm font-medium uppercase">Data Transparency Score</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-slate-800">{transparencyScore}%</h3>
                    <span className="text-sm text-slate-400">Open Data</span>
                </div>
             </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Project List */}
         <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Recent Public Projects</h2>
                <button 
                  onClick={() => setShowOpenDataModal(true)}
                  className="text-sky-600 font-medium text-sm flex items-center gap-1 hover:underline"
                >
                    View All Data <ArrowRight size={16} />
                </button>
            </div>

            <div className="space-y-6">
                {publicContracts.length === 0 ? (
                    <div className="bg-slate-50 p-8 rounded-xl text-center text-slate-500">
                        No active public contracts visible at this time.
                    </div>
                ) : (
                    publicContracts.map(contract => {
                        const statusObj = getCitizenStatus(contract.status);
                        const isHighRisk = (contract.riskAnalysis?.score || 0) > 50;
                        const isOverdue = contract.riskAnalysis?.reasons.some(r => r.toLowerCase().includes('overdue'));
                        const isDateError = contract.riskAnalysis?.reasons.some(r => r.includes('date') || r.includes('timeline'));
                        const isValueRisk = contract.riskAnalysis?.reasons.some(r => r.includes('value'));

                        return (
                            <div key={contract.id} className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow group overflow-hidden ${isOverdue ? 'border-red-200' : 'border-slate-200'}`}>
                                {/* Card Header */}
                                <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="inline-block px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wide">
                                                {contract.type}
                                            </span>
                                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border border-transparent ${statusObj.color}`}>
                                                {statusObj.icon} {statusObj.label}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
                                            {contract.title}
                                        </h3>
                                    </div>
                                    <div className={`px-3 py-1.5 rounded-lg flex items-center gap-2 border ${
                                        isOverdue ? 'bg-red-100 text-red-700 border-red-200' :
                                        isHighRisk ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                                        'bg-emerald-50 text-emerald-700 border-emerald-100'
                                    }`}>
                                        {isOverdue ? <Siren size={16} className="animate-pulse" /> : isHighRisk ? <AlertTriangle size={16} /> : <ShieldCheck size={16} />}
                                        <span className="text-xs font-bold uppercase">
                                            {isOverdue ? 'Alert: Overdue' : isHighRisk ? 'Needs Attention' : 'Healthy'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="p-5 space-y-5">
                                    {/* What is this? Section */}
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">What is this project?</h4>
                                        <p className="text-slate-700 text-sm leading-relaxed">
                                            {getSimpleDescription(contract.title, contract.type)}
                                        </p>
                                    </div>

                                    {/* Project Details Grid */}
                                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                        <div>
                                            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                                                <DollarSign size={14} />
                                                <span className="text-[10px] uppercase font-bold">Cost</span>
                                            </div>
                                            <p className="text-slate-800 font-semibold text-sm">${contract.value.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                                                <Calendar size={14} />
                                                <span className="text-[10px] uppercase font-bold">Timeline</span>
                                            </div>
                                            <p className="text-slate-800 font-semibold text-sm">Until {contract.endDate}</p>
                                        </div>
                                    </div>

                                    {/* Citizen Definition of Done Checklist */}
                                    <div className="border-t border-slate-100 pt-4">
                                       <div className="flex items-center gap-2 mb-3">
                                           <ListTodo size={16} className="text-sky-600" />
                                           <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Is it Done Right? (Agile Check)</h4>
                                       </div>
                                       <div className="flex flex-wrap gap-4">
                                            {/* Budget Check */}
                                            <div className="flex items-center gap-2">
                                                {isValueRisk ? <X size={16} className="text-red-500" /> : <CheckCircle2 size={16} className="text-emerald-500" />}
                                                <span className={`text-xs font-medium ${isValueRisk ? 'text-red-700' : 'text-emerald-700'}`}>
                                                    Budget Approved
                                                </span>
                                            </div>

                                            {/* Timeline Check */}
                                            <div className="flex items-center gap-2">
                                                {(isOverdue || isDateError) ? <X size={16} className="text-red-500" /> : <CheckCircle2 size={16} className="text-emerald-500" />}
                                                <span className={`text-xs font-medium ${(isOverdue || isDateError) ? 'text-red-700' : 'text-emerald-700'}`}>
                                                    Timeline on Track
                                                </span>
                                            </div>

                                            {/* Rules/Compliance Check */}
                                            <div className="flex items-center gap-2">
                                                {isHighRisk ? <X size={16} className="text-amber-500" /> : <CheckCircle2 size={16} className="text-emerald-500" />}
                                                <span className={`text-xs font-medium ${isHighRisk ? 'text-amber-700' : 'text-emerald-700'}`}>
                                                    Rules Followed
                                                </span>
                                            </div>
                                       </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
         </div>

         {/* Side Widgets */}
         <div className="space-y-6">
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">City Spending Breakdown</h3>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis dataKey="name" hide />
                            <Tooltip cursor={{fill: '#f1f5f9'}} />
                            <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#38bdf8', '#818cf8', '#34d399', '#f472b6'][index % 4]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                    {chartData.map((d, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-slate-500">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#38bdf8', '#818cf8', '#34d399', '#f472b6'][i % 4] }}></div>
                            {d.name}
                        </div>
                    ))}
                </div>
             </div>

             <div className="bg-gradient-to-br from-indigo-900 to-slate-800 p-6 rounded-xl text-white shadow-lg">
                 <h3 className="text-lg font-bold mb-2">Get Involved</h3>
                 <p className="text-slate-300 text-sm mb-4">You have a right to know how your city works. Download the raw data or flag an issue.</p>
                 <div className="space-y-3">
                     <button 
                        onClick={() => setShowOpenDataModal(true)}
                        className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 transition-colors py-2 rounded-lg text-sm font-medium"
                     >
                         <Download size={16} /> Download Open Data
                     </button>
                     <button 
                        onClick={() => setShowReportModal(true)}
                        className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 transition-colors py-2 rounded-lg text-sm font-medium text-white shadow-sm"
                     >
                         <AlertTriangle size={16} /> Submit Citizen Report
                     </button>
                 </div>
             </div>

             <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl">
                 <div className="flex gap-3">
                     <Info className="text-sky-600 shrink-0" size={20} />
                     <p className="text-xs text-sky-800 leading-relaxed">
                         <strong>Did you know?</strong> Every project here is checked against a "Definition of Done" list to ensure it meets safety, budget, and legal standards before being marked as finished.
                     </p>
                 </div>
             </div>
         </div>
      </div>

      {/* Floating AI Chatbot */}
      <div className={`fixed bottom-6 right-6 z-40 transition-all duration-300 flex flex-col items-end ${isChatOpen ? 'w-80 sm:w-96' : 'w-auto'}`}>
         {isChatOpen && (
             <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full mb-4 overflow-hidden flex flex-col h-[450px] animate-fade-in-up">
                 {/* Chat Header */}
                 <div className="bg-sky-600 p-4 text-white flex justify-between items-center">
                     <div className="flex items-center gap-2">
                         <div className="bg-white/20 p-1.5 rounded-lg">
                             <Bot size={20} />
                         </div>
                         <div>
                             <h3 className="font-bold text-sm">City Assistant</h3>
                             <p className="text-[10px] text-sky-100 flex items-center gap-1">
                                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span> Online
                             </p>
                         </div>
                     </div>
                     <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-1 rounded-md transition-colors">
                         <X size={18} />
                     </button>
                 </div>

                 {/* Messages */}
                 <div className="flex-1 bg-slate-50 p-4 overflow-y-auto space-y-4">
                     {messages.map((m, i) => (
                         <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                             <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                                 m.role === 'user' 
                                 ? 'bg-sky-600 text-white rounded-br-none' 
                                 : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                             }`}>
                                 {m.text}
                             </div>
                         </div>
                     ))}
                     {chatLoading && (
                         <div className="flex justify-start">
                             <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                                 <Loader2 size={14} className="animate-spin text-sky-600" />
                                 <span className="text-xs text-slate-400">Thinking...</span>
                             </div>
                         </div>
                     )}
                     <div ref={messagesEndRef} />
                 </div>

                 {/* Input */}
                 <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                     <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask about budgets or projects..."
                        className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                     />
                     <button 
                        type="submit" 
                        disabled={!chatInput.trim() || chatLoading}
                        className="bg-sky-600 text-white p-2 rounded-full hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                         <Send size={18} />
                     </button>
                 </form>
             </div>
         )}
         <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="bg-sky-600 hover:bg-sky-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
         >
            {isChatOpen ? <X size={24} /> : <MessageCircle size={24} />}
            {!isChatOpen && <span className="font-bold pr-2">Ask City AI</span>}
         </button>
      </div>

      {/* MODAL: Open Data */}
      {showOpenDataModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                          <Download className="text-sky-600" size={20} />
                          <h3 className="font-bold text-slate-800">Open Data Portal</h3>
                      </div>
                      <button onClick={() => setShowOpenDataModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <p className="text-sm text-slate-600 leading-relaxed">
                          We provide all non-sensitive contract data in standard formats (CSV, JSON) for researchers, journalists, and citizens.
                      </p>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                          <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-slate-700">All_Contracts_2025.csv</span>
                              <span className="text-xs text-slate-400">1.2 MB</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-slate-700">Risk_Analysis_Report.json</span>
                              <span className="text-xs text-slate-400">0.8 MB</span>
                          </div>
                      </div>
                      <button 
                        onClick={() => {
                            // Simulate download
                            alert("Download started: RiGoPA_Public_Data.csv");
                            setShowOpenDataModal(false);
                        }}
                        className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
                      >
                          Download Dataset
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL: Submit Report */}
      {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                          <AlertTriangle className="text-amber-500" size={20} />
                          <h3 className="font-bold text-slate-800">Submit Citizen Report</h3>
                      </div>
                      <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                  </div>
                  
                  {reportSuccess ? (
                      <div className="p-8 text-center animate-fade-in">
                          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                              <CheckCircle2 size={32} />
                          </div>
                          <h3 className="text-xl font-bold text-slate-800 mb-2">Report Submitted</h3>
                          <p className="text-slate-500 text-sm">Thank you for helping us monitor public projects. Your report ID is <span className="font-mono text-slate-800">#CR-{Math.floor(Math.random() * 10000)}</span>.</p>
                      </div>
                  ) : (
                      <form onSubmit={handleSubmitReport} className="p-6 space-y-4">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Select Project</label>
                              <select 
                                required
                                value={reportForm.project}
                                onChange={(e) => setReportForm({...reportForm, project: e.target.value})}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                              >
                                  <option value="">-- Select a project --</option>
                                  {publicContracts.map(c => (
                                      <option key={c.id} value={c.title}>{c.title}</option>
                                  ))}
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Issue Type</label>
                              <div className="grid grid-cols-2 gap-2">
                                  {['Delay', 'Budget', 'Quality', 'Other'].map(type => (
                                      <button
                                        type="button"
                                        key={type}
                                        onClick={() => setReportForm({...reportForm, issue: type.toLowerCase()})}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                                            reportForm.issue === type.toLowerCase() 
                                            ? 'bg-sky-50 border-sky-500 text-sky-700' 
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                      >
                                          {type}
                                      </button>
                                  ))}
                              </div>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                              <textarea 
                                required
                                rows={3}
                                value={reportForm.description}
                                onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                                placeholder="What did you observe?"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-none"
                              />
                          </div>
                          <button 
                            type="submit"
                            disabled={reportSubmitting}
                            className="w-full bg-sky-600 text-white py-3 rounded-lg font-medium hover:bg-sky-700 transition-colors flex items-center justify-center gap-2"
                          >
                              {reportSubmitting && <Loader2 size={16} className="animate-spin" />}
                              {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                          </button>
                      </form>
                  )}
              </div>
          </div>
      )}

    </div>
  );
};

export default CivicTechDashboard;
