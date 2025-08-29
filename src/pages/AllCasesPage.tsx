import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, RefreshCw, Filter } from 'lucide-react';
import { fetchCases, fetchSubDepartments, fetchDepartments } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

const AllCasesPage: React.FC = () => {
  const { currentLang } = useApp();
  const { subDepartmentId } = useParams<{ subDepartmentId: string }>();
  const navigate = useNavigate();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchId, setSearchId] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const casesData = await fetchCases({ subDepartment: subDepartmentId });
      setCases(casesData.cases || casesData || []);
    } catch (error) {
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  const translations = {
    en: {
      title: "All Cases",
      subtitle: "All cases across departments",
      totalCases: "Total Cases",
      pendingCases: "Pending Cases",
      resolvedCases: "Resolved Cases"
    },
    hi: {
      title: "सभी मामले",
      subtitle: "सभी विभागों के मामले",
      totalCases: "कुल मामले",
      pendingCases: "लंबित मामले",
      resolvedCases: "निराकृत मामले"
    }
  };
  const t = translations[currentLang];

  const totalCases = cases.length;
  const pendingCases = cases.filter(c => c.status === 'Pending').length;
  const resolvedCases = cases.filter(c => c.status === 'Resolved').length;

  const filteredCases = searchId.trim() === ''
    ? cases
    : cases.filter((caseItem) =>
        (caseItem.caseNumber || caseItem.id || '').toString().toLowerCase().includes(searchId.trim().toLowerCase())
      );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jansunwayi-blue"></div>
          <span className="ml-3 text-jansunwayi-darkgray">
            {currentLang === 'hi' ? 'डेटा लोड हो रहा है...' : 'Loading data...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-jansunwayi-navy">
              {t.title}
            </h1>
            <p className="text-jansunwayi-darkgray mt-2">
              {t.subtitle}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>
            {currentLang === 'hi' ? 'वापस जाएं' : 'Back to Sub-Department'}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-blue-600 text-white">
          <div className="p-4 text-center">
            <h3 className="text-sm font-medium mb-1">{t.totalCases}</h3>
            <p className="text-2xl font-bold">{totalCases}</p>
          </div>
        </Card>
        <Card className="bg-yellow-500 text-white">
          <div className="p-4 text-center">
            <h3 className="text-sm font-medium mb-1">{t.pendingCases}</h3>
            <p className="text-2xl font-bold">{pendingCases}</p>
          </div>
        </Card>
        <Card className="bg-green-600 text-white">
          <div className="p-4 text-center">
            <h3 className="text-sm font-medium mb-1">{t.resolvedCases}</h3>
            <p className="text-2xl font-bold">{resolvedCases}</p>
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex items-center max-w-md">
        <Input
          type="text"
          placeholder={currentLang === 'hi' ? 'मामला आईडी से खोजें' : 'Search by Case ID'}
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="mr-2"
        />
        <Search className="text-gray-400 h-5 w-5" />
      </div>

      {/* Cases Table */}
      <Card className="p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {currentLang === 'hi' ? 'मामला आईडी' : 'Case ID'}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {currentLang === 'hi' ? 'नाम' : 'Name'}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {currentLang === 'hi' ? 'दिनांक' : 'Date'}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {currentLang === 'hi' ? 'स्थिति' : 'Status'}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {currentLang === 'hi' ? 'कार्यवाही' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    {currentLang === 'hi' ? 'कोई मामला नहीं मिला' : 'No cases found'}
                  </td>
                </tr>
              ) : (
                filteredCases.map((caseItem) => (
                  <tr key={caseItem._id || caseItem.id}>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{caseItem.caseNumber || caseItem.id}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{caseItem.name}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{caseItem.filingDate ? format(new Date(caseItem.filingDate), 'yyyy-MM-dd') : '-'}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        caseItem.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {currentLang === 'en' ? caseItem.status : (caseItem.status === 'Pending' ? 'लंबित' : 'निराकृत')}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/case/${caseItem._id || caseItem.id}`)}
                        >
                          {currentLang === 'hi' ? 'विवरण देखें' : 'View Details'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/print-case/${caseItem._id || caseItem.id}`, '_blank')}
                        >
                          {currentLang === 'hi' ? 'प्रिंट' : 'Print'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AllCasesPage; 