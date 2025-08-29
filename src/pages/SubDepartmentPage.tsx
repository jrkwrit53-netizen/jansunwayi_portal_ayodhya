import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { generateMockCases, translations } from '@/utils/departmentUtils';
import { fetchSubDepartments, fetchDepartments } from '@/lib/api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Eye, Plus } from 'lucide-react';

const SubDepartmentPage: React.FC = () => {
  const { currentLang } = useApp();
  const { subDepartmentId } = useParams<{ subDepartmentId: string }>();
  const navigate = useNavigate();
  const [subDepartments, setSubDepartments] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [reminderEmail, setReminderEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subDeptsData, deptsData] = await Promise.all([
        fetchSubDepartments(),
        fetchDepartments()
      ]);
      
      setSubDepartments(subDeptsData);
      setDepartments(deptsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setSubDepartments([]);
      setDepartments([
        { id: 1, name_en: "Administration Department", name_hi: "प्रशासन विभाग" },
        { id: 2, name_en: "Development department", name_hi: "विकास विभाग" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const subDepartment = subDepartments.find(subDept => 
    subDept.id === Number(subDepartmentId) || subDept._id === subDepartmentId
  );
  
  const cases = generateMockCases(Number(subDepartmentId));
  const t = translations[currentLang];

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSendReminderClick = (caseId: string) => {
    setSelectedCaseId(caseId);
    setShowEmailDialog(true);
  };

  const handleSendEmail = async () => {
    if (!validateEmail(reminderEmail)) {
      toast.error(currentLang === 'hi' ? 'कृपया मान्य ईमेल पता दर्ज करें।' : 'Please enter a valid email address.');
      return;
    }
    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSending(false);
    setShowEmailDialog(false);
    toast.success(
      currentLang === 'en'
        ? `Reminder sent for case ${selectedCaseId} to ${reminderEmail}`
        : `मामला ${selectedCaseId} के लिए अनुस्मारक ${reminderEmail} पर भेजा गया`
    );
    setReminderEmail('');
    setSelectedCaseId(null);
  };

  const handleViewAllCases = () => {
    navigate(`/all-cases/${subDepartmentId}`);
  };

  const handleAddCase = () => {
    navigate(`/add-case?subDepartment=${subDepartmentId}`);
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

  if (!subDepartment) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-jansunwayi-darkgray">
          {currentLang === 'hi' ? 'उप-विभाग नहीं मिला' : 'Sub-department not found'}
        </p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-jansunwayi-navy">
              {currentLang === 'hi' ? subDepartment.name_hi : subDepartment.name_en}
            </h1>
            <p className="text-jansunwayi-darkgray mt-2">
              {currentLang === 'hi' ? subDepartment.name_en : subDepartment.name_hi}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleViewAllCases} className="btn-primary">
              <Eye className="h-4 w-4 mr-2" />
              {currentLang === 'hi' ? 'सभी मामले देखें' : 'View All Cases'}
            </Button>
            <Button onClick={handleAddCase} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              {currentLang === 'hi' ? 'मामला जोड़ें' : 'Add Case'}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-jansunwayi-blue text-white">
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">{t.totalCases}</h3>
            <p className="text-3xl font-bold">{cases.length}</p>
          </div>
        </Card>
        
        <Card className="bg-jansunwayi-green text-white">
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">{t.resolvedCases}</h3>
            <p className="text-3xl font-bold">
              {cases.filter(c => c.status === 'Resolved').length}
            </p>
          </div>
        </Card>
        
        <Card className="bg-jansunwayi-saffron text-white">
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">{t.pendingCases}</h3>
            <p className="text-3xl font-bold">
              {cases.filter(c => c.status === 'Pending').length}
            </p>
          </div>
        </Card>
      </div>
      
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-jansunwayi-navy">
            {t.recentCases}
          </h2>
          <div className="flex gap-2">
            <Button onClick={handleViewAllCases} variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              {currentLang === 'hi' ? 'सभी मामले देखें' : 'View All Cases'}
            </Button>
            <Button onClick={handleAddCase} className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              {currentLang === 'hi' ? 'मामला जोड़ें' : 'Add Case'}
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.caseId}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.date}
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
              {cases.slice(0, 5).map((caseItem) => {
                const needsReminder = caseItem.status === 'Pending';
                
                return (
                  <tr key={caseItem.id} className={needsReminder ? 'bg-red-50' : ''}>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{caseItem.id}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {format(caseItem.date, 'yyyy-MM-dd')}
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
                      {caseItem.hearingDate ? format(caseItem.hearingDate, 'yyyy-MM-dd') : '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleSendReminderClick(caseItem.id.toString())}
                          size="sm"
                          variant="outline"
                          disabled={caseItem.status === 'Resolved'}
                        >
                          {currentLang === 'hi' ? 'अनुस्मारक' : 'Reminder'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/case/${caseItem.id}`)}
                        >
                          {currentLang === 'hi' ? 'विवरण देखें' : 'View Details'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {cases.length > 5 && (
          <div className="mt-4 text-center">
            <Button onClick={handleViewAllCases} variant="outline">
              {currentLang === 'hi' ? 'सभी मामले देखें' : 'View All Cases'}
            </Button>
          </div>
        )}
      </Card>

      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentLang === 'hi' ? 'ईमेल अनुस्मारक भेजें' : 'Send Email Reminder'}
            </DialogTitle>
            <DialogDescription>
              {currentLang === 'hi' 
                ? `मामला ${selectedCaseId} के लिए अनुस्मारक ईमेल भेजें` 
                : `Send reminder email for case ${selectedCaseId}`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {currentLang === 'hi' ? 'ईमेल पता' : 'Email address'}
              </label>
              <Input
                type="email"
                placeholder={currentLang === 'hi' ? 'ईमेल पता' : 'Email address'}
                value={reminderEmail}
                onChange={e => setReminderEmail(e.target.value)}
                disabled={sending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEmailDialog(false)}
              disabled={sending}
            >
              {currentLang === 'hi' ? 'रद्द करें' : 'Cancel'}
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={sending || !reminderEmail}
            >
              {sending 
                ? (currentLang === 'hi' ? 'भेज रहा है...' : 'Sending...') 
                : (currentLang === 'hi' ? 'भेजें' : 'Send')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubDepartmentPage; 