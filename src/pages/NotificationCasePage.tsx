import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCaseById } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const NotificationCasePage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (caseId) {
          let data = null;
          try {
            data = await fetchCaseById(caseId);
          } catch (err) {
            // Try with padded ObjectId if caseId is short and numeric
            if (caseId.length < 24 && caseId.match(/^\d+$/)) {
              data = await fetchCaseById(caseId.padStart(24, '0'));
            } else {
              throw err;
            }
          }
          setCaseData(data);
        } else {
          setError('No case ID provided.');
        }
      } catch (err) {
        setError('Failed to fetch case details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [caseId]);

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-lg">Loading...</div>;
  }
  if (error) {
    return <div className="flex justify-center items-center h-64 text-red-600 text-lg">{error}</div>;
  }
  if (!caseData) {
    return <div className="flex justify-center items-center h-64 text-gray-600 text-lg">No case data found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="p-8 shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-blue-700">Case Details</h1>
        <div className="space-y-3 text-base">
          <div><strong>Case Number:</strong> {caseData.caseNumber}</div>
          <div><strong>Name:</strong> {caseData.name}</div>
          <div><strong>Status:</strong> {caseData.status}</div>
          <div><strong>Filing Date:</strong> {caseData.filingDate ? format(new Date(caseData.filingDate), 'dd/MM/yyyy') : '-'}</div>
          <div><strong>Hearing Date:</strong> {caseData.hearingDate ? format(new Date(caseData.hearingDate), 'dd/MM/yyyy') : '-'}</div>
          <div><strong>Department:</strong> {caseData.departmentName || caseData.department}</div>
          <div><strong>Sub-Department:</strong> {caseData.subDepartmentName || caseData.subDepartment}</div>
          <div><strong>Petition Number:</strong> {caseData.petitionNumber}</div>
          <div><strong>Notice Number:</strong> {caseData.noticeNumber}</div>
          <div><strong>Writ Type:</strong> {caseData.writType}</div>
          {/* Add more fields as needed */}
        </div>
        <Button className="mt-8" variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
      </Card>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="mt-4 p-2 border rounded"
        placeholder="Enter your email"
      />
    </div>
  );
};

export default NotificationCasePage;
