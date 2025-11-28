import { ContractFormData, ContractType } from '../types';

/**
 * Parses an uploaded file (JSON or CSV) and returns standardized contract form data.
 */
export const parseImportFile = async (file: File): Promise<ContractFormData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return reject(new Error("File is empty"));

      try {
        if (file.name.toLowerCase().endsWith('.json')) {
          const data = JSON.parse(text);
          if (!Array.isArray(data)) throw new Error("JSON root must be an array of objects");
          
          const mapped: ContractFormData[] = data.map((item: any) => validateAndMap(item));
          resolve(mapped);
          
        } else if (file.name.toLowerCase().endsWith('.csv')) {
          const lines = text.split(/\r?\n/).filter(l => l.trim());
          if (lines.length < 2) throw new Error("CSV must contain a header row and at least one data row");
          
          const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/['"]+/g, ''));
          
          const mapped: ContractFormData[] = [];
          
          // Regex to split by comma, ignoring commas inside double quotes
          const csvSplitRegex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;

          for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(csvSplitRegex).map(val => val.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
            
            // Create a temporary object map
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] || '';
            });
            
            mapped.push(validateAndMap(obj));
          }
          resolve(mapped);
        } else {
          reject(new Error("Unsupported file format. Please upload .json or .csv"));
        }
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Failed to parse file"));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};

const validateAndMap = (item: any): ContractFormData => {
  // Helper to find key case-insensitively
  const getValue = (key: string) => {
    const foundKey = Object.keys(item).find(k => k.toLowerCase() === key.toLowerCase() || k.toLowerCase().replace('_', '') === key.toLowerCase());
    return foundKey ? item[foundKey] : undefined;
  };

  const title = getValue('title') || 'Untitled Imported Contract';
  const typeRaw = getValue('type') || 'SOW';
  const value = parseFloat(getValue('value') || '0');
  const startDate = getValue('startDate') || new Date().toISOString().split('T')[0];
  const endDate = getValue('endDate') || new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0];
  
  // Clauses: Handle array (JSON) or string (CSV - usually semicolon or pipe separated if multiple)
  let clausesRaw = getValue('clauses') || getValue('terms');
  let clauses = '';
  
  if (Array.isArray(clausesRaw)) {
    clauses = clausesRaw.join('\n');
  } else if (typeof clausesRaw === 'string') {
    // Replace semicolons with newlines for CSV imports where multiple clauses are packed
    clauses = clausesRaw.replace(/;/g, '\n'); 
  }

  // Validate Contract Type
  const validTypes: ContractType[] = ['SOW', 'PO', 'MSA', 'NDA', 'Licensing', 'Service Agreement', 'TPH'];
  const type = validTypes.includes(typeRaw as any) ? (typeRaw as ContractType) : 'SOW';

  return {
    title,
    type,
    value: isNaN(value) ? 0 : value,
    startDate,
    endDate,
    clauses
  };
};