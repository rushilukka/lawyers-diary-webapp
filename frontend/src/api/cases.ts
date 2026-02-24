import client from './client';

export interface Case {
    id: string;          // compound key: XXXXX-YYYY (e.g. "00042-2024")
    case_number: string;
    case_title: string;
    year: number;
    next_date: string;
    reply_pending: boolean;
    admit: boolean;
    matter_disposed: string;
    opinion_given: boolean;
    contact_person_name: string;
    contact_person_phone: string;
    notes?: string;
}

export const casesApi = {
    getAllCases: async (): Promise<Case[]> => {
        // Determine the user's role/id if needed, but usually the token handles "my cases"
        const response = await client.get<Case[]>('/cases');
        return response.data;
    },
    createCase: async (caseData: any) => {
        const response = await client.post('/cases', caseData);
        return response.data;
    },
    getCaseById: async (id: string): Promise<Case> => {
        const response = await client.get<Case>(`/cases/${id}`);
        return response.data;
    },
    updateCase: async (id: string, caseData: any) => {
        const response = await client.put(`/cases/${id}`, caseData);
        return response.data;
    },
    searchCases: async (query: string, field?: string): Promise<Case[]> => {
        const params: any = { q: query };
        if (field) params.field = field;
        const response = await client.get<Case[]>('/cases/search', { params });
        return response.data;
    },
    deleteCase: async (id: string) => {
        const response = await client.delete(`/cases/${id}`);
        return response.data;
    },
};
