
import React from 'react';
import { Card } from '@/components/ui/card';
import { TranslationType } from '@/utils/departmentUtils';

interface CaseSummaryProps {
  totalCases: number;
  resolvedCases: number;
  pendingCases: number;
  t: TranslationType;
}

const CaseSummary: React.FC<CaseSummaryProps> = ({ totalCases, resolvedCases, pendingCases, t }) => {
  return (
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
  );
};

export default CaseSummary;
