import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCases, fetchDepartments, fetchSubDepartments, Case } from '@/lib/api';
import { format, addDays, isBefore } from 'date-fns';
import { useApp } from './AppContext';
import { NotificationContext, NotificationType } from './notification-context';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const { currentLang } = useApp();

  // Fetch all cases
  const { data: casesData } = useQuery({
    queryKey: ['cases'],
    queryFn: () => fetchCases(),
  });

  // Fetch departments and sub-departments for mapping
  const { data: departmentsData } = useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
  });

  useEffect(() => {
    const generateNotifications = async () => {
      if (!casesData?.cases) return;

      const allHearings = casesData.cases.filter(
        (caseItem: Case) => caseItem.hearingDate && caseItem.id
      );

      const notificationsWithDeptInfo = await Promise.all(
        allHearings.map(async (caseItem: Case) => {
          // Get department name
          let departmentName = '';
          if (departmentsData) {
            const dept = departmentsData.find(d => d.id === caseItem.department);
            departmentName = currentLang === 'hi' ? dept?.name_hi || dept?.name_en || '' : dept?.name_en || '';
          }

          // Get sub-department name
          let subDepartmentName = '';
          if (caseItem.subDepartment && caseItem.department) {
            try {
              const subDepts = await fetchSubDepartments(caseItem.department);
              const subDept = subDepts.find((sd: any) => sd.id === caseItem.subDepartment);
              subDepartmentName = currentLang === 'hi' ? subDept?.name_hi || subDept?.name_en || '' : subDept?.name_en || '';
            } catch (error) {
              console.error('Error fetching sub-departments:', error);
            }
          }

          return {
            id: `${caseItem.id}-hearing`,
            title: currentLang === 'hi' ? 'सुनवाई की तारीख' : 'Hearing Date',
            message: `${departmentName} ${subDepartmentName}`,
            type: 'hearing',
            date: new Date(caseItem.hearingDate),
            caseId: caseItem.id.toString(),
            departmentName: departmentName,
            subDepartmentName: subDepartmentName
          };
        })
      );

      setNotifications(notificationsWithDeptInfo);
    };

    generateNotifications();
  }, [casesData, departmentsData, currentLang]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const contextValue = useMemo(() => ({
    notifications,
    markAsRead,
    clearAll
  }), [notifications]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
export default NotificationContext;