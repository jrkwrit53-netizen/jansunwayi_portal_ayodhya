import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CaseType, TranslationType, isWithinDays } from '@/utils/departmentUtils';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import NotificationViewDetailButton from './NotificationViewDetailButton';

interface CasesTableProps {
  cases: CaseType[];
  currentLang: 'en' | 'hi';
  t: TranslationType;
}

const CasesTable: React.FC<CasesTableProps> = ({ cases, currentLang, t }) => {
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [reminderEmail, setReminderEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

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
    // Mock sending email (replace with real API call)
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

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.caseId}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.date}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.status}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.writType}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.hearingDate}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.actions}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cases.map((c) => {
              const needsReminder = c.status === 'Pending' && c.hearingDate && isWithinDays(c.hearingDate, 7);
              const isContempt = c.writType === 'Contempt';
              
              return (
                <tr key={c.id} className={needsReminder ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{c.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {format(c.date, 'yyyy-MM-dd')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      c.status === 'Pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {currentLang === 'en' ? c.status : (c.status === 'Pending' ? t.pending : t.resolved)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isContempt && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        {currentLang === 'en' ? 'Contempt' : 'अवमानना'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {c.hearingDate ? format(c.hearingDate, 'yyyy-MM-dd') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <NotificationViewDetailButton caseId={c.id}>
                        View Details
                      </NotificationViewDetailButton>
                      
                      {needsReminder && (
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleSendReminderClick(c.id)}
                        >
                          {t.sendReminder}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Email Dialog for Reminder */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentLang === 'hi' ? 'ईमेल पता दर्ज करें' : 'Enter Email Address'}</DialogTitle>
            <DialogDescription>
              {currentLang === 'hi'
                ? 'कृपया वह ईमेल पता दर्ज करें जिस पर आप रिमाइंडर भेजना चाहते हैं।'
                : 'Please enter the email address where you want to send the reminder.'}
            </DialogDescription>
          </DialogHeader>
          <Input
            type="email"
            placeholder={currentLang === 'hi' ? 'ईमेल पता' : 'Email address'}
            value={reminderEmail}
            onChange={e => setReminderEmail(e.target.value)}
            disabled={sending}
          />
          <DialogFooter>
            <Button onClick={handleSendEmail} disabled={sending || !reminderEmail}>
              {sending ? (currentLang === 'hi' ? 'भेजा जा रहा है...' : 'Sending...') : (currentLang === 'hi' ? 'भेजें' : 'Send')}
            </Button>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)} disabled={sending}>
              {currentLang === 'hi' ? 'रद्द करें' : 'Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CasesTable;
