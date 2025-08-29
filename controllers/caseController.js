

// ...existing code...

async function addCase(req, res) {
    try {
        // ...existing code for creating new case...
        const newCase = /* logic to create and save new case */;

        // Send notification email
await sendNewCaseNotification(req.body.email, {
        noticeNumber: newCase.noticeNumber,
            caseId: newCase._id || newCase.caseId
        });

        res.status(201).json({
            success: true,
            message: 'Case added successfully',
            data: newCase
        });
    } catch (error) {
        // ...existing error handling code...
    }
}
export default caseController;