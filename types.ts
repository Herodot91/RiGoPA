export type ContractStatus = 'Draft' | 'Legal Review' | 'Pending Approval' | 'Active' | 'Completed' | 'Terminated';
export type ContractType = 'SOW' | 'PO' | 'MSA' | 'NDA' | 'Licensing' | 'Service Agreement' | 'TPH';

export interface AuditLogEntry {
  id: string;
  date: string;
  action: string;
  user: string;
  details?: string;
  version?: number;
}

export interface PolicyCheck {
  id: string;
  policyName: string;
  status: 'compliant' | 'violation' | 'warning';
  details: string;
}

export interface DecentralizationStep {
  id: 'good-data' | 'early-warnings' | 'portable-clarity' | 'decentralized-checks';
  label: string;
  status: 'Pass' | 'Flagged' | 'Pending';
  description: string;
}

export interface ContractVersionSnapshot {
  version: number;
  timestamp: string;
  data: Contract;
  reason: string;
}

export interface Contract {
  id: string;
  title: string;
  type: ContractType;
  status: ContractStatus;
  value: number;
  startDate: string; // ISO Date string YYYY-MM-DD
  endDate: string;   // ISO Date string YYYY-MM-DD
  clauses: string[];
  riskAnalysis?: RiskAnalysis;
  auditLog: AuditLogEntry[];
  policyChecks?: PolicyCheck[];
  decentralizationSteps?: DecentralizationStep[];
  version: number;
  previousVersions?: ContractVersionSnapshot[];
}

export interface RiskAnalysis {
  score: number;
  reasons: string[];
  aiAnalysis?: string; // Enhanced analysis from Gemini
}

export interface ContractFormData {
  title: string;
  type: ContractType;
  value: number;
  startDate: string;
  endDate: string;
  clauses: string; // Text area input, split by newline
}

export interface SystemRisk {
  id: string;
  category: string;
  description: string;
  likelihood: number; // 1-5 scale
  impact: number;     // 1-5 scale
  mitigation: string;
  score: number;      // likelihood * impact
  level: 'High' | 'Medium' | 'Low';
}