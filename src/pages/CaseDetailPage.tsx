
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Edit, Trash2, Check, X, Type } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import { useQueryClient } from '@tanstack/react-query';
import { deleteCase, updateCase, fetchCaseById, fetchDepartments, fetchSubDepartments } from '@/lib/api';

const writTypes = [
  { value: 'Regular', name_en: 'Regular', name_hi: 'नियमित' },
  { value: 'Contempt', name_en: 'Contempt', name_hi: 'अवमानना' },
  { value: 'Custom', name_en: 'Custom', name_hi: 'अन्य' }
];

const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentLang } = useApp();
  const queryClient = useQueryClient();

  const [caseData, setCaseData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [reminderEmail, setReminderEmail] = useState('');
  const [sending, setSending] = useState(false);

  const [departments, setDepartments] = useState<any[]>([]);
  const [subDepartments, setSubDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [customWritType, setCustomWritType] = useState('');

  // Add state for manual date input mode
  const [manualDateMode, setManualDateMode] = useState<{
    filingDate: boolean;
    hearingDate: boolean;
    affidavitDueDate: boolean;
    affidavitSubmissionDate: boolean;
  }>({
    filingDate: false,
    hearingDate: false,
    affidavitDueDate: false,
    affidavitSubmissionDate: false,
  });

  // Add state for manual date text inputs
  const [manualDateInputs, setManualDateInputs] = useState<{
    filingDate: string;
    hearingDate: string;
    affidavitDueDate: string;
    affidavitSubmissionDate: string;
  }>({
    filingDate: '',
    hearingDate: '',
    affidavitDueDate: '',
    affidavitSubmissionDate: '',
  });

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        try {
          setLoading(true);

          let data = await fetchCaseById(id);

          const parseDate = (d: any) => (d ? new Date(d) : null);
          data.hearingDate = parseDate(data.hearingDate);
          data.filingDate = parseDate(data.filingDate);
          data.affidavitDueDate = parseDate(data.affidavitDueDate);
          data.affidavitSubmissionDate = parseDate(data.affidavitSubmissionDate);
          // Normalize name fields from backend variations
          data.petitionerName = data.petitionerName || data.petitionername || '';
          data.respondentName = data.respondentName || data.respondentname || '';
          setCaseData(data);
          setEditedData(data);

          const [deptsData, subDeptsData] = await Promise.all([
            fetchDepartments(),
            fetchSubDepartments()
          ]);
          setDepartments(deptsData);
          setSubDepartments(subDeptsData);
        } catch (err) {
          toast.error("Failed to fetch case");
          navigate('/dashboard');
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [id, navigate]);

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setEditedData((prev: any) => ({
      ...prev,
      department: value,
      subDepartment: ''
      
    }));
  };

  const handleSubDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setEditedData((prev: any) => ({
      ...prev,
      subDepartment: value
    }));
  };

  const translations = {
    en: {
      title: "Case Details",
      caseNumber: "Case Number",
      petitionerName: "Petitioner Name",
      respondentName: "Respondent Name",
      filingDate: "Filing Date",
      petitionNumber: "Petition Number",
      noticeNumber: "Notice Number",
      writType: "Writ Type",
      department: "Department",
      subDepartment: "Sub Department",
      status: "Status",
      hearingDate: "Hearing Date",
      reminderSent: "Reminder Sent 1 Week Prior",
      affidavitDueDate: "Due Date to Submit Affidavit",
      affidavitSubmissionDate: "Affidavit Submission Date",
      isthecounteraffidavittobefiledornot: " Is The Counter-Affidavit to be filed or not?",
      edit: "Edit",
      delete: "Delete",
      save: "Save Changes",
      cancel: "Cancel",
      pending: "Pending",
      resolved: "Resolved",
      yes: "Yes",
      no: "No",
      selectDate: "Select date",
      deleteTitle: "Delete Case",
      deleteDescription: "Are you sure you want to delete this case? This action cannot be undone.",
      deleteConfirm: "Yes, delete case",
      deleteCancel: "Cancel",
      sendReminder: "Send Reminder",
      hearingPending: "Hearing Pending",
      upcomingHearing: "Upcoming Hearing",
      counterAffidavitinstruction: "Counter Affidavit (instruction)",
      saved: "Changes saved successfully",
      deleted: "Case deleted successfully",
      reminderSentSuccess: "Reminder sent successfully"
    },
    hi: {
      title: "मामले का विवरण",
      caseNumber: "क्रमांक संख्या",
      petitionerName: "याचिकाकर्ता का नाम",
      respondentName: "प्रतिवादी का नाम",
      filingDate: "डायरा दिनांक",
      petitionNumber: "रीट संख्या",
      noticeNumber: "नोटिस संख्या",
      writType: "रीट प्रकार",
      department: "विभाग",
      subDepartment: "उप विभाग",
      status: "मामले की स्थिति",
      hearingDate: "सुनवाई दिनांक",
      reminderSent: "एक सप्ताह पूर्व स्मारक भेजा गया?",
      affidavitDueDate: "प्रतिसपथ पत्र दाखिल करने हेतु निर्धारित तिथि",
      affidavitSubmissionDate: "प्रतिसपथ पत्र दाखिल होने की तिथि",
      isthecounteraffidavittobefiledornot:"प्रतिशपथ पत्र पत्र दाखिल होना है या नहीं ?",
      edit: "संपादित करें",
      delete: "हटाएं",
      save: "सहेजें परिवर्तन",
      cancel: "रद्द करें",
      pending: "लंबित",
      resolved: "निराकृत",
      yes: "हां",
      no: "नहीं",
      selectDate: "तिथि चुनें",
      deleteTitle: "मामला हटाएं",
      deleteDescription: "क्या आप वाकई इस मामले को हटाना चाहते हैं? इस क्रिया को पूर्ववत नहीं किया जा सकता है।",
      deleteConfirm: "हां, मामला हटाएं",
      deleteCancel: "रद्द करें",
      sendReminder: "भेजें अनुस्मारक",
      hearingPending: "सुनवाई लंबित",
      upcomingHearing: "आगामी सुनवाई",
      counterAffidavitinstruction: "प्रतिसपथ पत्र (आदेश)",
      saved: "परिवर्तन सफलतापूर्वक सहेजे गए",
      deleted: "मामला सफलतापूर्वक हटा दिया गया है",
      reminderSentSuccess: "अनुस्मारक सफलतापूर्वक भेजा गया"
    }
  };

  const t = translations[currentLang];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusToggle = () => {
    setEditedData((prev: any) => ({
      ...prev,
      status: prev.status === 'Pending' ? 'Resolved' : 'Pending'
    }));
  };

  const handleReminderToggle = () => {
    setEditedData((prev: any) => ({
      ...prev,
      reminderSent: !prev.reminderSent
    }));
  };

  const handleCounterAffidavitToggle = () => {
    setEditedData((prev: any) => ({
      ...prev,
      counterAffidavitRequired: !prev.counterAffidavitRequired
    }));
  };

  const handleSave = async () => {
    if (!id) return;

    const finalData = { ...editedData };
    if (editedData.writType === 'Custom') {
      finalData.writType = customWritType;
    }

    try {
      await updateCase(id, finalData);
      setCaseData(finalData);
      setIsEditing(false);
      toast.success(t.saved);
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    } catch (error) {
      toast.error(currentLang === 'hi' ? 'मामला अपडेट करने में त्रुटि हुई।' : 'Failed to update case.');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteCase(id);
      toast.success(t.deleted);
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      navigate('/dashboard');
    } catch (error) {
      toast.error(currentLang === 'hi' ? 'मामला हटाने में त्रुटि हुई।' : 'Failed to delete case.');
    }
  };

  const sendReminder = async () => {
    setShowEmailDialog(true);
  };

  const handleSendEmail = async () => {
    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSending(false);
    setShowEmailDialog(false);
    setReminderEmail('');
    toast.success(`${t.reminderSentSuccess} (${reminderEmail})`);
    queryClient.invalidateQueries({ queryKey: ['cases'] });
  };

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

  // Function to handle manual date input
  const handleManualDateChange = (field: string, value: string) => {
    setManualDateInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Function to convert manual date input to Date object
  const parseManualDate = (dateString: string): Date | null => {
    if (!dateString.trim()) return null;
    
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    return null;
  };

  // Function to apply manual date
  const applyManualDate = (field: string) => {
    const dateString = manualDateInputs[field as keyof typeof manualDateInputs];
    const parsedDate = parseManualDate(dateString);
    
    if (parsedDate) {
      setEditedData((prev: any) => ({
        ...prev,
        [field]: parsedDate
      }));
      setManualDateMode(prev => ({
        ...prev,
        [field]: false
      }));
      toast.success(currentLang === 'hi' ? 'तिथि सफलतापूर्वक अपडेट की गई' : 'Date updated successfully');
    } else {
      toast.error(currentLang === 'hi' ? 'अमान्य तिथि प्रारूप' : 'Invalid date format');
    }
  };

  // Function to toggle manual date input mode
  const toggleManualDateMode = (field: string) => {
    setManualDateMode(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev]
    }));
    
    const currentDate = editedData[field];
    if (currentDate) {
      setManualDateInputs(prev => ({
        ...prev,
        [field]: format(new Date(currentDate), 'yyyy-MM-dd')
      }));
    }
  };

  const DateInput = ({ 
    field, 
    label, 
    value, 
    onDateChange 
  }: { 
    field: string; 
    label: string; 
    value: Date | null; 
    onDateChange: (date: Date | null) => void; 
  }) => {
    const isManualMode = manualDateMode[field as keyof typeof manualDateMode];
    const manualValue = manualDateInputs[field as keyof typeof manualDateInputs];

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <div className="flex gap-2">
          {!isManualMode ? (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value && !isNaN(new Date(value).getTime()) 
                      ? format(new Date(value), "PPP") 
                      : <span>{t.selectDate}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={value || undefined}
                    onSelect={onDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => toggleManualDateMode(field)}
                title={currentLang === 'hi' ? 'मैन्युअल तिथि दर्ज करें' : 'Enter date manually'}
              >
                <Type className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Input
                type="text"
                placeholder="YYYY-MM-DD"
                value={manualValue}
                onChange={(e) => handleManualDateChange(field, e.target.value)}
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    applyManualDate(field);
                  }
                }}
              />
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => applyManualDate(field)}
              >
                {currentLang === 'hi' ? 'लागू करें' : 'Apply'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toggleManualDateMode(field)}
              >
                {currentLang === 'hi' ? 'रद्द करें' : 'Cancel'}
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  const getDepartmentName = (id: string | number) => {
    const dept = departments.find(d => String(d.id) === String(id) || String(d._id) === String(id));
    return dept ? (currentLang === 'hi' ? dept.name_hi : dept.name_en) : '';
  };

  const getSubDepartmentName = (subId: string | number) => {
    const sub = subDepartments.find(s => String(s.id) === String(subId) || String(s._id) === String(subId));
    return sub ? (currentLang === 'hi' ? sub.name_hi : sub.name_en) : '';
  };

  const getWritTypeName = (value: string) => {
    const writType = writTypes.find(w => w.value === value);
    if (writType) {
      return currentLang === 'hi' ? writType.name_hi : writType.name_en;
    }
    return value;
  };

  const relevantSubDepartments = subDepartments.filter(
    (sub) => String(sub.department) === String(editedData?.department)
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{t.title}</h1>
            {caseData.writType === 'Contempt' && (
              <span className="mt-2 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                {currentLang === 'en' ? 'Contempt Case' : 'अवमानना मामला'}
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            {!isEditing ? (
              <>
                <Button onClick={() => setIsEditing(true)} variant="outline" className="flex items-center">
                  <Edit className="h-4 w-4 mr-2" />
                  {t.edit}
                </Button>
                <Button onClick={() => setShowDeleteDialog(true)} variant="destructive" className="flex items-center">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t.delete}
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleSave} variant="default" className="flex items-center">
                  <Check className="h-4 w-4 mr-2" />
                  {t.save}
                </Button>
                <Button onClick={() => {
                  setIsEditing(false);
                  setEditedData(caseData);
                }} variant="outline" className="flex items-center">
                  <X className="h-4 w-4 mr-2" />
                  {t.cancel}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Case Number removed as per requirement */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.petitionerName}</label>
            {isEditing ? (
              <Input name="petitionerName" value={editedData.petitionerName} onChange={handleChange} />
            ) : (
              <div>{caseData.petitionerName || caseData.petitionername}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.respondentName}</label>
            {isEditing ? (
              <Input name="respondentName" value={editedData.respondentName} onChange={handleChange} />
            ) : (
              <div>{caseData.respondentName || caseData.respondentname}</div>
            )}
          </div>

          <div>
            {isEditing ? (
              <DateInput
                field="filingDate"
                label={t.filingDate}
                value={editedData.filingDate}
                onDateChange={(date) => setEditedData((prev: any) => ({ ...prev, filingDate: date }))}
              />
            ) : (
              <>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.filingDate}</label>
              <div>{caseData.filingDate ? format(caseData.filingDate, "PPP") : '-'}</div>
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.petitionNumber}</label>
            {isEditing ? (
              <Input name="petitionNumber" value={editedData.petitionNumber} onChange={handleChange} />
            ) : (
              <div>{caseData.petitionNumber}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.noticeNumber}</label>
            {isEditing ? (
              <Input name="noticeNumber" value={editedData.noticeNumber} onChange={handleChange} />
            ) : (
              <div>{caseData.noticeNumber}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.writType}</label>
            {isEditing ? (
              <>
                <select name="writType" value={editedData.writType} onChange={handleChange} className="input-field">
                  {writTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {currentLang === 'hi' ? type.name_hi : type.name_en}
                    </option>
                  ))}
                </select>
                {editedData.writType === 'Custom' && (
                  <Input
                    type="text"
                    placeholder="Enter custom writ type"
                    value={customWritType}
                    onChange={(e) => setCustomWritType(e.target.value)}
                    className="mt-2"
                  />
                )}
              </>
            ) : (
              <div>{getWritTypeName(caseData.writType)}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.department}</label>
            {isEditing ? (
              <select name="department" value={editedData.department} onChange={handleDepartmentChange} className="input-field">
                {departments.map((dept) => (
                  <option key={dept.id || dept._id} value={dept.id || dept._id}>
                    {currentLang === 'hi' ? dept.name_hi : dept.name_en}
                  </option>
                ))}
              </select>
            ) : (
              <div>{getDepartmentName(caseData.department)}</div>
            )}
          </div>

          {isEditing && relevantSubDepartments.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.subDepartment}</label>
              <select name="subDepartment" value={editedData.subDepartment || ''} onChange={handleSubDepartmentChange} className="input-field">
                <option value="">{currentLang === 'hi' ? 'चुनें' : 'Select'}</option>
                {relevantSubDepartments.map((sub: any) => (
                  <option key={sub.id || sub._id} value={sub.id || sub._id}>
                    {currentLang === 'hi' ? sub.name_hi : sub.name_en}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!isEditing && caseData.subDepartment && (
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">{t.subDepartment}</label>
               {(() => {
                 const sd = caseData.subDepartment;
                 const subId = sd?._id || sd;
                 const subName = sd?.name_hi || sd?.name_en || getSubDepartmentName(subId);
                 return <div>{subName}</div>;
               })()}
             </div>
          )}

          {/* Show all associated sub-departments if available */}
          {!isEditing && Array.isArray(caseData.subDepartments) && caseData.subDepartments.length > 0 && (
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">{currentLang === 'hi' ? 'सभी उप विभाग' : 'All Sub Departments'}</label>
              <ul className="list-disc list-inside space-y-1">
                {caseData.subDepartments.map((sd: any) => {
                  const subId = sd?._id || sd;
                  const subName = sd?.name_hi || sd?.name_en || getSubDepartmentName(subId);
                  return (
                    <li key={String(subId)}>{subName}</li>
                  );
                })}
              </ul>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.status}</label>
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <Button type="button" variant={editedData.status === 'Pending' ? 'default' : 'outline'} onClick={handleStatusToggle}>
                  {t.pending}
                </Button>
                <Button type="button" variant={editedData.status === 'Resolved' ? 'default' : 'outline'} onClick={handleStatusToggle}>
                  {t.resolved}
                </Button>
              </div>
            ) : (
              <div>{caseData.status === 'Pending' ? t.pending : t.resolved}</div>
            )}
          </div>

          <div>
            {isEditing ? (
              <DateInput
                field="hearingDate"
                label={t.hearingDate}
                value={editedData.hearingDate}
                onDateChange={(date) => setEditedData((prev: any) => ({ ...prev, hearingDate: date }))}
              />
            ) : (
              <>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.hearingDate}</label>
              <div>{caseData.hearingDate ? format(caseData.hearingDate, "PPP") : '-'}</div>
              </>
            )}
          </div>
          
          <div>
            {isEditing ? (
              <DateInput
                field="affidavitDueDate"
                label={t.affidavitDueDate}
                value={editedData.affidavitDueDate}
                onDateChange={(date) => setEditedData((prev: any) => ({ ...prev, affidavitDueDate: date }))}
              />
            ) : (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.affidavitDueDate}</label>
                <div>{caseData.affidavitDueDate ? format(caseData.affidavitDueDate, "PPP") : '-'}</div>
              </>
            )}
          </div>
          
          <div>
            {isEditing ? (
              <DateInput
                field="affidavitSubmissionDate"
                label={t.affidavitSubmissionDate}
                value={editedData.affidavitSubmissionDate}
                onDateChange={(date) => setEditedData((prev: any) => ({ ...prev, affidavitSubmissionDate: date }))}
              />
            ) : (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.affidavitSubmissionDate}</label>
                <div>{caseData.affidavitSubmissionDate ? format(caseData.affidavitSubmissionDate, "PPP") : '-'}</div>
              </>
            )}
          </div>

          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.isthecounteraffidavittobefiledornot}</label>
            <div className="flex items-center space-x-2">
              <Button type="button" onClick={handleCounterAffidavitToggle} variant={editedData.counterAffidavitRequired ? 'default' : 'outline'}>
                {t.yes}
              </Button>
              <Button type="button" onClick={handleCounterAffidavitToggle} variant={!editedData.counterAffidavitRequired ? 'default' : 'outline'}>
                {t.no}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.deleteDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.deleteCancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-jansunwayi-red hover:bg-red-600">
              {t.deleteConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentLang === 'hi' ? 'ईमेल पता दर्ज करें' : 'Enter Email Address'}</DialogTitle>
          </DialogHeader>
          <Input
            type="email"
            placeholder={currentLang === 'hi' ? 'ईमेल पता' : 'Email address'}
            value={reminderEmail}
            onChange={e => setReminderEmail(e.target.value)}
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
    </div>
  );
};

export default CaseDetailPage;
