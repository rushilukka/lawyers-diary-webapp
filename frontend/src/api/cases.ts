import client from './client';

export interface Case {
    _id: string;
    case_number: string;
    case_title: string;
    year: string;
    next_date: string;
    reply_pending: boolean;
    admit: boolean;
    matter_disposed: string;
    opinion_given: boolean;
    contact_person_name: string;
    contact_person_phone: string;
    notes?: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
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
};
