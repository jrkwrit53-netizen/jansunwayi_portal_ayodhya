import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Building2, ArrowLeft, Plus, List, Loader2 } from 'lucide-react';
import AddSubDepartmentForm from '@/components/AddSubDepartmentForm';
import { uploadDepartmentsToFirestore } from '@/utils/departmentUtils';
import { saveSubDepartment, fetchDepartments, fetchSubDepartments, fetchCases, fetchCaseById, fetchCaseByNumber } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Types } from "mongoose";



const DashboardPage: React.FC = () => {
  const { currentLang } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddSubDept, setShowAddSubDept] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [caseSearchId, setCaseSearchId] = useState('');
  const [caseSearching, setCaseSearching] = useState(false);
  const [caseSearchResults, setCaseSearchResults] = useState<any[]>([]);
  const [showCaseResults, setShowCaseResults] = useState(false);

  // Fetch sub-departments for the selected department
  const { data: subDepartments, isLoading: loadingSubDepts } = useQuery({
    queryKey: ['subDepartments', selectedDeptId],
    queryFn: () => selectedDeptId ? fetchSubDepartments(selectedDeptId) : Promise.resolve([]),
    enabled: !!selectedDeptId,
  });

  // Fetch all cases
  const { data: casesData, isLoading: loadingCases } = useQuery({
    queryKey: ['cases'],
    queryFn: async () => fetchCases(),
    enabled: !!selectedDeptId,
  });

  useEffect(() => {
    fetchDepartmentsFromDB();
  }, []);

  const fetchDepartmentsFromDB = async () => {
    try {
      setLoading(true);
      const data = await fetchDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      // Fallback to static data if database fails
      setDepartments([
        { id: 1, name_en: "Administration Department", name_hi: "प्रशासन विभाग" },
        { id: 2, name_en: "Development department", name_hi: "विकास विभाग" },
        // ... add more static departments as fallback
      ]);
    } finally {
      setLoading(false);
    }
  };

  const translations = {
    en: {
      title: "Department List",
      subtitle: "Select a department to view its reports",
      searchPlaceholder: "Search departments..."
    },
    hi: {
      title: "विभाग सूची",
      subtitle: "रिपोर्ट देखने के लिए एक विभाग चुनें",
      searchPlaceholder: "विभाग खोजें..."
    }
  };
  
  const t = translations[currentLang];

  // Filter departments based on search query
  const filteredDepartments = departments.filter(dept => {
    const searchLower = searchQuery.toLowerCase();
    const nameEn = dept.name_en || '';
    const nameHi = dept.name_hi || '';
    
    return (
      nameEn.toLowerCase().includes(searchLower) ||
      nameHi.includes(searchQuery)
    );
  });
  
  // Dummy handler for form submit
  const handleAddSubDepartment = async (departmentId: number, subDeptNameEn: string, subDeptNameHi: string) => {
    try {
      console.log('Adding sub-department:', { departmentId, subDeptNameEn, subDeptNameHi });
      
      const result = await saveSubDepartment(departmentId, subDeptNameEn, subDeptNameHi);
      console.log('Sub-department added successfully:', result);
      
      toast.success(currentLang === 'hi' ? 'उप-विभाग सफलतापूर्वक जोड़ा गया' : 'Sub-department added successfully');
      setShowAddSubDept(false);
      
      // Force refresh of all data
      await fetchDepartmentsFromDB();
      
      // Show success message with details
      toast.success(
        currentLang === 'hi' 
          ? `उप-विभाग "${subDeptNameHi}" सफलतापूर्वक जोड़ा गया` 
          : `Sub-department "${subDeptNameEn}" added successfully`
      );
    } catch (error) {
      console.error('Error adding sub-department:', error);
      toast.error(currentLang === 'hi' ? 'उप-विभाग जोड़ने में त्रुटि' : 'Error adding sub-department');
    }
  };

  const handleUploadDepartments = async () => {
    await uploadDepartmentsToFirestore(departments); // <-- departments pass karein
    alert('Departments uploaded to Firestore!');
  };

  const handleCaseSearch = async () => {
    if (!caseSearchId.trim()) return;
    setCaseSearching(true);
    setShowCaseResults(false);
    setCaseSearchResults([]);
    try {
      const input = caseSearchId.trim();
      if (/^\d+$/.test(input)) {
        // Numeric: search by case number
        const caseData = await fetchCaseByNumber(input);
        window.location.href = `/case/${caseData._id || caseData.id}`;
      } else {
        // Text: search by name (case-insensitive)
        const allCases = await fetchCases();
        const matches = (allCases.cases || allCases).filter((c: any) =>
          c.name && c.name.toLowerCase().includes(input.toLowerCase())
        );
        if (matches.length === 1) {
          window.location.href = `/case/${matches[0]._id || matches[0].id}`;
        } else if (matches.length > 1) {
          setCaseSearchResults(matches);
          setShowCaseResults(true);
        } else {
          toast.error(currentLang === 'hi' ? 'कोई मामला नहीं मिला' : 'No case found');
        }
      }
    } catch (err) {
      toast.error(currentLang === 'hi' ? 'कोई मामला नहीं मिला' : 'No case found');
    } finally {
      setCaseSearching(false);
    }
  };

  // Calculate stats for each sub-department
  const subDepartmentStats = subDepartments?.map(subDept => {
    const subDeptCases = casesData?.cases?.filter(c => 
      c.subDepartment && c.subDepartment._id === subDept._id
    ) || [];

    return {
      id: subDept._id,
      name: currentLang === 'hi' ? subDept.name_hi : subDept.name_en,
      total: subDeptCases.length,
      pending: subDeptCases.filter(c => c.status === 'Pending').length,
      resolved: subDeptCases.filter(c => c.status === 'Resolved').length,
    };
  }) || [];

  if (selectedDeptId) {
    const selectedDept = departments.find(d => d.id === selectedDeptId);
    const deptName = currentLang === 'hi' ? selectedDept.name_hi : selectedDept.name_en;

    return (
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-6 bg-white rounded-lg p-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">
                {deptName}
              </h1>
            </div>
            <p className="text-gray-600">
              {currentLang === 'hi' ? 'उप-विभाग रिपोर्ट' : 'Sub-Department Reports'}
            </p>
          </div>
          <Button
            onClick={() => setSelectedDeptId(null)}
            variant="outline"
            className="px-4 py-2 flex items-center gap-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            {currentLang === 'hi' ? 'वापस' : 'Back'}
          </Button>
        </div>

        {(loadingSubDepts || loadingCases) ? (
          <div className="flex items-center justify-center h-[300px] bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-3 text-blue-600">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-lg font-semibold">
                {currentLang === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subDepartmentStats.map((subDept) => (
              <Card key={subDept.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-t-4 border-blue-500">
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    {subDept.name}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-white p-3 rounded-lg border border-blue-100">
                      <span className="text-blue-700 font-medium">
                        {currentLang === 'hi' ? 'कुल मामले' : 'Total Cases'}
                      </span>
                      <span className="text-xl font-bold text-blue-700">{subDept.total}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gradient-to-r from-yellow-50 to-white p-3 rounded-lg border border-yellow-100">
                      <span className="text-yellow-700 font-medium">
                        {currentLang === 'hi' ? 'लंबित मामले' : 'Pending Cases'}
                      </span>
                      <span className="text-xl font-bold text-yellow-700">{subDept.pending}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gradient-to-r from-green-50 to-white p-3 rounded-lg border border-green-100">
                      <span className="text-green-700 font-medium">
                        {currentLang === 'hi' ? 'निराकृत मामले' : 'Resolved Cases'}
                      </span>
                      <span className="text-xl font-bold text-green-700">{subDept.resolved}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4">
      {/* Case Search Bar */}
      <div className="flex items-center gap-2 mb-6 max-w-md">
        <Input
          type="text"
          placeholder={currentLang === 'hi' ? 'मामला आईडी, क्रमांक संख्या या नाम से खोजें' : 'Search by Case ID, Number, or Name'}
          value={caseSearchId}
          onChange={e => setCaseSearchId(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleCaseSearch(); }}
          disabled={caseSearching}
        />
        <Button onClick={handleCaseSearch} disabled={caseSearching || !caseSearchId.trim()} variant="outline">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      {showCaseResults && caseSearchResults.length > 0 && (
        <div className="mb-6 bg-white rounded shadow p-4 max-w-md">
          <div className="font-semibold mb-2">{currentLang === 'hi' ? 'मिलते-जुलते मामले' : 'Matching Cases'}</div>
          <ul>
            {caseSearchResults.map((c) => (
              <li key={c._id || c.id} className="py-2 border-b last:border-b-0 flex justify-between items-center">
                <span>{c.caseNumber} - {c.name}</span>
                <Button size="sm" variant="outline" onClick={() => window.location.href = `/case/${c._id || c.id}`}>{currentLang === 'hi' ? 'विवरण' : 'Details'}</Button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">
            {currentLang === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}
          </h1>
        </div>
        <p className="text-gray-600">
          {currentLang === 'hi' ? 'सभी विभागों की जानकारी' : 'Information for all departments'}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48 bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-3 text-blue-600">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-lg font-semibold">
              {currentLang === 'hi' ? 'डेटा लोड हो रहा है...' : 'Loading data...'}
            </span>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-white rounded-lg p-4 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder={currentLang === 'hi' ? 'विभाग खोजें...' : 'Search departments...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-2"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowAddSubDept(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 h-auto flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {currentLang === 'hi' ? 'उप विभाग जोड़ें' : 'Add Sub Department'}
              </Button>
              <Link to="/sub-departments">
                <Button 
                  variant="outline" 
                  className="px-4 py-2 h-auto flex items-center gap-2 hover:bg-gray-100"
                >
                  <List className="h-4 w-4" />
                  {currentLang === 'hi' ? 'सभी उप-विभाग देखें' : 'View All Sub-Departments'}
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepartments.map((department) => (
              <Card 
                key={department.id} 
                className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-t-4 border-blue-500"
                onClick={() => setSelectedDeptId(department.id)}
              >
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-5 w-5 text-blue-600 group-hover:text-blue-700 transition-colors" />
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {currentLang === 'hi' ? department.name_hi : department.name_en}
                    </h3>
                  </div>
                  <p className="text-gray-600 group-hover:text-gray-700 transition-colors text-sm">
                    {currentLang === 'hi' ? 'विभागीय जानकारी देखने के लिए क्लिक करें' : 'Click to view department information'}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {showAddSubDept && (
        <AddSubDepartmentForm
          departments={departments}
          currentLang={currentLang}
          onSubmit={handleAddSubDepartment}
          onClose={() => setShowAddSubDept(false)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
