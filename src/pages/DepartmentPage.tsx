import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import DepartmentHeader from '@/components/department/DepartmentHeader';
import SubDepartments from '@/components/department/SubDepartments';
import { 
  departments, 
  subDepartments, 
  translations
} from '@/utils/departmentUtils';
import { fetchSubDepartments, fetchDepartments } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw, Eye, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const DepartmentPage: React.FC = () => {
  const { currentLang } = useApp();
  const { departmentId } = useParams<{ departmentId: string }>();
  const navigate = useNavigate();
  const [showSubDepartments, setShowSubDepartments] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [subDepartments, setSubDepartments] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  useEffect(() => {
    fetchData();
  }, [departmentId]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('DepartmentPage: Fetching data for departmentId:', departmentId);
      
      const [subDeptsData, deptsData] = await Promise.all([
        fetchSubDepartments(departmentId ? parseInt(departmentId) : undefined),
        fetchDepartments()
      ]);
      
      console.log('DepartmentPage: Received sub-departments:', subDeptsData);
      console.log('DepartmentPage: Received departments:', deptsData);
      
      setSubDepartments(subDeptsData);
      setDepartments(deptsData);
      
      // Show sub-departments for department ID 1 (for the example)
      if (departmentId) {
        setShowSubDepartments(Number(departmentId) === 1);
      }
    } catch (error) {
      console.error('DepartmentPage: Error fetching data:', error);
      // Fallback to static data
      setSubDepartments([]);
      setDepartments([
        { id: 1, name_en: "Administration Department", name_hi: "प्रशासन विभाग" },
        { id: 2, name_en: "Development department", name_hi: "विकास विभाग" },
        // ... add more static departments as fallback
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleSubDepartmentClick = (subDeptId: string) => {
    navigate(`/add-case?subDepartment=${subDeptId}`);
  };

  const handleViewCases = (subDeptId: string) => {
    navigate(`/all-cases/${subDeptId}`);
  };
  
  // Get the current department
  const department = departments.find(dept => dept.id === Number(departmentId));

  // Filter sub-departments for the current department
  const departmentSubDepts = subDepartments.filter(subDept => 
    subDept.departmentId === Number(departmentId)
  );

  console.log('DepartmentPage: Current department:', department);
  console.log('DepartmentPage: All sub-departments:', subDepartments);
  console.log('DepartmentPage: Filtered sub-departments for department', departmentId, ':', departmentSubDepts);

  // Filter sub-departments based on search query
  const filteredSubDepts = departmentSubDepts.filter(subDept => {
    const searchLower = searchQuery.toLowerCase();
    const nameEn = subDept.name_en?.toLowerCase() || '';
    const nameHi = subDept.name_hi?.toLowerCase() || '';
    return nameEn.includes(searchLower) || nameHi.includes(searchLower);
  });

  console.log('DepartmentPage: Filtered sub-departments after search:', filteredSubDepts);
  
  const t = translations[currentLang];
  const departmentName = currentLang === 'hi' ? department?.name_hi : department?.name_en;
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-jansunwayi-navy">
          {departmentName || 'Department'}
        </h1>
        <p className="text-jansunwayi-darkgray mt-2">
          {currentLang === 'hi' ? 'विभाग विवरण और उप-विभाग' : 'Department Details and Sub-Departments'}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jansunwayi-blue"></div>
          <span className="ml-3 text-jansunwayi-darkgray">
            {currentLang === 'hi' ? 'डेटा लोड हो रहा है...' : 'Loading data...'}
          </span>
        </div>
      ) : (
        <>
          {/* Sub-Departments Section */}
          <Card className="mb-6">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-jansunwayi-navy">
                  {currentLang === 'hi' ? 'उप-विभाग' : 'Sub-Departments'}
                </h2>
                <Button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  {currentLang === 'hi' ? 'रिफ्रेश' : 'Refresh'}
                </Button>
              </div>
              
              {departmentSubDepts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departmentSubDepts.map((subDept) => (
                    <div 
                      key={subDept._id || subDept.id} 
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleSubDepartmentClick(subDept._id || subDept.id.toString())}
                    >
                      <h3 className="font-semibold text-jansunwayi-navy mb-2">
                        {currentLang === 'hi' ? subDept.name_hi : subDept.name_en}
                      </h3>
                      <p className="text-sm text-jansunwayi-darkgray mb-3">
                        {currentLang === 'hi' ? subDept.name_en : subDept.name_hi}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubDepartmentClick(subDept._id || subDept.id.toString());
                          }}
                          size="sm"
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          {currentLang === 'hi' ? 'मामला जोड़ें' : 'Add Case'}
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewCases(subDept._id || subDept.id.toString());
                          }}
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {currentLang === 'hi' ? 'कोई उप-विभाग नहीं मिला' : 'No sub-departments found'}
                </div>
              )}
            </div>
          </Card>

          {/* Search Section */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder={currentLang === 'hi' ? 'उप-विभाग खोजें...' : 'Search sub-departments...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtered Results */}
          {filteredSubDepts.length > 0 && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-jansunwayi-navy mb-4">
                  {currentLang === 'hi' ? 'खोज परिणाम' : 'Search Results'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSubDepts.map((subDept) => (
                    <div 
                      key={subDept._id || subDept.id} 
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleSubDepartmentClick(subDept._id || subDept.id.toString())}
                    >
                      <h3 className="font-semibold text-jansunwayi-navy mb-2">
                        {currentLang === 'hi' ? subDept.name_hi : subDept.name_en}
                      </h3>
                      <p className="text-sm text-jansunwayi-darkgray mb-3">
                        {currentLang === 'hi' ? subDept.name_en : subDept.name_hi}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubDepartmentClick(subDept._id || subDept.id.toString());
                          }}
                          size="sm"
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          {currentLang === 'hi' ? 'मामला जोड़ें' : 'Add Case'}
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewCases(subDept._id || subDept.id.toString());
                          }}
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default DepartmentPage;
