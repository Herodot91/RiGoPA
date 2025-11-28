import { Contract, RiskAnalysis, PolicyCheck, DecentralizationStep } from "../types";

/**
 * Re-implementation of the 'simulate_risk' Python function with refined nuances.
 */
export const calculateDeterministicRisk = (contract: Contract): RiskAnalysis => {
  let score = 0;
  const reasons: string[] = [];
  const clausesText = contract.clauses.join(' ').toLowerCase();
  const now = new Date();

  // 0. Automated Alert: Project Overdue Check
  // This simulates the "System Watchdog" pillar of the Decentralization formula.
  const end = new Date(contract.endDate);
  const isOverdue = now > end && contract.status !== 'Completed' && contract.status !== 'Terminated';
  
  if (isOverdue) {
    score += 40; // High impact risk
    reasons.push("CRITICAL ALERT: Project timeline exceeded without completion.");
  }

  // 1. Value Analysis
  if (contract.value > 100000) {
    let valueRisk = 20;
    if (contract.type === 'PO') {
        valueRisk += 10; // High value POs are riskier without distinct MSA terms
        reasons.push("High value Purchase Order (risk of missing terms)");
    } else {
        reasons.push("High contract value");
    }
    score += valueRisk;
  }

  // 2. Termination Clause Analysis
  const hasTermination = contract.clauses.some(c => c.toLowerCase().includes("termination"));
  const explicitlyNoTermination = contract.clauses.some(c => c.toLowerCase().includes("no termination clause"));
  
  if (explicitlyNoTermination || !hasTermination) {
    let terminationRisk = 30;
    
    if (contract.type === 'MSA' || contract.type === 'Service Agreement') {
        terminationRisk += 15; // Critical for long-term agreements
        reasons.push("Critical: Missing termination clause in Master/Service Agreement");
    } else if (contract.type === 'PO') {
        terminationRisk -= 10; // Less critical for transactional POs but still needed
        reasons.push("Missing termination clause");
    } else {
        reasons.push("Missing termination clause");
    }
    score += terminationRisk;
  }

  // 3. Manual Modifications
  if (contract.clauses.some(c => c.toLowerCase().includes("manual modifications"))) {
    let modRisk = 25;
    
    if (contract.type === 'PO') {
        modRisk += 15; // POs should be standard generated, manual edits are very suspicious
        reasons.push("Critical: Manual edits on Purchase Order detected");
    } else if (contract.type === 'MSA') {
        modRisk -= 10; // Negotiation is expected on MSAs
        reasons.push("Manual contract edits detected (Negotiated)");
    } else {
        reasons.push("Manual contract edits detected");
    }
    score += modRisk;
  }

  // 4. Date Logic
  const start = new Date(contract.startDate);
  
  if (start > end) {
    score += 30; // Critical logic error
    reasons.push("Start date is after end date");
  } else {
      // Long duration check
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays > 365 * 5) {
          if (contract.type === 'MSA') {
             score += 5; // Long MSAs are common, low risk increment
             reasons.push("Long duration MSA (>5 years)");
          } else {
             score += 15; // Long POs/SOWs are unusual and risky
             reasons.push(`Unusually long duration for ${contract.type} (>5 years)`);
          }
      }
  }

  // 5. Contract Type Specific Deep Dives

  // SOW / Service Agreement
  // Higher risk if they lack Liability/Indemnity or clear Scope/Deliverables
  if (contract.type === 'SOW' || contract.type === 'Service Agreement') {
    
    // Check for Liability/Indemnity
    const hasIndemnityOrLiability = clausesText.includes('liability') || clausesText.includes('indemnif') || clausesText.includes('warranty');
    if (!hasIndemnityOrLiability) {
      score += 20; // Increased weight
      reasons.push(`Missing Liability/Indemnity clause in ${contract.type}`);
    }

    // Check for Scope/Deliverables
    const hasScope = clausesText.includes('scope') || clausesText.includes('deliverable') || clausesText.includes('milestone') || clausesText.includes('services');
    if (!hasScope) {
      score += 15; // Increased weight
      reasons.push(`Undefined Scope of Work or Deliverables`);
    }
  }

  // NDA
  // Must have Confidentiality definition
  if (contract.type === 'NDA') {
    const hasConfidentiality = clausesText.includes('confidential') || clausesText.includes('proprietary') || clausesText.includes('trade secret');
    if (!hasConfidentiality) {
      score += 40; // Critical failure of purpose
      reasons.push("NDA missing core confidentiality definitions");
    }
  }

  // POs (Purchase Orders)
  // High value POs should reference an MSA or Terms
  if (contract.type === 'PO' && contract.value > 25000) {
    const referencesTerms = clausesText.includes('terms') || clausesText.includes('msa') || clausesText.includes('master agreement');
    if (!referencesTerms) {
      score += 15;
      reasons.push("High-value PO lacks reference to Master Agreement/Terms");
    }
  }

  // MSAs
  // High value MSA check
  if (contract.type === 'MSA' && contract.value > 200000) {
    score += 15;
    reasons.push("High value MSA requires additional review");
  }

  return {
    score,
    reasons
  };
};

/**
 * Simulates a Policy Engine checking against internal regulations.
 */
export const evaluatePolicyCompliance = (contract: Contract): PolicyCheck[] => {
  const checks: PolicyCheck[] = [];

  // Policy 1: Delegation of Authority
  if (contract.value > 50000) {
    checks.push({
      id: 'pol-001',
      policyName: 'Delegation of Authority (Level 2)',
      status: 'warning',
      details: 'Contracts over $50k require VP approval. Ensure audit trail shows this signature.'
    });
  } else {
    checks.push({
      id: 'pol-001',
      policyName: 'Delegation of Authority',
      status: 'compliant',
      details: 'Value within standard Manager approval limits.'
    });
  }

  // Policy 2: GDPR / Data Privacy
  const hasDataClause = contract.clauses.some(c => 
    c.toLowerCase().includes('data') || 
    c.toLowerCase().includes('privacy') || 
    c.toLowerCase().includes('gdpr')
  );

  if ((contract.type === 'SOW' || contract.type === 'Service Agreement') && !hasDataClause) {
    checks.push({
      id: 'pol-002',
      policyName: 'GDPR & Data Privacy',
      status: 'violation',
      details: 'Service agreements must include a Data Processing Addendum (DPA) or Privacy clause.'
    });
  } else {
     checks.push({
      id: 'pol-002',
      policyName: 'GDPR & Data Privacy',
      status: 'compliant',
      details: 'Data clauses present or not required for this contract type.'
    });
  }

  // Policy 3: Payment Terms
  const hasPaymentTerms = contract.clauses.some(c => c.toLowerCase().includes('net') || c.toLowerCase().includes('payment'));
  if (!hasPaymentTerms) {
    checks.push({
      id: 'pol-003',
      policyName: 'Standard Payment Terms',
      status: 'warning',
      details: 'No specific payment terms (e.g. Net 30) detected. Defaulting to Net 60 policy.'
    });
  } else {
    checks.push({
      id: 'pol-003',
      policyName: 'Standard Payment Terms',
      status: 'compliant',
      details: 'Payment terms defined.'
    });
  }

  return checks;
};

/**
 * Evaluates the 4 Pillars of the Decentralization Formula for a specific contract.
 */
export const evaluateDecentralizationSteps = (contract: Contract, riskScore: number): DecentralizationStep[] => {
  const steps: DecentralizationStep[] = [];

  // 1. Good Data
  // Check if essential fields are valid and data appears standardized
  const hasTitle = !!contract.title && contract.title !== 'Untitled';
  const hasValue = contract.value >= 0;
  const hasDates = !!contract.startDate && !!contract.endDate;
  
  if (hasTitle && hasValue && hasDates) {
    steps.push({
      id: 'good-data',
      label: 'Good Data',
      status: 'Pass',
      description: 'Structured data (Type, Value, Dates) is complete and accessible via standard API.'
    });
  } else {
    steps.push({
      id: 'good-data',
      label: 'Good Data',
      status: 'Flagged',
      description: 'Missing core metadata fields required for central reporting.'
    });
  }

  // 2. Early Warnings
  // Check if risk signals were processed. 
  // Note: "Pass" here means the system successfully RAN the check, but if the risk is High, we might flag it.
  // Interpretation: "Early Warnings" means the system *caught* the issue.
  if (riskScore > 50) {
    steps.push({
      id: 'early-warnings',
      label: 'Early Warnings',
      status: 'Flagged',
      description: `System detected High Risk (${riskScore}). Local alert active.`
    });
  } else {
    steps.push({
      id: 'early-warnings',
      label: 'Early Warnings',
      status: 'Pass',
      description: 'Risk analysis active. No critical threshold breaches detected.'
    });
  }

  // 3. Portable Clarity
  // Check for standard language usage
  const clausesText = contract.clauses.join(' ').toLowerCase();
  const usesStandard = clausesText.includes('standard') || clausesText.includes('template') || clausesText.includes('model');
  
  if (usesStandard) {
    steps.push({
      id: 'portable-clarity',
      label: 'Portable Clarity',
      status: 'Pass',
      description: 'Contract references standard templates, ensuring portability across regions.'
    });
  } else {
    steps.push({
      id: 'portable-clarity',
      label: 'Portable Clarity',
      status: 'Flagged',
      description: 'Custom or non-standard language detected. May require manual legal interpretation.'
    });
  }

  // 4. Decentralized Checks
  // Check if policy checks (DoD) were run
  const checksRun = contract.policyChecks && contract.policyChecks.length > 0;
  const violations = contract.policyChecks?.filter(p => p.status === 'violation').length || 0;

  if (checksRun && violations === 0) {
    steps.push({
      id: 'decentralized-checks',
      label: 'Decentralized Checks',
      status: 'Pass',
      description: 'All local milestone checks passed standard DoD criteria.'
    });
  } else if (checksRun && violations > 0) {
    steps.push({
      id: 'decentralized-checks',
      label: 'Decentralized Checks',
      status: 'Flagged',
      description: `${violations} blocking policy violations detected during local check.`
    });
  } else {
    steps.push({
      id: 'decentralized-checks',
      label: 'Decentralized Checks',
      status: 'Pending',
      description: 'Automated policy checks pending.'
    });
  }

  return steps;
};
