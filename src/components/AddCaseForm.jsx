import React, { useState } from 'react';

function AddCaseForm({ subDepartments, onSubmit }) {
    const [selectedSubDepartments, setSelectedSubDepartments] = useState([]);
    const [departmentEmails, setDepartmentEmails] = useState({});
    const [email, setEmail] = useState('');
    const [formData, setFormData] = useState({});

    const handleSubDepartmentChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedSubDepartments(selectedOptions);
    };

    const handleEmailChange = (deptId, email) => {
        setDepartmentEmails(prev => ({
            ...prev,
            [deptId]: email
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const subdepartmentEmails = Object.entries(departmentEmails).map(([deptId, email]) => ({
            departmentId: deptId,
            email
        }));

        try {
            await onSubmit({
                ...formData,
                subdepartmentEmails
            });
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <div className="form-group">
                <label>Select Sub Departments:</label>
                <select
                    multiple
                    className="form-control"
                    onChange={handleSubDepartmentChange}
                    value={selectedSubDepartments}
                    style={{ height: '150px' }}
                >
                    {subDepartments && subDepartments.map((dept) => (
                        <option key={dept.id || dept._id} value={dept.id || dept._id}>
                            {dept.name}
                        </option>
                    ))}
                </select>
            </div>

            {selectedSubDepartments.length > 0 && (
                <div className="email-inputs">
                    <h4>Enter Email Addresses:</h4>
                    {selectedSubDepartments.map(deptId => {
                        const dept = subDepartments.find(d => d._id === deptId);
                        return (
                            <div key={deptId} className="form-group">
                                <label>{dept.name} Email:</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={departmentEmails[deptId] || ''}
                                    onChange={(e) => handleEmailChange(deptId, e.target.value)}
                                    required
                                    placeholder={`Enter email for ${dept.name}`}
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    required
                />
            </div>

            <button type="submit" className="btn btn-primary">
                Submit Case
            </button>
        </form>
    );
}

export default AddCaseForm;