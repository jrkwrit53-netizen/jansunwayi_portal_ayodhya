// Define a type for your case data (matches the structure in getMockCase)
export interface Case {
  id: string | number; // Assuming ID could be number or string
  caseNumber: string;
  petitionerName: string; // Person who filed the case
  respondentName: string; // Person against whom the case is filed
  filingDate: Date;
  petitionNumber: string;
  noticeNumber: string;
  writType: string; // Allow custom writ types
  department: number; // Department ID
  subDepartments?: number[]; // Sub-department IDs
  status: 'Pending' | 'Resolved'; // Status
  hearingDate: Date | null;
  reminderSent: boolean;
  affidavitDueDate: Date | null;
  affidavitSubmissionDate: Date | null;
  counterAffidavitRequired: boolean;
  reminderSentCount: number;
  lastReminderSent?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  emailid?: string; // Add emailid field
  subdepartmentEmails?: Array<{
    departmentId: string;
    email: string;
  }>;
}

export interface SubDepartment {
  _id: string;
  id: number;
  name_en: string;
  name_hi: string;
  departmentId: number;
  email?: string;
}

export interface Department {
  id: number;
  name_en: string;
  name_hi: string;
}

// Cache for departments and sub-departments
let departmentsCache: Department[] | null = null;
let subDepartmentsCache: SubDepartment[] | null = null;
let casesCache: Case[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Base URL for API calls
const API_BASE = 'https://jansunwayi-portal-ayodhya-six.vercel.app';
const API_BASE_LOCAL = 'http://localhost:5000';
const API_TIMEOUT = 3000; // 3 seconds

// Error logging utility
const logError = (message: string, error: any) => {
  console.error(message, error);
};

// ===== CASE API FUNCTIONS =====

export const fetchCases = async (filters?: {
  department?: number;
  subDepartment?: number;
  status?: string;
  writType?: string;
  petitionerName?: string;
  respondentName?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const params = new URLSearchParams();
    if (filters?.department) params.append('department', filters.department.toString());
    if (filters?.subDepartment) params.append('subDepartment', filters.subDepartment.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.writType) params.append('writType', filters.writType);
    if (filters?.petitionerName) params.append('petitionerName', filters.petitionerName);
    if (filters?.respondentName) params.append('respondentName', filters.respondentName);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const url = `${API_BASE}/cases${params.toString() ? `?${params.toString()}` : ''}`;
    console.log('Fetching cases from URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching cases: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    logError("API call failed:", error);
    throw error;
  }
};

export const fetchCaseById = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE}/cases/${id}`);
    if (!response.ok) {
      throw new Error(`Error fetching case: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    logError("API call failed:", error);
    throw error;
  }
};

export const createCase = async (caseData: Omit<Case, 'id' | 'hearingDate' | 'reminderSent' | 'reminderSentCount' | 'lastReminderSent' | 'createdAt' | 'updatedAt'>) => {
  try {
    // Transform payload to match backend expectations
    const firstSubDepartment = Array.isArray((caseData as any).subDepartments)
      ? (caseData as any).subDepartments.find((v: any) => !!v) || undefined
      : undefined;

    const isValidObjectId = (v: any) => typeof v === 'string' && /^[a-f0-9]{24}$/i.test(v);

    const subDepartmentsArray = Array.isArray((caseData as any).subDepartments)
      ? (caseData as any).subDepartments.filter((v: any) => isValidObjectId(v))
      : [];

    const toIso = (d: any) => {
      if (!d) return undefined;
      const dt = d instanceof Date ? d : new Date(d);
      return isNaN(dt.getTime()) ? undefined : dt.toISOString();
    };

    const fallbackCaseNumber = () => `CN-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const payload: any = {
      caseNumber: (caseData as any).caseNumber || fallbackCaseNumber(),
      petitionername: (caseData as any).petitionerName,
      respondentname: (caseData as any).respondentName,
      filingDate: toIso((caseData as any).filingDate),
      petitionNumber: (caseData as any).petitionNumber,
      noticeNumber: (caseData as any).noticeNumber,
      writType: (caseData as any).writType,
      department: (caseData as any).department,
      status: (caseData as any).status,
      affidavitDueDate: toIso((caseData as any).affidavitDueDate),
      affidavitSubmissionDate: toIso((caseData as any).affidavitSubmissionDate),
      counterAffidavitRequired: (caseData as any).counterAffidavitRequired,
      emailid: (caseData as any).emailid,
    };

    if (firstSubDepartment && isValidObjectId(firstSubDepartment)) {
      payload.subDepartment = firstSubDepartment;
    }
    if (subDepartmentsArray.length > 0) {
      payload.subDepartments = subDepartmentsArray;
    }

    const response = await fetch(`${API_BASE}/cases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error creating case: ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    
    // Clear cache
    casesCache = null;
    cacheTimestamp = 0;
    
    return result;
  } catch (error) {
    logError("API: createCase failed:", error);
    throw error;
  }
};

export const updateCase = async (id: string, caseData: Partial<Case>) => {
  try {
    const response = await fetch(`${API_BASE}/cases/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(caseData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error updating case: ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    
    // Clear cache
    casesCache = null;
    cacheTimestamp = 0;
    
    return result;
  } catch (error) {
    logError("API: updateCase failed:", error);
    throw error;
  }
};

export const deleteCase = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE}/cases/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error deleting case: ${response.statusText} - ${errorText}`);
    }
    
    // Clear cache
    casesCache = null;
    cacheTimestamp = 0;
    
    return await response.json();
  } catch (error) {
    logError("API: deleteCase failed:", error);
    throw error;
  }
};

/**
 * The function fetches a case by its number from an API endpoint and returns the JSON response.
 * @param {string} caseNumber - The `fetchCaseByNumber` function is an asynchronous function that takes
 * a `caseNumber` parameter of type string. This function fetches case data from an API endpoint based
 * on the provided case number. If the fetch operation is successful, it returns the JSON response. If
 * there is an error during
 * @returns The function `fetchCaseByNumber` is returning a Promise that resolves to the JSON data of
 * the case fetched by the provided case number.
 */
interface CaseResponse {
  success: boolean;
  data?: Case;
  error?: string;
}

export const fetchCaseByNumber = async (caseNumber: string): Promise<CaseResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(`${API_BASE}/cases/by-number/${caseNumber}`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        error: `Error fetching case: ${response.statusText}`
      };
    }

    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error) {
    logError("API: fetchCaseByNumber failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch case'
    };
  }
};

// ===== SUB-DEPARTMENT API FUNCTIONS =====

export const saveSubDepartment = async (departmentId: number, subDeptNameEn: string, subDeptNameHi: string) => {
  try {
    console.log('API: Saving sub-department with data:', { departmentId, subDeptNameEn, subDeptNameHi });
    
    const response = await fetch(`${API_BASE}/sub-departments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        departmentId,
        subDeptNameEn,
        subDeptNameHi
      }),
    });
    
    console.log('API: Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Error response:', errorText);
      throw new Error(`Error saving sub-department: ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Success response:', result);
    
    // Clear cache immediately when new data is added
    subDepartmentsCache = null;
    cacheTimestamp = 0; // Force cache refresh
    
    return result;
  } catch (error) {
    logError("API: saveSubDepartment failed:", error);
    throw error;
  }
};

export const fetchSubDepartments = async (departmentId?: number) => {
  try {
    console.log('API: Fetching sub-departments for departmentId:', departmentId);
    
    // Force clear cache for debugging
    subDepartmentsCache = null;
    cacheTimestamp = 0;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const url = departmentId 
      ? `${API_BASE}/sub-departments?departmentId=${departmentId}`
      : `${API_BASE}/sub-departments`;
    
    console.log('API: Fetching from URL:', url);
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    console.log('API: Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Error fetching sub-departments: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('API: Received sub-departments data:', data);
    
    subDepartmentsCache = data;
    cacheTimestamp = Date.now();
    
    return data;
  } catch (error) {
    logError("API: fetchSubDepartments failed:", error);
    // Return cached data if available, even if expired
    if (subDepartmentsCache) {
      if (departmentId) {
        return subDepartmentsCache.filter(sub => sub.departmentId === departmentId);
      }
      return subDepartmentsCache;
    }
    throw error;
  }
};

export const updateSubDepartment = async (id: string, updateData: Partial<SubDepartment>) => {
  try {
    const response = await fetch(`${API_BASE}/sub-departments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error updating sub-department: ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    
    // Clear cache
    subDepartmentsCache = null;
    cacheTimestamp = 0;
    
    return result;
  } catch (error) {
    logError("API: updateSubDepartment failed:", error);
    throw error;
  }
};

export const deleteSubDepartment = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE}/sub-departments/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error deleting sub-department: ${response.statusText} - ${errorText}`);
    }
    
    // Clear cache
    subDepartmentsCache = null;
    cacheTimestamp = 0;
    
    return await response.json();
  } catch (error) {
    logError("API: deleteSubDepartment failed:", error);
    throw error;
  }
};

// ===== DEPARTMENT API FUNCTIONS =====

export const fetchDepartments = async () => {
  try {
    // Check cache first
    const now = Date.now();
    if (departmentsCache && (now - cacheTimestamp) < CACHE_DURATION) {
      return departmentsCache;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(`${API_BASE}/departments`, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Error fetching departments: ${response.statusText}`);
    }
    
    const data = await response.json();
    departmentsCache = data;
    cacheTimestamp = now;
    
    return data;
  } catch (error) {
    logError("API call failed:", error);
    // Return cached data if available, even if expired
    if (departmentsCache) {
      return departmentsCache;
    }
    throw error;
  }
};

export const fetchDepartmentById = async (id: number) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(`${API_BASE}/departments/${id}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Error fetching department: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    logError("API call failed:", error);
    throw error;
  }
};

export const createDepartment = async (departmentData: { id: number; name_en: string; name_hi: string }) => {
  try {
    const response = await fetch(`${API_BASE}/departments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(departmentData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error creating department: ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    
    // Clear cache
    departmentsCache = null;
    cacheTimestamp = 0;
    
    return result;
  } catch (error) {
    logError("API: createDepartment failed:", error);
    throw error;
  }
};

// ===== EMAIL REMINDER API FUNCTIONS =====

export const sendEmailReminder = async (caseId: string, email: string) => {
  try {
    const response = await fetch(`${API_BASE}/email-reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ caseId, email }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error sending email reminder: ${response.statusText} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    logError("API: sendEmailReminder failed:", error);
    throw error;
  }
};

export const fetchEmailReminders = async (caseId: string) => {
  try {
    const response = await fetch(`${API_BASE}/email-reminders/case/${caseId}`);
    if (!response.ok) {
      throw new Error(`Error fetching email reminders: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    logError("API: fetchEmailReminders failed:", error);
    throw error;
  }
};

// ===== STATISTICS API FUNCTIONS =====

export const fetchStatistics = async () => {
  try {
    const response = await fetch(`${API_BASE}/statistics`);
    if (!response.ok) {
      throw new Error(`Error fetching statistics: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    logError("API: fetchStatistics failed:", error);
    throw error;
  }
};

// ===== UTILITY FUNCTIONS =====

export const seedData = async () => {
  try {
    const response = await fetch(`${API_BASE}/seed-data`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error seeding data: ${response.statusText} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    logError("API: seedData failed:", error);
    throw error;
  }
};

export const clearCache = () => {
  departmentsCache = null;
  subDepartmentsCache = null;
  casesCache = null;
  cacheTimestamp = 0;
};