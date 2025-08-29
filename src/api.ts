import axios from 'axios';

// Add type definitions
export interface CaseData {
    petitionerName: string;
    respondentName: string;
    filingDate: Date;
    petitionNumber: string;
    noticeNumber: string;
    writType: string;
    department: number;
    subDepartments: number[];
    subdepartmentEmails: Array<{
        departmentId: number;
        email: string;
    }>;
    status?: 'Pending' | 'Resolved';
}

// Error logging utility
const logError = (message: string, error: unknown) => {
    console.error(message, error);
    return error instanceof Error ? error : new Error(String(error));
};

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Update error handling
API.interceptors.response.use(
    response => response,
    error => {
        const errorMessage = error.response?.data?.error || error.message || 'An unknown error occurred';
        return Promise.reject(logError('API Error:', errorMessage));
    }
);

// Type definitions for API responses
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// API methods with proper error handling
export const addCase = async (caseData: CaseData): Promise<ApiResponse<CaseData>> => {
    try {
        const response = await API.post<ApiResponse<CaseData>>('/cases/add', caseData);
        return response.data;
    } catch (error) {
        throw logError('Failed to add case:', error);
    }
};

// ...existing code...

export default API;