
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Contract, ContractFormData, AuditLogEntry, PolicyCheck, ContractType, ContractStatus } from './types';
import { calculateDeterministicRisk, evaluatePolicyCompliance, evaluateDecentralizationSteps } from './services/riskEngine';
import { analyzeContractWithGemini } from './services/geminiService';
import { parseImportFile } from './services/importService';
import Dashboard from './components/Dashboard';
import ContractForm from './components/ContractForm';
import ProjectRiskDashboard from './components/ProjectRiskDashboard';
import DecentralizationFormula from './components/DecentralizationFormula';
import CivicTechDashboard from './components/CivicTechDashboard';
import { LayoutDashboard, PlusCircle, FileText, AlertTriangle, ChevronRight, BrainCircuit, ArrowUpDown, ArrowUp, ArrowDown, History, CheckCircle2, XCircle, AlertCircle, Clock, Upload, Loader2, X, Filter, ListTodo, ShieldAlert, Activity, Network, Database, Layers, Edit2, RotateCcw, FileCode, ShoppingBag, BookOpen, Shield, Key, Briefcase, Users, RefreshCw, Sparkles } from 'lucide-react';

// Initial data from the user's JSON provided in the prompt, enriched with new fields
const INITIAL_DATA: Contract[] = [
  {
    id: '1',
    title: "IT Infrastructure Upgrade",
    type: 'SOW',
    status: 'Legal Review',
    value: 150000,
    startDate: "2025-09-01",
    endDate: "2025-08-01",
    clauses: ["manual modifications", "no termination clause"],
    riskAnalysis: {
      score: 75,
      reasons: ["High contract value", "Missing termination clause", "Manual contract edits detected", "Start date after end date"],
      aiAnalysis: "The dates are invalid (Start > End). Combined with missing termination clauses and high value, this poses a severe operational risk."
    },
    auditLog: [
      { id: 'log-1', date: '2025-05-10 09:00', action: 'Contract Drafted', user: 'System Import', version: 1 },
      { id: 'log-2', date: '2025-05-10 09:05', action: 'Early Risk Check', user: 'RiskEngine v1', details: 'Risk score calculated at 75 (High).', version: 1 },
      { id: 'log-3', date: '2025-05-10 14:20', action: 'DoD Check Failed', user: 'Compliance Bot', details: 'Delegation of Authority policy violation detected.', version: 1 }
    ],
    policyChecks: [
       { id: 'pol-1', policyName: 'Delegation of Authority', status: 'warning', details: 'Value > $50k requires VP Approval.' },
       { id: 'pol-2', policyName: 'GDPR & Data Privacy', status: 'violation', details: 'Missing Data Processing Addendum in SOW.' }
    ],
    decentralizationSteps: [
       { id: 'good-data', label: 'Good Data', status: 'Pass', description: 'Structured data is complete and accessible.' },
       { id: 'early-warnings', label: 'Early Warnings', status: 'Flagged', description: 'System detected High Risk (75). Local alert active.' },
       { id: 'portable-clarity', label: 'Portable Clarity', status: 'Flagged', description: 'Custom language detected. Manual review required.' },
       { id: 'decentralized-checks', label: 'Decentralized Checks', status: 'Flagged', description: '1 blocking policy violation detected.' }
    ],
    version: 1,
    previousVersions: []
  },
  {
    id: '2',
    title: "Town Hall Office Supplies Procurement",
    type: 'PO',
    status: 'Active',
    value: 25000,
    startDate: "2025-07-01",
    endDate: "2025-12-01",
    clauses: ["standard format", "net 30", "delivery to town hall"],
    riskAnalysis: {
      score: 0,
      reasons: [],
      aiAnalysis: "Low risk standard procurement contract for municipal administration."
    },
    auditLog: [
       { id: 'log-1', date: '2025-06-01 10:00', action: 'Contract Drafted', user: 'System Import', version: 1 },
       { id: 'log-2', date: '2025-06-01 10:01', action: 'DoD Check Passed', user: 'PolicyEngine', details: 'All automated checks passed successfully.', version: 1 }
    ],
    policyChecks: [
       { id: 'pol-1', policyName: 'Delegation of Authority', status: 'compliant', details: 'Within standard limits.' },
       { id: 'pol-2', policyName: 'Standard Payment Terms', status: 'compliant', details: 'Net 30 terms present.' }
    ],
    decentralizationSteps: [
        { id: 'good-data', label: 'Good Data', status: 'Pass', description: 'Structured data is complete.' },
        { id: 'early-warnings', label: 'Early Warnings', status: 'Pass', description: 'Risk analysis active. No thresholds breached.' },
        { id: 'portable-clarity', label: 'Portable Clarity', status: 'Pass', description: 'Standard templates used.' },
        { id: 'decentralized-checks', label: 'Decentralized Checks', status: 'Pass', description: 'All local checks passed.' }
    ],
    version: 1,
    previousVersions: []
  },
  {
    id: '3',
    title: "Main Avenue Resurfacing & Bike Lanes",
    type: 'SOW',
    status: 'Pending Approval',
    value: 1200000,
    startDate: "2026-03-01",
    endDate: "2026-09-30",
    clauses: ["standard liability", "milestone payments", "weather contingency", "public safety protocols"],
    riskAnalysis: {
        score: 35,
        reasons: ["High contract value", "Weather dependency"],
        aiAnalysis: "Moderate risk due to high value and external factors (weather). Standard terms present, but public disruption requires communication plan."
    },
    auditLog: [
        { id: 'log-1', date: '2025-08-15 08:30', action: 'Contract Drafted', user: 'Public Works', version: 1 },
        { id: 'log-2', date: '2025-08-15 08:35', action: 'Early Risk Check', user: 'RiskEngine', details: 'Risk Score: 35 (Medium)', version: 1 }
    ],
    policyChecks: [
        { id: 'pol-1', policyName: 'Delegation of Authority', status: 'warning', details: 'Value > $1M requires City Council Vote.' },
        { id: 'pol-3', policyName: 'Standard Payment Terms', status: 'compliant', details: 'Milestone payments defined.' }
    ],
    decentralizationSteps: [
        { id: 'good-data', label: 'Good Data', status: 'Pass', description: 'Structured data is complete.' },
        { id: 'early-warnings', label: 'Early Warnings', status: 'Pass', description: 'Medium risk identified, within tolerance.' },
        { id: 'portable-clarity', label: 'Portable Clarity', status: 'Pass', description: 'Standard Public Works template used.' },
        { id: 'decentralized-checks', label: 'Decentralized Checks', status: 'Pending', description: 'Council vote pending.' }
    ],
    version: 1,
    previousVersions: []
  },
  {
    id: '4',
    title: "Central School Heating System Upgrade",
    type: 'Service Agreement',
    status: 'Completed',
    value: 450000,
    startDate: "2025-06-01",
    endDate: "2025-08-31",
    clauses: ["warranty 5 years", "performance guarantee", "standard format", "safety compliance"],
    riskAnalysis: {
        score: 15,
        reasons: ["Tight timeline (Summer break)"],
        aiAnalysis: "Low financial risk, but operational timeline is critical for school opening. Performance guarantees are robust."
    },
    auditLog: [
        { id: 'log-1', date: '2025-04-01 11:00', action: 'Contract Signed', user: 'Education Dept', version: 1 },
        { id: 'log-2', date: '2025-09-01 09:00', action: 'Project Completed', user: 'System', details: 'Marked as completed on time.', version: 1 }
    ],
    policyChecks: [
        { id: 'pol-1', policyName: 'Delegation of Authority', status: 'compliant', details: 'Approved by School Board.' },
        { id: 'pol-2', policyName: 'Safety Standards', status: 'compliant', details: 'Safety compliance clauses present.' }
    ],
    decentralizationSteps: [
        { id: 'good-data', label: 'Good Data', status: 'Pass', description: 'All metadata verified.' },
        { id: 'early-warnings', label: 'Early Warnings', status: 'Pass', description: 'No alerts.' },
        { id: 'portable-clarity', label: 'Portable Clarity', status: 'Pass', description: 'Standard format used.' },
        { id: 'decentralized-checks', label: 'Decentralized Checks', status: 'Pass', description: 'Final inspection passed.' }
    ],
    version: 1,
    previousVersions: []
  },
  {
    id: '5',
    title: "Acquisition of 10 Electric Trolleybuses",
    type: 'PO',
    status: 'Legal Review',
    value: 5500000,
    startDate: "2025-10-01",
    endDate: "2026-10-01",
    clauses: ["international shipping", "customs duties", "manual modifications", "no termination clause"],
    riskAnalysis: {
        score: 65,
        reasons: ["High contract value", "Manual contract edits detected", "Missing termination clause"],
        aiAnalysis: "High risk acquisition. Manual edits to standard PO for high value requires deep legal review. Termination clauses missing."
    },
    auditLog: [
        { id: 'log-1', date: '2025-09-01 14:00', action: 'Contract Drafted', user: 'Transport Dept', version: 1 },
        { id: 'log-2', date: '2025-09-01 14:05', action: 'Early Risk Check', user: 'RiskEngine', details: 'Risk Score: 65 (High)', version: 1 }
    ],
    policyChecks: [
        { id: 'pol-1', policyName: 'Delegation of Authority', status: 'warning', details: 'Value > $5M requires Mayor approval.' },
        { id: 'pol-2', policyName: 'Sustainability Goals', status: 'compliant', details: 'Electric vehicles align with green policy.' }
    ],
    decentralizationSteps: [
        { id: 'good-data', label: 'Good Data', status: 'Pass', description: 'Data complete.' },
        { id: 'early-warnings', label: 'Early Warnings', status: 'Flagged', description: 'High financial risk signal.' },
        { id: 'portable-clarity', label: 'Portable Clarity', status: 'Flagged', description: 'Manual edits to PO template.' },
        { id: 'decentralized-checks', label: 'Decentralized Checks', status: 'Flagged', description: 'Legal review blockers identified.' }
    ],
    version: 1,
    previousVersions: []
  }
];

const CONTRACT_TYPES: ContractType[] = ['SOW', 'PO', 'MSA', 'NDA', 'Licensing', 'Service Agreement', 'TPH'];
const CONTRACT_STATUSES: ContractStatus[] = ['Draft', 'Legal Review', 'Pending Approval', 'Active', 'Completed', 'Terminated'];

type SortKey = keyof Contract | 'riskScore';
type RiskFilter = 'all' | 'low' | 'medium' | 'high';

export default function App() {
  const [view, setView] = useState<'dashboard' | 'form' | 'system-risks' | 'decentralization' | 'civic-tech'>('dashboard');
  const [contracts, setContracts] = useState<Contract[]>(INITIAL_DATA);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  
  // State for version viewing
  const [viewingVersionId, setViewingVersionId] = useState<string | null>(null);
  const [editingContractId, setEditingContractId] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Import State
  const [importState, setImportState] = useState<{ status: 'idle' | 'parsing' | 'processing' | 'error' | 'success', message?: string, progress?: number }>({ status: 'idle' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sorting and Filtering State
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [typeFilter, setTypeFilter] = useState<ContractType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'all'>('all');

  // Load data from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('rigopa_contracts_v5'); // Incremented version key
    if (stored) {
      setContracts(JSON.parse(stored));
    } else {
        localStorage.setItem('rigopa_contracts_v5', JSON.stringify(INITIAL_DATA));
    }
  }, []);

  const saveContracts = (newContracts: Contract[]) => {
    setContracts(newContracts);
    localStorage.setItem('rigopa_contracts_v5', JSON.stringify(newContracts));
  };

  const handleCreateContract = async (data: ContractFormData) => {
    setIsProcessing(true);
    
    const clausesArray = data.clauses.split('\n').map(s => s.trim()).filter(Boolean);
    const now = new Date();
    
    const newContract: Contract = {
      id: Date.now().toString(),
      title: data.title,
      type: data.type,
      status: 'Draft',
      value: data.value,
      startDate: data.startDate,
      endDate: data.endDate,
      clauses: clausesArray,
      version: 1,
      previousVersions: [],
      auditLog: [
        { 
          id: `log-${Date.now()}`, 
          date: now.toLocaleString(), 
          action: 'Contract Drafted', 
          user: 'Current User',
          details: 'Initial submission via form.',
          version: 1
        }
      ]
    };

    const processedContract = await processContractLogic(newContract, 'DoD & Risk Checks Run');
    
    saveContracts([processedContract, ...contracts]);
    setIsProcessing(false);
    setView('dashboard');
  };

  const handleUpdateContract = async (data: ContractFormData) => {
    if (!editingContractId) return;
    setIsProcessing(true);

    const existingContract = contracts.find(c => c.id === editingContractId);
    if (!existingContract) return;

    // 1. Create Snapshot of current state
    const snapshot = {
        version: existingContract.version,
        timestamp: new Date().toLocaleString(),
        data: JSON.parse(JSON.stringify(existingContract)), // Deep copy
        reason: 'Manual Update'
    };

    // 2. Prepare Updated Contract
    const clausesArray = data.clauses.split('\n').map(s => s.trim()).filter(Boolean);
    const nextVersion = existingContract.version + 1;
    
    const updatedContract: Contract = {
        ...existingContract,
        title: data.title,
        type: data.type,
        value: data.value,
        startDate: data.startDate,
        endDate: data.endDate,
        clauses: clausesArray,
        version: nextVersion,
        previousVersions: [...(existingContract.previousVersions || []), snapshot],
        auditLog: [
            ...existingContract.auditLog,
            {
                id: `log-${Date.now()}`,
                date: new Date().toLocaleString(),
                action: 'Version Update',
                user: 'Current User',
                details: `Updated from v${existingContract.version} to v${nextVersion}`,
                version: nextVersion
            }
        ]
    };

    // 3. Re-process logic (Risk, Policy, etc.)
    const processedContract = await processContractLogic(updatedContract, 'Re-evaluation (Update)');

    // 4. Save
    const updatedContractsList = contracts.map(c => c.id === editingContractId ? processedContract : c);
    saveContracts(updatedContractsList);
    
    setIsProcessing(false);
    setEditingContractId(null);
    setSelectedContract(processedContract); // Show the updated contract
    setView('dashboard');
  };

  const handleManualAIAnalysis = async () => {
    if (!selectedContract) return;
    setIsAnalyzing(true);
    
    try {
        const aiReview = await analyzeContractWithGemini(selectedContract);
        
        const updatedContract: Contract = {
            ...selectedContract,
            riskAnalysis: {
                ...selectedContract.riskAnalysis!,
                aiAnalysis: aiReview
            }
        };

        setSelectedContract(updatedContract);
        const updatedList = contracts.map(c => c.id === updatedContract.id ? updatedContract : c);
        saveContracts(updatedList);
    } catch (e) {
        console.error("Manual AI Analysis Failed", e);
    } finally {
        setIsAnalyzing(false);
    }
  };

  // Shared Logic for Risk/Policy/Gemini
  const processContractLogic = async (contract: Contract, logAction: string): Promise<Contract> => {
      // 1. Run Deterministic Logic
      const riskResult = calculateDeterministicRisk(contract);
      
      // 2. Run Policy Engine
      const policyResults = evaluatePolicyCompliance(contract);
  
      // 3. Run Gemini Analysis
      const aiReview = await analyzeContractWithGemini(contract);
  
      // Merge results
      contract.riskAnalysis = {
          ...riskResult,
          aiAnalysis: aiReview
      };
      contract.policyChecks = policyResults;
  
      // 4. Calculate Decentralization Steps
      contract.decentralizationSteps = evaluateDecentralizationSteps(contract, riskResult.score);
  
      contract.auditLog.push({
          id: `log-${Date.now() + 1}`,
          date: new Date().toLocaleString(),
          action: logAction,
          user: 'riGoPA Engine',
          details: `Risk Score: ${riskResult.score}. Policy Checks: ${policyResults.filter(p => p.status === 'compliant').length}/${policyResults.length} Passed.`,
          version: contract.version
      });
  
      if (riskResult.score > 50) {
          contract.status = 'Legal Review';
      } else {
          contract.status = 'Pending Approval';
      }

      return contract;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportState({ status: 'parsing', message: 'Reading file...' });

    try {
      const parsedData = await parseImportFile(file);
      setImportState({ status: 'processing', message: `Analyzing 0/${parsedData.length} contracts...`, progress: 0 });

      const newContracts: Contract[] = [];
      const now = new Date();

      for (let i = 0; i < parsedData.length; i++) {
        const data = parsedData[i];
        const clausesArray = data.clauses.split('\n').map(s => s.trim()).filter(Boolean);
        
        let newContract: Contract = {
          id: `imp-${Date.now()}-${i}`,
          title: data.title,
          type: data.type,
          status: 'Draft',
          value: data.value,
          startDate: data.startDate,
          endDate: data.endDate,
          clauses: clausesArray,
          version: 1,
          previousVersions: [],
          auditLog: [
            { id: `log-${Date.now()}-c`, date: now.toLocaleString(), action: 'Bulk Import', user: 'System Upload', version: 1 }
          ]
        };

        const riskResult = calculateDeterministicRisk(newContract);
        const policyResults = evaluatePolicyCompliance(newContract);

        newContract.riskAnalysis = {
          ...riskResult,
          aiAnalysis: "Imported via bulk upload. AI Analysis skipped for performance."
        };
        newContract.policyChecks = policyResults;
        newContract.decentralizationSteps = evaluateDecentralizationSteps(newContract, riskResult.score);

        newContract.auditLog.push({
            id: `log-${Date.now()}-r`,
            date: now.toLocaleString(),
            action: 'Auto-Risk Audit (Bulk)',
            user: 'riGoPA Engine',
            details: `Risk Score: ${riskResult.score}`,
            version: 1
        });

        if (riskResult.score > 50) {
            newContract.status = 'Legal Review';
        } else {
            newContract.status = 'Pending Approval';
        }

        newContracts.push(newContract);

        if (i % 5 === 0 || i === parsedData.length - 1) {
           setImportState({ 
             status: 'processing', 
             message: `Analyzing ${i + 1}/${parsedData.length} contracts...`, 
             progress: Math.round(((i + 1) / parsedData.length) * 100) 
           });
           await new Promise(r => setTimeout(r, 10));
        }
      }

      saveContracts([...newContracts, ...contracts]);
      setImportState({ status: 'success', message: `Successfully imported ${newContracts.length} contracts.` });
      setTimeout(() => setImportState({ status: 'idle' }), 3000);

    } catch (err: any) {
      setImportState({ status: 'error', message: err.message || "Import failed" });
      setTimeout(() => setImportState({ status: 'idle' }), 5000);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getRiskColor = (score: number) => {
    if (score > 50) return 'bg-red-100 text-red-800 border-red-200';
    if (score > 20) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
          case 'Legal Review': return 'bg-purple-100 text-purple-700 border-purple-200';
          case 'Draft': return 'bg-slate-100 text-slate-700 border-slate-200';
          case 'Pending Approval': return 'bg-blue-100 text-blue-700 border-blue-200';
          case 'Completed': return 'bg-blue-100 text-blue-700 border-blue-200';
          default: return 'bg-gray-100 text-gray-700 border-gray-200';
      }
  };

  const getLogStyle = (action: string) => {
    const lower = action.toLowerCase();
    if (lower.includes('draft') || lower.includes('create') || lower.includes('upload') || lower.includes('import')) return { color: 'bg-blue-100 text-blue-600 border-blue-200', icon: <FileText size={14} /> };
    if (lower.includes('version')) return { color: 'bg-indigo-100 text-indigo-600 border-indigo-200', icon: <History size={14} /> };
    if (lower.includes('risk') || lower.includes('dod') || lower.includes('check')) {
       if (lower.includes('failed') || lower.includes('high')) return { color: 'bg-red-100 text-red-600 border-red-200', icon: <AlertTriangle size={14} /> };
       if (lower.includes('passed') || lower.includes('low') || lower.includes('medium')) return { color: 'bg-emerald-100 text-emerald-600 border-emerald-200', icon: <CheckCircle2 size={14} /> };
       return { color: 'bg-amber-100 text-amber-600 border-amber-200', icon: <Activity size={14} /> };
    }
    if (lower.includes('approv') || lower.includes('signed') || lower.includes('complet')) return { color: 'bg-emerald-100 text-emerald-600 border-emerald-200', icon: <CheckCircle2 size={14} /> };
    return { color: 'bg-slate-100 text-slate-500 border-slate-200', icon: <Clock size={14} /> };
  };

  const getContractTypeIcon = (type: ContractType) => {
    switch (type) {
      case 'SOW': return <FileCode size={14} />;
      case 'PO': return <ShoppingBag size={14} />;
      case 'MSA': return <BookOpen size={14} />;
      case 'NDA': return <Shield size={14} />;
      case 'Licensing': return <Key size={14} />;
      case 'Service Agreement': return <Briefcase size={14} />;
      case 'TPH': return <Clock size={14} />;
      default: return <FileText size={14} />;
    }
  };

  const getContractTypeColor = (type: ContractType) => {
    switch (type) {
      case 'SOW': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PO': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'MSA': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'NDA': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Licensing': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Service Agreement': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'TPH': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredAndSortedContracts = useMemo(() => {
    let result = [...contracts];
    if (typeFilter !== 'all') result = result.filter(c => c.type === typeFilter);
    if (statusFilter !== 'all') result = result.filter(c => c.status === statusFilter);
    if (riskFilter !== 'all') {
      result = result.filter(c => {
        const score = c.riskAnalysis?.score || 0;
        if (riskFilter === 'high') return score > 50;
        if (riskFilter === 'medium') return score > 20 && score <= 50;
        if (riskFilter === 'low') return score <= 20;
        return true;
      });
    }
    if (sortConfig) {
      result.sort((a, b) => {
        let aVal: any = sortConfig.key === 'riskScore' ? a.riskAnalysis?.score || 0 : a[sortConfig.key] || '';
        let bVal: any = sortConfig.key === 'riskScore' ? b.riskAnalysis?.score || 0 : b[sortConfig.key] || '';
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [contracts, riskFilter, typeFilter, statusFilter, sortConfig]);

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ colKey }: { colKey: SortKey }) => {
    if (sortConfig?.key !== colKey) return <ArrowUpDown size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} className="text-indigo-600" />
      : <ArrowDown size={14} className="text-indigo-600" />;
  };

  const renderHeaderTitle = () => {
    if (view === 'civic-tech') return 'Citizen Portal';
    if (view === 'system-risks') return 'Project Risk Dashboard (City Council)';
    if (view === 'decentralization') return 'Decentralization Strategy';
    if (view === 'form') {
        return editingContractId ? 'Edit Contract Version' : 'New Contract Entry';
    }
    if (selectedContract) return 'Agile Contract Analysis';
    return 'Agile Dashboard';
  };

  // Helper to convert contract to form data for editing
  const getContractFormData = (c: Contract): ContractFormData => ({
      title: c.title,
      type: c.type,
      value: c.value,
      startDate: c.startDate,
      endDate: c.endDate,
      clauses: c.clauses.join('\n')
  });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      
      {/* Import Overlay / Toast */}
      {importState.status !== 'idle' && (
        <div className="absolute top-4 right-4 z-50 animate-fade-in-up">
           <div className={`flex items-center gap-3 p-4 rounded-lg shadow-lg border border-slate-200 max-w-sm ${
             importState.status === 'error' ? 'bg-red-50 text-red-800' :
             importState.status === 'success' ? 'bg-emerald-50 text-emerald-800' :
             'bg-white text-slate-800'
           }`}>
              {importState.status === 'processing' || importState.status === 'parsing' ? (
                <Loader2 className="animate-spin text-indigo-600" size={24} />
              ) : importState.status === 'success' ? (
                <CheckCircle2 className="text-emerald-500" size={24} />
              ) : (
                <AlertTriangle className="text-red-500" size={24} />
              )}
              <div className="flex-1">
                 <p className="font-medium text-sm">{importState.message}</p>
                 {importState.status === 'processing' && (
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                       <div className="bg-indigo-600 h-1.5 transition-all duration-300" style={{ width: `${importState.progress}%` }}></div>
                    </div>
                 )}
              </div>
              {importState.status === 'error' && (
                <button onClick={() => setImportState({ status: 'idle' })} className="text-red-400 hover:text-red-600">
                    <X size={16} />
                </button>
              )}
           </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <BrainCircuit size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">RiGoPA</h1>
          </div>
          <p className="text-xs text-slate-500 mt-2">Risk Governance for Public Administration</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 mt-2">Internal Tools</p>
          <button 
            onClick={() => { setView('dashboard'); setSelectedContract(null); setEditingContractId(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'dashboard' && !selectedContract ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <LayoutDashboard size={18} />
            Contract Analysis
          </button>

          <button 
            onClick={() => { setView('system-risks'); setSelectedContract(null); setEditingContractId(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'system-risks' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <ShieldAlert size={18} />
            System Risks
          </button>

          <button 
            onClick={() => { setView('decentralization'); setSelectedContract(null); setEditingContractId(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'decentralization' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <Network size={18} />
            Decentralization Formula
          </button>
          
          <button 
            onClick={() => { setView('form'); setSelectedContract(null); setEditingContractId(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'form' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <PlusCircle size={18} />
            New Contract
          </button>

          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 mt-6">Public Facing</p>
          <button 
            onClick={() => { setView('civic-tech'); setSelectedContract(null); setEditingContractId(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'civic-tech' ? 'bg-sky-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <Users size={18} />
            Citizen Portal (CivicTech)
          </button>

          <div className="pt-4 border-t border-slate-800 mt-4">
            <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Data Management</p>
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-slate-800 text-slate-400 hover:text-white"
            >
                <Upload size={18} />
                Import Data
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".json,.csv" onChange={handleFileUpload} />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
            <p>Contracts Done Right & On Time</p>
            <p className="mt-1 opacity-50">v4.2 (New Projects)</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-8 py-4 flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">
                    {renderHeaderTitle()}
                </h2>
                {viewingVersionId && selectedContract && (
                  <div className="flex items-center gap-2 mt-1 text-amber-600 bg-amber-50 px-3 py-1 rounded text-xs font-bold w-fit">
                    <History size={12} />
                    Viewing Historical Version (Read-Only)
                  </div>
                )}
            </div>
            {view === 'dashboard' && !selectedContract && (
                <div className="flex items-center gap-2 md:hidden">
                    <button onClick={() => fileInputRef.current?.click()} className="bg-slate-100 text-slate-600 p-2 rounded-lg"><Upload size={20} /></button>
                    <button onClick={() => setView('form')} className="bg-indigo-600 text-white p-2 rounded-lg"><PlusCircle size={20} /></button>
                </div>
            )}
        </header>

        <div className="p-8">
            {view === 'civic-tech' && <CivicTechDashboard contracts={contracts} />}
            {view === 'system-risks' && <ProjectRiskDashboard />}
            {view === 'decentralization' && <DecentralizationFormula />}

            {view === 'form' && (
                <ContractForm 
                    onSubmit={editingContractId ? handleUpdateContract : handleCreateContract} 
                    onCancel={() => { setView('dashboard'); setEditingContractId(null); }} 
                    isProcessing={isProcessing}
                    initialData={editingContractId && contracts.find(c => c.id === editingContractId) ? getContractFormData(contracts.find(c => c.id === editingContractId)!) : undefined}
                />
            )}

            {view === 'dashboard' && !selectedContract && (
                <>
                    <Dashboard contracts={contracts} />
                    <div className="mt-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <h3 className="font-semibold text-slate-800">Recent Contracts</h3>
                            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                              {/* Type Filter */}
                              <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500"><Filter size={14} /></div>
                                <select 
                                  value={typeFilter}
                                  onChange={(e) => setTypeFilter(e.target.value as ContractType | 'all')}
                                  className="appearance-none bg-white border border-slate-300 text-slate-700 py-1.5 pl-9 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                >
                                  <option value="all">All Types</option>
                                  {CONTRACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                              </div>

                              {/* Status Filter */}
                              <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500"><Clock size={14} /></div>
                                <select 
                                  value={statusFilter}
                                  onChange={(e) => setStatusFilter(e.target.value as ContractStatus | 'all')}
                                  className="appearance-none bg-white border border-slate-300 text-slate-700 py-1.5 pl-9 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                >
                                  <option value="all">All Statuses</option>
                                  {CONTRACT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </div>

                              {/* Risk Filter Pills */}
                              <div className="flex bg-slate-100 rounded-lg p-1">
                                {(['all', 'low', 'medium', 'high'] as const).map((filter) => (
                                  <button key={filter} onClick={() => setRiskFilter(filter)} className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-all ${riskFilter === filter ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{filter}</button>
                                ))}
                              </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-slate-900 font-semibold uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('title')}><div className="flex items-center gap-1">Title <SortIcon colKey="title" /></div></th>
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('value')}><div className="flex items-center gap-1">Value <SortIcon colKey="value" /></div></th>
                                        <th className="px-6 py-3">Formula Checks</th>
                                        <th className="px-6 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('riskScore')}><div className="flex items-center gap-1">Early Risk Signal <SortIcon colKey="riskScore" /></div></th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredAndSortedContracts.length === 0 ? (
                                      <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">No contracts match the current filters.</td></tr>
                                    ) : (
                                      filteredAndSortedContracts.map(contract => (
                                        <tr key={contract.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">{contract.title}</td>
                                            <td className="px-6 py-4">
                                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border ${getContractTypeColor(contract.type)}`}>
                                                {getContractTypeIcon(contract.type)}
                                                {contract.type || 'SOW'}
                                              </span>
                                            </td>
                                            <td className="px-6 py-4">${contract.value.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                              <div className="flex gap-2">
                                                 {contract.decentralizationSteps?.map(step => {
                                                    let Icon = Database;
                                                    if (step.id === 'early-warnings') Icon = Network;
                                                    if (step.id === 'portable-clarity') Icon = FileText;
                                                    if (step.id === 'decentralized-checks') Icon = Layers;

                                                    const colorClass = step.status === 'Pass' ? 'text-emerald-500 bg-emerald-50' : 
                                                                       step.status === 'Flagged' ? 'text-red-500 bg-red-50' : 'text-slate-300 bg-slate-50';
                                                    
                                                    return (
                                                      <div key={step.id} className={`p-1.5 rounded-md ${colorClass} border border-transparent hover:border-slate-200 transition-colors`} title={`${step.label}: ${step.status}`}>
                                                          <Icon size={14} />
                                                      </div>
                                                    );
                                                 })}
                                              </div>
                                            </td>
                                            <td className="px-6 py-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskColor(contract.riskAnalysis?.score || 0)}`}>{contract.riskAnalysis?.score}</span></td>
                                            <td className="px-6 py-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(contract.status || 'Draft')}`}>{contract.status || 'Draft'}</span></td>
                                            <td className="px-6 py-4"><button onClick={() => { setSelectedContract(contract); setViewingVersionId(null); }} className="text-indigo-600 hover:text-indigo-900 font-medium flex items-center gap-1">View Report <ChevronRight size={16} /></button></td>
                                        </tr>
                                    ))
                                  )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {view === 'dashboard' && selectedContract && (
                <div className="animate-fade-in space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <button 
                          onClick={() => { setSelectedContract(null); setViewingVersionId(null); }}
                          className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1"
                      >
                          &larr; Back to Dashboard
                      </button>
                      
                      {!viewingVersionId && (
                        <button
                          onClick={() => {
                            setEditingContractId(selectedContract.id);
                            setView('form');
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
                        >
                          <Edit2 size={16} />
                          Edit Contract
                        </button>
                      )}
                    </div>
                    
                    {viewingVersionId && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <History className="text-amber-600" size={20} />
                          <div>
                            <p className="font-bold text-amber-800 text-sm">Viewing Historical Version (v{selectedContract.version})</p>
                            <p className="text-xs text-amber-700">This is a read-only snapshot. Switch to the current version to make edits.</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            // Find the actual current contract
                            const current = contracts.find(c => c.id === selectedContract.id);
                            if (current) setSelectedContract(current);
                            setViewingVersionId(null);
                          }}
                          className="px-3 py-1.5 bg-white border border-amber-300 text-amber-800 rounded text-xs font-bold hover:bg-amber-100 transition-colors"
                        >
                          Return to Current
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* LEFT COLUMN: Main Detail + Audit Trail */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Contract Header Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold border uppercase tracking-wide flex items-center gap-1.5 ${getContractTypeColor(selectedContract.type || 'SOW')}`}>
                                                {getContractTypeIcon(selectedContract.type || 'SOW')}
                                                {selectedContract.type || 'Contract'}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold border uppercase tracking-wide ${getStatusColor(selectedContract.status || 'Draft')}`}>
                                                {selectedContract.status || 'Draft'}
                                            </span>
                                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide">
                                                v{selectedContract.version || 1}.0
                                            </span>
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-800">{selectedContract.title}</h2>
                                        <p className="text-slate-500 mt-1">ID: {selectedContract.id}</p>
                                    </div>
                                    <div className={`px-4 py-2 rounded-lg border flex flex-col items-center ${getRiskColor(selectedContract.riskAnalysis?.score || 0)}`}>
                                        <span className="text-xs uppercase font-bold tracking-wider">Early Risk Signal</span>
                                        <span className="text-3xl font-bold">{selectedContract.riskAnalysis?.score}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Value</p>
                                        <p className="text-xl font-semibold text-slate-900 mt-1">${selectedContract.value.toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Duration</p>
                                        <p className="text-sm font-semibold text-slate-900 mt-1">
                                            {selectedContract.startDate} <span className="text-slate-400 mx-1">to</span> {selectedContract.endDate}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <AlertTriangle size={16} className="text-amber-500" />
                                        Early Risk Signals
                                    </h4>
                                    {selectedContract.riskAnalysis?.reasons.length === 0 ? (
                                        <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-100 flex items-center gap-2">
                                            <ShieldCheck size={16} /> No early warning signals detected.
                                        </p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {selectedContract.riskAnalysis?.reasons.map((reason, idx) => (
                                                <li key={idx} className="flex items-start gap-3 bg-red-50 text-red-800 p-3 rounded-lg border border-red-100 text-sm">
                                                    <div className="mt-0.5"><AlertTriangle size={14} /></div>
                                                    {reason}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <FileText size={16} className="text-blue-500" />
                                        Legal Clarity & Terms
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedContract.clauses.map((clause, i) => (
                                            <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full border border-slate-200">
                                                {clause}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Step-by-Step Monitoring (Audit Trail) */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-6 flex items-center gap-2">
                                    <History size={16} className="text-slate-500" />
                                    Step-by-Step Monitoring
                                </h3>
                                
                                <div className="relative space-y-0">
                                    {(selectedContract.auditLog || []).map((log, idx) => {
                                        const style = getLogStyle(log.action);
                                        const isLast = idx === (selectedContract.auditLog || []).length - 1;
                                        return (
                                            <div key={log.id} className="relative pl-12 pb-8 last:pb-0">
                                                {!isLast && <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-slate-200"></div>}
                                                <div className={`absolute left-0 top-0 w-10 h-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${style.color}`}>
                                                    {style.icon}
                                                </div>
                                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 hover:border-indigo-200 transition-colors">
                                                    <div className="flex justify-between items-start">
                                                         <span className="font-semibold text-slate-700 text-sm">{log.action}</span>
                                                         <span className="text-[10px] text-slate-400 font-mono">{log.date}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-0.5 mb-2">User: {log.user} • v{log.version || 1}</p>
                                                    {log.details && <p className="text-xs text-slate-600 italic border-t border-slate-200 pt-2 mt-2">{log.details}</p>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: AI Analysis + DoD + History */}
                        <div className="lg:col-span-1 space-y-6">
                            
                             {/* Version History Card */}
                             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                     <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                                       Version History
                                     </h3>
                                     <span className="text-xs font-mono text-slate-500">
                                        Current: v{selectedContract.version || 1}
                                     </span>
                                </div>
                                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                                    {/* Current Version Entry */}
                                    <div className={`p-3 flex items-center justify-between ${!viewingVersionId ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-slate-50'}`}>
                                       <div>
                                          <p className="text-sm font-bold text-slate-700">Version {selectedContract.version || 1} (Current)</p>
                                          <p className="text-xs text-slate-500">Latest active version</p>
                                       </div>
                                       {viewingVersionId && (
                                         <button 
                                            onClick={() => {
                                                const current = contracts.find(c => c.id === selectedContract.id);
                                                if (current) setSelectedContract(current);
                                                setViewingVersionId(null);
                                            }}
                                            className="text-xs text-indigo-600 font-medium hover:underline"
                                         >
                                            View
                                         </button>
                                       )}
                                    </div>
                                    
                                    {/* Previous Versions */}
                                    {selectedContract.previousVersions && selectedContract.previousVersions.slice().reverse().map(ver => (
                                        <div key={ver.version} className={`p-3 flex items-center justify-between ${viewingVersionId === ver.version.toString() ? 'bg-amber-50 border-l-4 border-amber-500' : 'hover:bg-slate-50'}`}>
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">Version {ver.version}</p>
                                                <p className="text-xs text-slate-400">{ver.timestamp}</p>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    setSelectedContract(ver.data);
                                                    setViewingVersionId(ver.version.toString());
                                                }}
                                                className="text-xs text-slate-500 font-medium hover:text-indigo-600 flex items-center gap-1"
                                            >
                                                <RotateCcw size={12} /> View
                                            </button>
                                        </div>
                                    ))}
                                    
                                    {(!selectedContract.previousVersions || selectedContract.previousVersions.length === 0) && (
                                        <p className="p-4 text-xs text-slate-400 italic text-center">No previous versions.</p>
                                    )}
                                </div>
                             </div>

                             {/* AI Analysis Card */}
                             <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl shadow-sm border border-indigo-100 p-6 relative overflow-hidden group">
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-indigo-600 text-white p-1.5 rounded-lg shadow-sm">
                                            <BrainCircuit size={18} />
                                        </div>
                                        <h3 className="font-bold text-indigo-900">AI Auditor Insight</h3>
                                    </div>
                                    <button 
                                        onClick={handleManualAIAnalysis} 
                                        disabled={isAnalyzing}
                                        className="text-indigo-400 hover:text-indigo-600 p-1 rounded-md transition-colors disabled:opacity-50"
                                        title="Refresh AI Analysis"
                                    >
                                        <RefreshCw size={16} className={isAnalyzing ? "animate-spin" : ""} />
                                    </button>
                                </div>
                                
                                <div className="prose prose-sm prose-indigo relative z-10 min-h-[60px]">
                                    {isAnalyzing ? (
                                        <div className="flex items-center gap-2 text-indigo-400 text-sm animate-pulse">
                                            <Sparkles size={16} />
                                            Analyzing contract clauses...
                                        </div>
                                    ) : (
                                        <p className="text-slate-700 leading-relaxed text-sm">
                                            {selectedContract.riskAnalysis?.aiAnalysis || "No AI analysis available. Click refresh to generate."}
                                        </p>
                                    )}
                                </div>
                                
                                {/* Decorative background element */}
                                <div className="absolute -bottom-4 -right-4 text-indigo-50 opacity-50 pointer-events-none transform rotate-12">
                                    <BrainCircuit size={120} />
                                </div>
                             </div>

                             {/* Decentralization Scorecard */}
                             {selectedContract.decentralizationSteps && (
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                   <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                                     <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                                       Decentralization Scorecard
                                     </h3>
                                   </div>
                                   <div className="divide-y divide-slate-100">
                                      {selectedContract.decentralizationSteps.map(step => {
                                          let icon, bgClass, textClass;
                                          if (step.id === 'good-data') { icon = <Database size={16} />; bgClass = 'bg-emerald-50'; textClass = 'text-emerald-700'; }
                                          else if (step.id === 'early-warnings') { icon = <Network size={16} />; bgClass = 'bg-amber-50'; textClass = 'text-amber-700'; }
                                          else if (step.id === 'portable-clarity') { icon = <FileText size={16} />; bgClass = 'bg-blue-50'; textClass = 'text-blue-700'; }
                                          else { icon = <Layers size={16} />; bgClass = 'bg-purple-50'; textClass = 'text-purple-700'; }
                                          
                                          return (
                                              <div key={step.id} className="p-4 hover:bg-slate-50 transition-colors group">
                                                  <div className="flex items-center justify-between mb-1">
                                                      <div className="flex items-center gap-2">
                                                          <div className={`p-1.5 rounded-md ${bgClass} ${textClass} opacity-80 group-hover:opacity-100`}>
                                                              {icon}
                                                          </div>
                                                          <span className="font-semibold text-sm text-slate-700">{step.label}</span>
                                                      </div>
                                                      <div className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                                                          step.status === 'Pass' ? 'bg-emerald-100 text-emerald-700' :
                                                          step.status === 'Flagged' ? 'bg-red-100 text-red-700' :
                                                          'bg-slate-100 text-slate-600'
                                                      }`}>
                                                          {step.status}
                                                      </div>
                                                  </div>
                                                  <p className="text-xs text-slate-500 pl-9 leading-relaxed">
                                                      {step.description}
                                                  </p>
                                              </div>
                                          );
                                      })}
                                   </div>
                                </div>
                             )}

                            {/* Definition of Done (DoD) */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                                        <ListTodo size={16} className="text-emerald-500" />
                                        Definition of Done (DoD)
                                    </h3>
                                    {selectedContract.policyChecks && selectedContract.policyChecks.length > 0 && (
                                        <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">
                                            {selectedContract.policyChecks.filter(p => p.status === 'compliant').length} / {selectedContract.policyChecks.length}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    {(selectedContract.policyChecks || []).map(policy => (
                                        <div key={policy.id} className={`p-3 rounded-lg border flex items-start gap-3 transition-colors ${
                                            policy.status === 'compliant' ? 'bg-emerald-50/50 border-emerald-100' :
                                            policy.status === 'violation' ? 'bg-red-50/50 border-red-100' :
                                            'bg-amber-50/50 border-amber-100'
                                        }`}>
                                            <div className="mt-0.5 shrink-0">
                                                {policy.status === 'compliant' && <CheckCircle2 size={18} className="text-emerald-600" />}
                                                {policy.status === 'warning' && <AlertTriangle size={18} className="text-amber-600" />}
                                                {policy.status === 'violation' && <XCircle size={18} className="text-red-600" />}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-bold ${
                                                    policy.status === 'compliant' ? 'text-slate-800' : 
                                                    policy.status === 'violation' ? 'text-red-800' : 'text-amber-800'
                                                }`}>
                                                    {policy.policyName}
                                                </p>
                                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                                    {policy.details}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!selectedContract.policyChecks || selectedContract.policyChecks.length === 0) && (
                                        <p className="text-xs text-slate-400 italic text-center py-4">No DoD policies triggered for this contract type.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}

// Helper icon
const ShieldCheck = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <path d="M9 12l2 2 4-4"></path>
    </svg>
);
