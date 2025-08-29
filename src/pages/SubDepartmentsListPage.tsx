import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, Plus, Eye } from 'lucide-react';
import { fetchSubDepartments, fetchDepartments } from '@/lib/api';
import { toast } from 'sonner';
import AddSubDepartmentForm from '@/components/AddSubDepartmentForm';
import { useNavigate } from 'react-router-dom';

const SubDepartmentsListPage: React.FC = () => {
  const { currentLang } = useApp();
  const navigate = useNavigate();
  const [subDepartments, setSubDepartments] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('SubDepartmentsListPage: Fetching data...');
      
      const [subDeptsData, deptsData] = await Promise.all([
        fetchSubDepartments(),
        fetchDepartments()
      ]);
      
      console.log('SubDepartmentsListPage: Received sub-departments:', subDeptsData);
      console.log('SubDepartmentsListPage: Received departments:', deptsData);
      
      setSubDepartments(subDeptsData);
      setDepartments(deptsData);
    } catch (error) {
      console.error('SubDepartmentsListPage: Error fetching data:', error);
      toast.error(currentLang === 'hi' ? 'डेटा लोड करने में त्रुटि' : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success(currentLang === 'hi' ? 'डेटा रिफ्रेश किया गया' : 'Data refreshed');
  };

  const handleAddSubDepartment = async (departmentId: number, subDeptNameEn: string, subDeptNameHi: string) => {
    try {
      console.log('SubDepartmentsListPage: Adding sub-department:', { departmentId, subDeptNameEn, subDeptNameHi });
      
      // Import the saveSubDepartment function
      const { saveSubDepartment } = await import('@/lib/api');
      const result = await saveSubDepartment(departmentId, subDeptNameEn, subDeptNameHi);
      
      console.log('SubDepartmentsListPage: Sub-department added successfully:', result);
      
      toast.success(currentLang === 'hi' ? 'उप-विभाग सफलतापूर्वक जोड़ा गया' : 'Sub-department added successfully');
      setShowAddForm(false);
      
      // Refresh the data to show the new sub-department
      await fetchData();
    } catch (error) {
      console.error('SubDepartmentsListPage: Error adding sub-department:', error);
      toast.error(currentLang === 'hi' ? 'उप-विभाग जोड़ने में त्रुटि' : 'Error adding sub-department');
    }
  };

  const handleSubDepartmentClick = (subDeptId: string) => {
    navigate(`/add-case?subDepartment=${subDeptId}`);
  };

  const handleViewCases = (subDeptId: string) => {
    navigate(`/all-cases/${subDeptId}`);
  };

  // Filter sub-departments based on search query and selected department
  const filteredSubDepts = subDepartments.filter(subDept => {
    const matchesSearch = searchQuery === '' || 
      subDept.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subDept.name_hi?.includes(searchQuery);
    
    const matchesDepartment = selectedDepartment === '' || 
      subDept.departmentId === parseInt(selectedDepartment);
    
    return matchesSearch && matchesDepartment;
  });

  // Get department name for a sub-department
  const getDepartmentName = (departmentId: number) => {
    const dept = departments.find(d => d.id === departmentId);
    return currentLang === 'hi' ? dept?.name_hi : dept?.name_en;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jansunwayi-blue"></div>
          <span className="ml-3 text-jansunwayi-darkgray">
            {currentLang === 'hi' ? 'डेटा लोड हो रहा है...' : 'Loading data...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-jansunwayi-navy">
          {currentLang === 'hi' ? 'सभी उप-विभाग' : 'All Sub-Departments'}
        </h1>
        <p className="text-jansunwayi-darkgray mt-2">
          {currentLang === 'hi' ? 'सभी विभागों के उप-विभागों की सूची' : 'List of all sub-departments across departments'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder={currentLang === 'hi' ? 'उप-विभाग खोजें...' : 'Search sub-departments...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{currentLang === 'hi' ? 'सभी विभाग' : 'All Departments'}</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>
              {currentLang === 'hi' ? dept.name_hi : dept.name_en}
            </option>
          ))}
        </select>
        
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {currentLang === 'hi' ? 'रिफ्रेश' : 'Refresh'}
          </Button>
          
          <Button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            {currentLang === 'hi' ? 'उप-विभाग जोड़ें' : 'Add Sub-Department'}
          </Button>
        </div>
      </div>

      {/* Sub-Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubDepts.map((subDept) => (
          <Card 
            key={subDept._id} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleSubDepartmentClick(subDept._id || subDept.id.toString())}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-jansunwayi-navy">
                  {currentLang === 'hi' ? subDept.name_hi : subDept.name_en}
                </h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  ID: {subDept.departmentId}
                </span>
              </div>
              
              <p className="text-sm text-jansunwayi-darkgray mb-3">
                {currentLang === 'hi' ? subDept.name_en : subDept.name_hi}
              </p>
              
              <div className="text-xs text-gray-500 mb-3">
                <p><strong>{currentLang === 'hi' ? 'विभाग:' : 'Department:'}</strong> {getDepartmentName(subDept.departmentId)}</p>
                <p><strong>{currentLang === 'hi' ? 'बनाया गया:' : 'Created:'}</strong> {new Date(subDept.createdAt).toLocaleDateString()}</p>
              </div>

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
          </Card>
        ))}
      </div>

      {filteredSubDepts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {currentLang === 'hi' ? 'कोई उप-विभाग नहीं मिला' : 'No sub-departments found'}
          </p>
          <p className="text-gray-400 mt-2">
            {currentLang === 'hi' ? 'अलग खोज मापदंड आज़माएं या नया उप-विभाग जोड़ें' : 'Try different search criteria or add a new sub-department'}
          </p>
        </div>
      )}

      {showAddForm && (
        <AddSubDepartmentForm
          departments={departments}
          currentLang={currentLang}
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddSubDepartment}
        />
      )}
    </div>
  );
};

export default SubDepartmentsListPage; 