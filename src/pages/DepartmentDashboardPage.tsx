import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { fetchCases } from '@/lib/api';
import { format } from 'date-fns';

interface Case {
  id: string;
  caseNumber?: string;
  date: string;
  status: 'Pending' | 'Resolved';
  hearingDate?: string;
  writType?: string;
  department: number;
  subDepartment?: any;
}

const DepartmentDashboardPage: React.FC = () => {
  const { departmentId } = useParams<{ departmentId: string }>();
  const { currentLang } = useApp();
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentName, setDepartmentName] = useState('');

  const departments = [
    { id: 1, name_en: "Administration Department", name_hi: "प्रशासन विभाग" },
    { id: 2, name_en: "Police Department", name_hi: "पुलिस विभाग" },
    { id: 3, name_en: "Revenue Department", name_hi: "राजस्व विभाग" },
    { id: 4, name_en: "Education Department", name_hi: "शिक्षा विभाग" },
    { id: 5, name_en: "Health Department", name_hi: "स्वास्थ्य विभाग" },
    { id: 6, name_en: "Public Works Department", name_hi: "लोक निर्माण विभाग" },
    { id: 7, name_en: "Transport Department", name_hi: "परिवहन विभाग" },
    { id: 8, name_en: "Urban Development Department", name_hi: "शहरी विकास विभाग" },
    { id: 9, name_en: "Rural Development Department", name_hi: "ग्रामीण विकास विभाग" },
    { id: 10, name_en: "Agriculture Department", name_hi: "कृषि विभाग" },
    { id: 11, name_en: "Forest Department", name_hi: "वन विभाग" },
    { id: 12, name_en: "Water Resources Department", name_hi: "जल संसाधन विभाग" },
    { id: 13, name_en: "Energy Department", name_hi: "ऊर्जा विभाग" },
    { id: 14, name_en: "Industrial Development Department", name_hi: "औद्योगिक विकास विभाग" },
    { id: 15, name_en: "Tourism Department", name_hi: "पर्यटन विभाग" },
    { id: 16, name_en: "Sports Department", name_hi: "खेल विभाग" },
    { id: 17, name_en: "Culture Department", name_hi: "संस्कृति विभाग" },
    { id: 18, name_en: "Women and Child Development Department", name_hi: "महिला एवं बाल विकास विभाग" },
    { id: 19, name_en: "Social Welfare Department", name_hi: "सामाजिक कल्याण विभाग" },
    { id: 20, name_en: "Minority Welfare Department", name_hi: "अल्पसंख्यक कल्याण विभाग" },
    { id: 21, name_en: "Backward Classes Welfare Department", name_hi: "पिछड़ा वर्ग कल्याण विभाग" },
    { id: 22, name_en: "Scheduled Castes Welfare Department", name_hi: "अनुसूचित जाति कल्याण विभाग" },
    { id: 23, name_en: "Scheduled Tribes Welfare Department", name_hi: "अनुसूचित जनजाति कल्याण विभाग" },
    { id: 24, name_en: "Disability Welfare Department", name_hi: "दिव्यांग कल्याण विभाग" },
    { id: 25, name_en: "Senior Citizens Welfare Department", name_hi: "वरिष्ठ नागरिक कल्याण विभाग" },
    { id: 26, name_en: "Youth Affairs Department", name_hi: "युवा कार्य विभाग" },
    { id: 27, name_en: "Information Technology Department", name_hi: "सूचना प्रौद्योगिकी विभाग" },
    { id: 28, name_en: "Science and Technology Department", name_hi: "विज्ञान एवं प्रौद्योगिकी विभाग" },
    { id: 29, name_en: "Environment Department", name_hi: "पर्यावरण विभाग" },
    { id: 30, name_en: "Climate Change Department", name_hi: "जलवायु परिवर्तन विभाग" },
    { id: 31, name_en: "Disaster Management Department", name_hi: "आपदा प्रबंधन विभाग" },
    { id: 32, name_en: "Food and Civil Supplies Department", name_hi: "खाद्य एवं नागरिक आपूर्ति विभाग" },
    { id: 33, name_en: "Consumer Affairs Department", name_hi: "उपभोक्ता मामले विभाग" },
    { id: 34, name_en: "Legal Metrology Department", name_hi: "कानूनी माप विभाग" },
    { id: 35, name_en: "Weights and Measures Department", name_hi: "तौल एवं माप विभाग" },
    { id: 36, name_en: "Standards Department", name_hi: "मानक विभाग" },
    { id: 37, name_en: "Quality Control Department", name_hi: "गुणवत्ता नियंत्रण विभाग" },
    { id: 38, name_en: "Testing Department", name_hi: "परीक्षण विभाग" },
    { id: 39, name_en: "Certification Department", name_hi: "प्रमाणन विभाग" },
    { id: 40, name_en: "Inspection Department", name_hi: "निरीक्षण विभाग" },
    { id: 41, name_en: "Monitoring Department", name_hi: "निगरानी विभाग" },
    { id: 42, name_en: "Evaluation Department", name_hi: "मूल्यांकन विभाग" },
    { id: 43, name_en: "Assessment Department", name_hi: "आकलन विभाग" },
    { id: 44, name_en: "Planning Department", name_hi: "योजना विभाग" },
    { id: 45, name_en: "Public Works Department Electrical & Mechanical Section", name_hi: "लोक निर्माण विभाग विद्युत यांत्रिक खण्ड" },
    { id: 46, name_en: "Cooperative Department", name_hi: "सहकारिता विभाग" },
    { id: 47, name_en: "UPPCL U.P. Project Corporation Ltd. Construction Unit-11 Ayodhya", name_hi: "यूपीपीसीएल उ0 प्र0 प्रोजेक्ट कारपोरेशन लि0 निर्माण इकाई-11 अयोध्या।" },
    { id: 48, name_en: "Other Miscellaneous Departments", name_hi: "अन्य विविध विभाग" },
  ];

  const translations = {
    en: {
      title: "Department Dashboard",
      subtitle: "Case Statistics Overview",
      totalCases: "Total Cases",
      pendingCases: "Pending Cases",
      resolvedCases: "Resolved Cases",
      recentCases: "Recent Cases",
      caseId: "Case ID",
      status: "Status",
      date: "Date",
      hearingDate: "Hearing Date",
      backToReports: "Back to Reports",
      loading: "Loading...",
      noCases: "No cases found",
      pending: "Pending",
      resolved: "Resolved"
    },
    hi: {
      title: "विभाग डैशबोर्ड",
      subtitle: "मामले के आंकड़ों का अवलोकन",
      totalCases: "कुल मामले",
      pendingCases: "लंबित मामले",
      resolvedCases: "निराकृत मामले",
      recentCases: "हाल के मामले",
      caseId: "मामला आईडी",
      status: "स्थिति",
      date: "तिथि",
      hearingDate: "सुनवाई तिथि",
      backToReports: "रिपोर्ट पर वापस जाएं",
      loading: "लोड हो रहा है...",
      noCases: "कोई मामला नहीं मिला",
      pending: "लंबित",
      resolved: "निराकृत"
    }
  };

  const t = translations[currentLang];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchCases();
        const deptId = parseInt(departmentId || '0');
        const deptCases = data.cases?.filter((c: Case) => c.department === deptId) || [];
        setCases(deptCases);
        
        const dept = departments.find(d => d.id === deptId);
        setDepartmentName(currentLang === 'hi' ? dept?.name_hi || '' : dept?.name_en || '');
      } catch (error) {
        console.error('Error fetching cases:', error);
        setCases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [departmentId, currentLang]);

  const totalCases = cases.length;
  const pendingCases = cases.filter(c => c.status === 'Pending').length;
  const resolvedCases = cases.filter(c => c.status === 'Resolved').length;
  const recentCases = cases.slice(0, 10); // Show last 10 cases

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-blue-600 text-lg font-semibold">{t.loading}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-jansunwayi-navy">{t.title}</h1>
          <p className="text-jansunwayi-darkgray mt-2">{departmentName}</p>
        </div>
        <Button 
          onClick={() => navigate('/reports')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.backToReports}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">{t.totalCases}</h3>
                <p className="text-4xl font-bold">{totalCases}</p>
              </div>
              <BarChart3 className="w-12 h-12 opacity-80" />
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">{t.pendingCases}</h3>
                <p className="text-4xl font-bold">{pendingCases}</p>
              </div>
              <Clock className="w-12 h-12 opacity-80" />
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">{t.resolvedCases}</h3>
                <p className="text-4xl font-bold">{resolvedCases}</p>
              </div>
              <CheckCircle className="w-12 h-12 opacity-80" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Cases Table */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-jansunwayi-navy mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {t.recentCases}
          </h2>
          
          {recentCases.length === 0 ? (
            <div className="text-center py-8 text-gray-500">{t.noCases}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">{t.caseId}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">{t.date}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">{t.status}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">{t.hearingDate}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCases.map((caseItem) => (
                    <tr key={caseItem._id || caseItem.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {caseItem.caseNumber || caseItem.id}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {caseItem.date && !isNaN(new Date(caseItem.date).getTime())
                          ? format(new Date(caseItem.date), 'dd/MM/yyyy')
                          : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          caseItem.status === 'Pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {caseItem.status === 'Pending' ? t.pending : t.resolved}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {caseItem.hearingDate && !isNaN(new Date(caseItem.hearingDate).getTime())
                          ? format(new Date(caseItem.hearingDate), 'dd/MM/yyyy')
                          : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <Button size="sm" variant="outline" onClick={() => navigate(`/case/${caseItem._id || caseItem.id}`)}>
                          View Details
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => window.open(`/print-case/${caseItem._id || caseItem.id}`, '_blank')} style={{ marginLeft: '8px' }}>
                          Print
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Progress Bar */}
      {totalCases > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-jansunwayi-navy mb-4">Case Resolution Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{t.resolvedCases}</span>
                  <span>{Math.round((resolvedCases / totalCases) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(resolvedCases / totalCases) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{t.pendingCases}</span>
                  <span>{Math.round((pendingCases / totalCases) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(pendingCases / totalCases) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DepartmentDashboardPage; 