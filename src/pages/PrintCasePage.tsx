import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import Header from '@/components/Header';
import CourtNoticeWriter from '@/components/NoticeWriter';

const PrintCasePage: React.FC = () => {
  const { currentLang, isLoggedIn, toggleLanguage } = useApp();
  const { id } = useParams<{ id: string }>();
  
  useEffect(() => {
    // Debug log
    console.log('Printing case with ID:', id);
  }, [id]);

  return (
    <>
      <Header isLoggedIn={isLoggedIn} currentLang={currentLang} toggleLanguage={toggleLanguage} />
      <CourtNoticeWriter caseId={id} />
    </>
  );
}
export default PrintCasePage;

