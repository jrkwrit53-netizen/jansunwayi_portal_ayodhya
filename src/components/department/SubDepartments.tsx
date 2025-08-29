import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  TranslationType,
  CaseType,
  generateMockCases
} from '@/utils/departmentUtils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { isWithinDays } from '@/utils/departmentUtils';

interface SubDepartment {
  id: number;
  name_en: string;
  name_hi: string;
}

interface SubDepartmentsProps {
  subDepartments: SubDepartment[];
  currentLang: 'en' | 'hi';
  t: TranslationType;
}

const SubDepartments: React.FC<SubDepartmentsProps> = ({ subDepartments, currentLang, t }) => {
  // Track which sub-departments are open
  const [openSubDepts, setOpenSubDepts] = useState<Record<number, boolean>>({});
  const [newSubDeptName, setNewSubDeptName] = useState('');

  const toggleSubDept = (id: number) => {
    setOpenSubDepts(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const sendReminder = (caseId: string) => {
    toast.success(
      currentLang === 'en'
        ? `Reminder sent for case ${caseId}`
        : `मामला ${caseId} के लिए अनुस्मारक भेजा गया`
    );
  };

  const handleAddSubDepartment = () => {
    const name = prompt('Enter the name of the sub-department:');
    if (name) {
      const newSubDept = {
        id: subDepartments.length + 1,
        name_en: name,
        name_hi: name
      };
      subDepartments.push(newSubDept);
      setNewSubDeptName(name);
    }
  };

  // Calculate totals for all sub-departments
  const allCases = subDepartments.flatMap(subDept => generateMockCases(subDept.id));
  const totalCases = allCases.length;
  const resolvedCases = allCases.filter(c => c.status === 'Resolved').length;
  const pendingCases = totalCases - resolvedCases;

  return (
    <>
      <div className="  flex justify-between items-center mb-4">
        <h2 className=" text-xl font-semibold text-jansunwayi-navy">
          {t.subDepartments}
        </h2>
        <Link to="/add-case">
          <Button className="btn-primary">
            {t.addNewCase}
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {subDepartments.map((subDept) => {
          // Generate mock cases for each sub-department
          const subDeptCases = generateMockCases(subDept.id);
          const totalCases = subDeptCases.length;
          const resolvedCases = subDeptCases.filter(c => c.status === 'Resolved').length;
          const isOpen = openSubDepts[subDept.id] || false;
          
          return (
            <Collapsible
              key={subDept.id}
              open={isOpen}
              onOpenChange={() => toggleSubDept(subDept.id)}
              className="w-full"
            >
              <Card className="hover:shadow-lg transition-shadow">
                <div className="p-4">
                  <CollapsibleTrigger className="flex justify-between items-center w-full text-left">
                    <h3 className="text-lg font-medium">
                      {currentLang === 'hi' ? subDept.name_hi : subDept.name_en}
                    </h3>
                    {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </CollapsibleTrigger>
                  
                  <div className="mt-2 mb-3">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{t.totalCases}:</span> {totalCases}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{t.resolvedCases}:</span> {resolvedCases}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{t.pendingCases}:</span> {totalCases - resolvedCases}
                    </div>
                  </div>
                  
                  <CollapsibleContent>
                    <div className="pt-3 border-t mt-3">
                      <h4 className="font-medium mb-2">{t.recentCases}</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t.caseId}
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t.status}
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t.hearingDate}
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t.actions}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {subDeptCases.map((caseItem) => {
                              const needsReminder = caseItem.status === 'Pending' && caseItem.hearingDate && isWithinDays(caseItem.hearingDate, 7);
                              
                              return (
                                <tr key={caseItem.id} className={needsReminder ? 'bg-red-50' : ''}>
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <div className="text-xs font-medium text-gray-900">{caseItem.id}</div>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      caseItem.status === 'Pending' 
                                        ? 'bg-yellow-100 text-yellow-800' 
                                        : 'bg-green-100 text-green-800'
                                    }`}>
                                      {currentLang === 'en' ? caseItem.status : (caseItem.status === 'Pending' ? t.pending : t.resolved)}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {caseItem.hearingDate ? format(caseItem.hearingDate, 'yyyy-MM-dd') : '-'}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                                    <div className="flex space-x-2">
                                      <Link to={`/case/${caseItem.id}`}>
                                        <Button variant="outline" size="sm">
                                          {t.viewDetails}
                                        </Button>
                                      </Link>
                                      
                                      {needsReminder && (
                                        <Button 
                                          variant="destructive" 
                                          size="sm" 
                                          onClick={() => sendReminder(caseItem.id)}
                                        >
                                          {t.sendReminder}
                                        </Button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CollapsibleContent>
                  
                  <div className="flex justify-end mt-2">
                    <Link to={`/sub-department/${subDept.id}`}>
                      <Button variant="outline" size="sm">
                        {t.viewSubDepartment}
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </Collapsible>
          );
        })}
      </div>
      
      {/* Add summary cards for total cases */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-jansunwayi-blue text-white">
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">{t.totalCases}</h3>
            <p className="text-3xl font-bold">{totalCases}</p>
          </div>
        </Card>
        
        <Card className="bg-jansunwayi-green text-white">
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">{t.resolvedCases}</h3>
            <p className="text-3xl font-bold">{resolvedCases}</p>
          </div>
        </Card>
        
        <Card className="bg-jansunwayi-saffron text-white">
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">{t.pendingCases}</h3>
            <p className="text-3xl font-bold">{pendingCases}</p>
          </div>
        </Card>
      </div>
    </>
  );
};

export default SubDepartments;
