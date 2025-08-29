const express = require('express');
const router = express.Router();
const CaseModel = require('../models/CaseModel');
const sendMail = require('../utils/sendMail');

router.post('/add', async (req, res) => {
    const { subDepartments, subdepartmentEmails, petitionerName, respondentName, ...otherFields } = req.body;

    try {
        // Validate required fields
        if (!petitionerName || !respondentName || !otherFields.caseNumber || !otherFields.filingDate) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        const newCase = new CaseModel({
            ...otherFields,
            petitionerName: petitionerName.trim(),
            respondentName: respondentName.trim(),
            subDepartments: subDepartments || [],
            subdepartmentEmails: subdepartmentEmails || []
        });

        await newCase.save();

        // Send emails to each department
        for (const { email } of subdepartmentEmails) {
            await sendMail({
                to: email,
                subject: 'New Case Assignment',
                text: `A new case (ID: ${newCase._id}) has been assigned to your department.
                       Please review it at your earliest convenience.`
            });
        }

        res.status(201).json({
            success: true,
            message: 'Case created and notifications sent',
            caseId: newCase._id
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

module.exports = router;