import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import DashboardChart from '@/components/department/DashboardChart';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { fetchCaseById, fetchCaseByNumber } from '@/lib/api';
import { toast } from 'sonner';

const HomePage: React.FC = () => {
  const { currentLang } = useApp();
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setSearching(true);
    try {
      const id = searchId.trim();
      // Check if id is a valid 24-char hex string (MongoDB ObjectId)
      const isObjectId = /^[a-fA-F0-9]{24}$/.test(id);
      if (isObjectId) {
        await fetchCaseById(id);
        navigate(`/case/${id}`);
      } else {
        // Try by case number
        const caseData = await fetchCaseByNumber(id);
        navigate(`/case/${caseData._id || caseData.id}`);
      }
    } catch (err) {
      toast.error(currentLang === 'hi' ? 'मामला नहीं मिला' : 'Case not found');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
          onClick={() => navigate('/all-cases')}
        >
          {currentLang === 'hi' ? 'सभी मामले' : 'All Cases'}
        </button>
      </div>
      {/* Search Bar for Case ID */}
      <div className="flex items-center gap-2 mb-6 max-w-md">
        <Input
          type="text"
          placeholder={currentLang === 'hi' ? 'मामला आईडी या क्रमांक संख्या से खोजें' : 'Search by Case ID or Number'}
          value={searchId}
          onChange={e => setSearchId(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
          disabled={searching}
        />
        <Button onClick={handleSearch} disabled={searching || !searchId.trim()} variant="outline">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      <h1 className="text-2xl font-bold mb-4">
        {currentLang === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}
      </h1>
      <DashboardChart currentLang={currentLang} />
    </div>
  );
};

export default HomePage; 