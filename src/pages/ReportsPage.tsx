import React from 'react';
import { useApp } from '@/contexts/AppContext';
import DashboardChart from '@/components/department/DashboardChart';
import Header from '@/components/Header';

const ReportsPage: React.FC = () => {
  const { currentLang, isLoggedIn, toggleLanguage } = useApp();

  return (
    <div>
      <Header isLoggedIn={isLoggedIn} currentLang={currentLang} toggleLanguage={toggleLanguage} />
      <div>
        <DashboardChart currentLang={currentLang} />
      </div>
    </div>
  );
};

export default ReportsPage;