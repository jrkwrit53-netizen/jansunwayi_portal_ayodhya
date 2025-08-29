const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema({
    caseNumber: { type: String, required: true },
    petitionerName: { type: String, required: true },
    respondentName: { type: String, required: true },
    filingDate: { type: Date, required: true },
    petitionNumber: { type: String },
    noticeNumber: { type: String },
    writType: { type: String, required: true },
    department: { type: Number, required: true },
    status: { type: String, default: 'Pending' },
    emailid: { type: String },
    subDepartments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubDepartment' }],
    subdepartmentEmails: [{
        departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubDepartment' },
        email: String
    }],
    petitionerName: {
        type: String,
        trim: true
    },
    respondentName: {
        type: String,
        trim: true
    },
    // Remove old fields if they exist
    petitionername: undefined,
    respondentname: undefined,
    // ...existing fields...
});

module.exports = mongoose.model('Case', CaseSchema);