import React from 'react';
import { useLocation } from 'react-router-dom';

const CasesPage: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const department = params.get('department');
  const status = params.get('status');

  return (
    <div>
      <h2>Cases for Department {department}, Status: {status}</h2>
      {/* Render filtered cases here */}
    </div>
  );
};

export default CasesPage; 