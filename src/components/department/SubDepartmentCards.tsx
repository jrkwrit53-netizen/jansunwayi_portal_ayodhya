import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCases, fetchSubDepartments } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  departmentId: number;
  currentLang: 'en' | 'hi';
  onBack: () => void;
}

const SubDepartmentCards: React.FC<Props> = ({ departmentId, currentLang, onBack }) => {
  // Fetch sub-departments for the selected department
  const { data: subDepartments, isLoading: loadingSubDepts } = useQuery({
    queryKey: ['subDepartments', departmentId],
    queryFn: () => fetchSubDepartments(departmentId),
  });

  // Fetch all cases
  const { data: casesData, isLoading: loadingCases } = useQuery({
    queryKey: ['cases'],
    queryFn: fetchCases,
  });

  if (loadingSubDepts || loadingCases) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-blue-600 text-lg font-semibold">
          {currentLang === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}
        </div>
      </div>
    );
  }

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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {currentLang === 'hi' ? 'उप-विभाग रिपोर्ट' : 'Sub-Department Reports'}
        </h2>
        <Button
          onClick={onBack}
          variant="outline"
          className="px-4 py-2"
        >
          {currentLang === 'hi' ? 'वापस' : 'Back'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subDepartmentStats.map((subDept) => (
          <Card key={subDept.id} className="overflow-hidden hover:shadow-lg transition-all duration-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 min-h-[3rem]">
                {subDept.name}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-blue-50 p-2 rounded">
                  <span className="text-blue-700 font-medium">
                    {currentLang === 'hi' ? 'कुल मामले' : 'Total Cases'}:
                  </span>
                  <span className="text-blue-700 font-bold">{subDept.total}</span>
                </div>
                <div className="flex justify-between items-center bg-yellow-50 p-2 rounded">
                  <span className="text-yellow-700 font-medium">
                    {currentLang === 'hi' ? 'लंबित मामले' : 'Pending Cases'}:
                  </span>
                  <span className="text-yellow-700 font-bold">{subDept.pending}</span>
                </div>
                <div className="flex justify-between items-center bg-green-50 p-2 rounded">
                  <span className="text-green-700 font-medium">
                    {currentLang === 'hi' ? 'निराकृत मामले' : 'Resolved Cases'}:
                  </span>
                  <span className="text-green-700 font-bold">{subDept.resolved}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SubDepartmentCards; 