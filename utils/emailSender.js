const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'jrkwrit53@gmail.com',
        pass: 'COLLERATEOFFICE@12345'
    }
});

async function sendNewCaseNotification(to, caseDetails) {
    const emailContent = `
        Dear User,

        A new case has been registered in your department with the following details:

        Notice Number: ${caseDetails.noticeNumber}
        Case ID: ${caseDetails.caseId}

        This is an automated notification. Please do not reply to this email.

        Regards,
        Collectrate Office Ayodhya 
    `;

    const mailOptions = {
        from: 'jrkwrit53@gmail.com',
        to,
        subject: `New Case Notification - Case ID: ${caseDetails.caseId}`,
        text: emailContent
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Notification email sent successfully');
    } catch (error) {
        console.error('Error sending notification email:', error);
        throw error;
    }
}

module.exports = { sendNewCaseNotification };
