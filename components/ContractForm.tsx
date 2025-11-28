import React, { useState, useEffect } from 'react';
import { ContractFormData, ContractType } from '../types';
import { Plus, X, ListTodo, Save } from 'lucide-react';

interface ContractFormProps {
  onSubmit: (data: ContractFormData) => void;
  onCancel: () => void;
  isProcessing: boolean;
  initialData?: ContractFormData; // Optional prop for editing
}

const ContractForm: React.FC<ContractFormProps> = ({ onSubmit, onCancel, isProcessing, initialData }) => {
  const [formData, setFormData] = useState<ContractFormData>({
    title: '',
    type: 'SOW',
    value: 0,
    startDate: '',
    endDate: '',
    clauses: ''
  });

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handlePreFill = () => {
    setFormData({
      title: 'Global Software License Agreement',
      type: 'Licensing',
      value: 120000,
      startDate: '2025-01-01',
      endDate: '2024-12-31', // Intentionally erroneous date for risk detection
      clauses: 'manual modifications\nstandard liability cap\nno termination clause'
    });
  };

  const contractTypes: ContractType[] = ['SOW', 'PO', 'MSA', 'NDA', 'Licensing', 'Service Agreement', 'TPH'];
  const isEditing = !!initialData;

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-2xl mx-auto animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">
          {isEditing ? 'Edit Contract Version' : 'Add New Contract'}
        </h2>
        {!isEditing && (
          <button 
            type="button" 
            onClick={handlePreFill}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Auto-fill risky example
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contract Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="e.g. IT Infrastructure Upgrade"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contract Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ContractType })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
              >
                {contractTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Contract Value ($)</label>
          <input
            type="number"
            required
            min="0"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
            <input
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Clauses / Terms</label>
          <p className="text-xs text-slate-500 mb-2">Enter key phrases or clause names separated by new lines.</p>
          <textarea
            required
            rows={4}
            value={formData.clauses}
            onChange={(e) => setFormData({ ...formData, clauses: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-sm"
            placeholder="e.g. &#10;standard format&#10;no termination clause"
          />
        </div>
        
        <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100 flex items-start gap-3">
             <ListTodo size={18} className="text-indigo-500 mt-0.5" />
             <p className="text-xs text-indigo-800">
               <strong>Agile DoD Check:</strong> {isEditing ? 'Updating' : 'Submission'} will automatically trigger the "Definition of Done" policy engine and Early Risk analysis.
             </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isProcessing}
            className={`flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isProcessing ? (
               <>
                <Loader2 className="animate-spin" size={20} />
                Processing...
               </>
            ) : (
              <>
                {isEditing ? <Save size={18} /> : <Plus size={18} />}
                {isEditing ? 'Update Contract & Run Checks' : 'Run DoD & Risk Checks'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// Import loader locally to avoid adding it to props just for this icon
const Loader2 = ({ className, size }: { className?: string; size?: number }) => (
    <svg className={className} width={size} height={size} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export default ContractForm;