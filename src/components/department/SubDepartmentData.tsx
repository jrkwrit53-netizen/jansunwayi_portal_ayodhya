import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCases, fetchSubDepartments } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface Props {
  departmentId: number;
  currentLang: 'en' | 'hi';
  onBack: () => void;
}

const SubDepartmentData: React.FC<Props> = ({ departmentId, currentLang, onBack }) => {
  const navigate = useNavigate();
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
    <div>
      <div className="flex justify-between items-center mb-6 px-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {currentLang === 'hi' ? 'उप-विभाग रिपोर्ट' : 'Sub-Department Reports'}
        </h2>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow-lg hover:bg-blue-700 transition-colors"
        >
          {currentLang === 'hi' ? 'वापस' : 'Back'}
        </button>
      </div>

      <div className="overflow-x-auto p-4">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead>
            <tr className="bg-blue-100 text-gray-800">
              <th className="py-3 px-4 border-b font-bold">#</th>
              <th className="py-3 px-4 border-b text-left font-bold">
                {currentLang === 'hi' ? 'उप-विभाग' : 'Sub-Department'}
              </th>
              <th className="py-3 px-4 border-b text-center text-blue-700 font-bold">
                {currentLang === 'hi' ? 'कुल मामले' : 'Total Cases'}
              </th>
              <th className="py-3 px-4 border-b text-center text-yellow-600 font-bold">
                {currentLang === 'hi' ? 'लंबित मामले' : 'Pending Cases'}
              </th>
              <th className="py-3 px-4 border-b text-center text-green-700 font-bold">
                {currentLang === 'hi' ? 'निराकृत मामले' : 'Resolved Cases'}
              </th>
            </tr>
          </thead>
          <tbody>
            {subDepartmentStats.map((item, index) => (
              <tr
                key={item.id}
                className="hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/all-cases/${item.id}`)}
              >
                <td className="py-3 px-4 border-b text-center font-semibold">{index + 1}</td>
                <td className="py-3 px-4 border-b font-semibold">{item.name}</td>
                <td className="py-3 px-4 border-b text-center bg-blue-50 text-blue-700 font-semibold">
                  {item.total}
                </td>
                <td className="py-3 px-4 border-b text-center bg-yellow-50 text-yellow-600 font-semibold">
                  {item.pending}
                </td>
                <td className="py-3 px-4 border-b text-center bg-green-50 text-green-700 font-semibold">
                  {item.resolved}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubDepartmentData;
