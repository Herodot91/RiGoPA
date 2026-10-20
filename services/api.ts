/// <reference types="vite/client" />
import type { Contract, SystemRisk } from '../types';

// Read-only REST API, versioned under /api/v1 and described in docs/openapi.yaml.
// The responses are JSON files served next to the app (see public/api/v1).
const API_BASE = `${import.meta.env.BASE_URL}api/v1`;

async function get<T>(resource: string): Promise<T> {
    const response = await fetch(`${API_BASE}/${resource}.json`);
    if (!response.ok) {
        throw new Error(`GET /api/v1/${resource}.json failed with status ${response.status}`);
    }
    return response.json() as Promise<T>;
}

/** The contract register. */
export const loadContracts = (): Promise<Contract[]> => get<Contract[]>('contracts');

/** The system implementation risk register. */
export const loadSystemRisks = (): Promise<SystemRisk[]> => get<SystemRisk[]>('system-risks');
