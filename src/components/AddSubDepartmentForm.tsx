import React, { useState } from 'react';

interface AddSubDepartmentFormProps {
  departments: { id: number; name_en: string; name_hi: string }[];
  currentLang: 'en' | 'hi';
  onClose: () => void;
  onSubmit: (departmentId: number, subDeptNameEn: string, subDeptNameHi: string) => void;
}

const AddSubDepartmentForm: React.FC<AddSubDepartmentFormProps> = ({
  departments,
  currentLang,
  onClose,
  onSubmit,
}) => {
  const [departmentId, setDepartmentId] = useState('');
  const [subDeptNameEn, setSubDeptNameEn] = useState('');
  const [subDeptNameHi, setSubDeptNameHi] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', { departmentId, subDeptNameEn, subDeptNameHi });
    
    if (!departmentId || !subDeptNameEn || !subDeptNameHi) {
      console.error('Form validation failed: missing required fields');
      return;
    }
    
    onSubmit(parseInt(departmentId), subDeptNameEn, subDeptNameHi);
    setDepartmentId('');
    setSubDeptNameEn('');
    setSubDeptNameHi('');
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">
            {currentLang === 'hi' ? 'उप विभाग जोड़ें' : 'Add Sub Department'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">
              {currentLang === 'hi' ? 'विभाग चुनें' : 'Select Department'}
            </label>
            <select
              value={departmentId}
              onChange={e => setDepartmentId(e.target.value)}
              required
              className="input-field w-full"
            >
              <option value="">{currentLang === 'hi' ? 'चुनें' : 'Select'}</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {currentLang === 'hi' ? dept.name_hi : dept.name_en}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">
              {currentLang === 'hi' ? 'उप विभाग (अंग्रे़ी)' : 'Sub Department (English)'}
            </label>
            <input
              type="text"
              value={subDeptNameEn}
              onChange={e => setSubDeptNameEn(e.target.value)}
              required
              className="input-field w-full"
              placeholder={currentLang === 'hi' ? 'उप विभाग नाम (अंग्रे़ी)' : 'Sub Department Name (English)'}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">
              {currentLang === 'hi' ? 'उप विभाग (हिंदी)' : 'Sub Department (Hindi)'}
            </label>
            <input
              type="text"
              value={subDeptNameHi}
              onChange={e => setSubDeptNameHi(e.target.value)}
              required
              className="input-field w-full"
              placeholder={currentLang === 'hi' ? 'उप विभाग नाम (हिंदी)' : 'Sub Department Name (Hindi)'}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              {currentLang === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {currentLang === 'hi' ? 'जोड़ें' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubDepartmentForm;