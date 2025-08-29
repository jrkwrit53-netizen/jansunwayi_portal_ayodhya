export const fetchCaseById = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE}/cases/${id}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching case: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    logError("API: fetchCaseById failed:", error);
    throw error;
  }
};
