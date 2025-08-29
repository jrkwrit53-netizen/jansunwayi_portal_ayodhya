import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw, Filter } from 'lucide-react';
import { fetchCases } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const ContemptCasesPage: React.FC = () => {
  const { currentLang } = useApp();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetchCases();
      // Filter only contempt cases
      const contemptCases = response.cases.filter((caseItem: any) => caseItem.writType === 'Contempt');
      setCases(contemptCases);
    } catch (error) {
      console.error('Error fetching contempt cases:', error);
      toast.error(currentLang === 'hi' ? 'डेटा लोड करने में त्रुटि' : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success(currentLang === 'hi' ? 'डेटा रिफ्रेश किया गया' : 'Data refreshed');
  };

  // Filter cases based on search and status
  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = searchQuery === '' || 
      caseItem.caseNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.petitionNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === '' || caseItem.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const translations = {
    en: {
      title: "Contempt Cases",
      subtitle: "All contempt cases across departments",
      searchPlaceholder: "Search contempt cases...",
      refresh: "Refresh",
      filter: "Filter",
      allStatus: "All Status",
      pending: "Pending",
      resolved: "Resolved",
      caseNumber: "Case Number",
      petitionerName: "Petitioner Name",
      respondentName: "Respondent Name",
      filingDate: "Filing Date",
      status: "Status",
      hearingDate: "Hearing Date",
      department: "Department",
      actions: "Actions",
      viewDetails: "View Details",
      printDetails:"Print Details",
      noCases: "No contempt cases found",
      noCasesMessage: "No contempt cases have been added yet.",
      totalCases: "Total Contempt Cases",
      pendingCases: "Pending Contempt Cases",
      resolvedCases: "Resolved Contempt Cases"
    },
    hi: {
      title: "अवमानना मामले",
      subtitle: "सभी विभागों में अवमानना मामले",
      searchPlaceholder: "अवमानना मामले खोजें...",
      refresh: "रिफ्रेश",
      filter: "फ़िल्टर",
      allStatus: "सभी स्थिति",
      pending: "लंबित",
      resolved: "निपटाया गया",
      caseNumber: "मामला संख्या",
      petitionerName: "याचिकाकर्ता का नाम",
      respondentName: "प्रतिवादी का नाम",
      filingDate: "दाखिल करने की तिथि",
      status: "स्थिति",
      hearingDate: "सुनवाई की तिथि",
      department: "विभाग",
      actions: "कार्रवाई",
      viewDetails: "विवरण देखें",
      printDetails:"मुद्रण विवरण",
      noCases: "कोई अवमानना मामला नहीं मिला",
      noCasesMessage: "अभी तक कोई अवमानना मामला नहीं जोड़ा गया है।",
      totalCases: "कुल अवमानना मामले",
      pendingCases: "लंबित अवमानना मामले",
      resolvedCases: "निपटाए गए अवमानना मामले"
    }
  };

  const t = translations[currentLang];

  const departments = [
    { id: 1, name_en: "Administration Department", name_hi: "प्रशासन विभाग" },
    { id: 2, name_en: "Development department", name_hi: "विकास विभाग" },
    { id: 3, name_en: "District Panchayat Department", name_hi: "जिला पंचायत विभाग" },
    { id: 4, name_en: "District Social Welfare Department", name_hi: "जिला समाज कल्याण विभाग" },
    { id: 5, name_en: "Animal Husbandry Department", name_hi: "पशुपालन विभाग" },
    { id: 6, name_en: "District Industries Department", name_hi: "जिला उद्योग विभाग" },
    { id: 7, name_en: "District Education Department", name_hi: "जिला शिक्षा विभाग" },
    { id: 8, name_en: "District Health Department", name_hi: "जिला स्वास्थ्य विभाग" },
    { id: 9, name_en: "District Agriculture Department", name_hi: "जिला कृषि विभाग" },
    { id: 10, name_en: "District Forest Department", name_hi: "जिला वन विभाग" },
    { id: 11, name_en: "District Program Department", name_hi: "जिला कार्यक्रम विभाग" },
    { id: 12, name_en: "District Food and Marketing Department", name_hi: "जिला खाद्य एवं विपणन विभाग" },
    { id: 13, name_en: "District Food Logistics Department", name_hi: "जिला खाद्य रसद विभाग" },
    { id: 14, name_en: "Agriculture Department", name_hi: "कृषि विभाग" },
    { id: 15, name_en: "Sugarcan Department", name_hi: "गन्ना विभाग" }
  ];

  const getDepartmentName = (id: number) => {
    const dept = departments.find(d => d.id === id);
    return dept ? (currentLang === 'hi' ? dept.name_hi : dept.name_en) : '';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jansunwayi-blue"></div>
        <span className="ml-3 text-jansunwayi-darkgray">
          {currentLang === 'hi' ? 'डेटा लोड हो रहा है...' : 'Loading data...'}
        </span>
      </div>
    );
  }

  const totalCases = cases.length;
  const pendingCases = cases.filter(c => c.status === 'Pending').length;
  const resolvedCases = cases.filter(c => c.status === 'Resolved').length;

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
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-purple-600 text-white">
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

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{t.allStatus}</option>
          <option value="Pending">{t.pending}</option>
          <option value="Resolved">{t.resolved}</option>
        </select>
        
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {t.refresh}
        </Button>
      </div>

      {/* Cases Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.caseNumber}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.petitionerName}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.respondentName}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.department}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.filingDate}
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
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
                    <div>
                      <p className="text-lg font-medium">{t.noCases}</p>
                      <p className="text-sm mt-1">{t.noCasesMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCases.map((caseItem) => (
                  <tr key={caseItem._id || caseItem.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{caseItem.caseNumber}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{caseItem.name}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {getDepartmentName(caseItem.department)}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {caseItem.filingDate ? format(new Date(caseItem.filingDate), 'yyyy-MM-dd') : '-'}
                      </div>
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
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {caseItem.hearingDate ? format(new Date(caseItem.hearingDate), 'yyyy-MM-dd') : '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <Link to={`/case/${caseItem._id || caseItem.id}`}>
                        <Button variant="outline" size="sm">
                          {t.viewDetails}
                        </Button>
                      </Link>
                      <Link to={`/print-case/${caseItem._id || caseItem.id}`}>
                        <Button variant="outline" size="sm">
                          {t.printDetails}
                        </Button>
                      </Link>
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

export default ContemptCasesPage; 