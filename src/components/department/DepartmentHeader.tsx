
import React from 'react';
import { TranslationType } from '@/utils/departmentUtils';

interface DepartmentHeaderProps {
  title: string;
  t: TranslationType;
}

const DepartmentHeader: React.FC<DepartmentHeaderProps> = ({ title, t }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-jansunwayi-navy">
        {t.title} - {title}
      </h1>
    </div>
  );
};

export default DepartmentHeader;
