import React, { useState, useEffect } from 'react';
import { CaseData } from '../api';

interface Props {
    onSubmit: (data: CaseData) => Promise<void>;
    departments?: Array<{ id: number; name: string }>;

}

const AddCaseForm: React.FC<Props> = ({ onSubmit, departments = [] }) => {
    const [formData, setFormData] = useState<Partial<CaseData>>({
        petitionerName: '',
        respondentName: '',
        filingDate: new Date(),
        petitionNumber: '',
        noticeNumber: '',
        writType: '',
        department: 0,
        subDepartments: [],
        subdepartmentEmails: []
    });
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEmailChange = (deptId: number, email: string) => {
        setFormData(prev => ({
            ...prev,
            subdepartmentEmails: [
                ...(prev.subdepartmentEmails || []).filter(item => item.departmentId !== deptId),
                { departmentId: deptId, email }
            ]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.subdepartmentEmails?.length) {
            setError('At least one department email is required');
            return;
        }

        try {
            await onSubmit(formData as CaseData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit form');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500">{error}</div>}

            <div className="form-group mb-4">
                <input
                    type="text"
                    name="petitionerName"
                    value={formData.petitionerName || ''}
                    onChange={handleChange}
                    placeholder="Petitioner Name (Person who filed the case)"
                    required
                    className="form-control"
                />
            </div>
            <div className="form-group mb-4">
                <input
                    type="text"
                    name="respondentName"
                    value={formData.respondentName || ''}
                    onChange={handleChange}
                    placeholder="Respondent Name (Person against whom the case is filed)"
                    required
                    className="form-control"
                />
            </div>

            {formData.subDepartments?.map(deptId => (
                <div key={deptId} className="form-group">
                    <input
                        type="email"
                        placeholder={`Email for ${departments.find(d => d.id === deptId)?.name || 'Department'}`}
                        value={formData.subdepartmentEmails?.find(e => e.departmentId === deptId)?.email || ''}
                        onChange={(e) => handleEmailChange(deptId, e.target.value)}
                        required
                        className="form-control"
                    />
                </div>
            ))}

            {/* ... other form fields ... */}

            <button
                type="submit"
                className="btn btn-primary"
                disabled={!formData.subdepartmentEmails?.length}
            >
                Submit Case
            </button>
        </form>
    );
};

export default AddCaseForm;
