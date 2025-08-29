const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS with specific options
app.use(cors({
  origin: 'https://jansunwayi-portal-ayodhya-3hgx.vercel.app', // Frontend domain
  credentials: true
}));

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Enhanced Case schema to match frontend requirements
const caseSchema = new mongoose.Schema({
  caseNumber: { type: String },
  petitionername: { type: String, required: true },
  respondentname: { type: String, required: true },
  filingDate: { type: Date, required: true },
  petitionNumber: String,
  noticeNumber: String,
  writType: String,
  department: { type: Number, required: true },
  subDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'SubDepartment' },
  subDepartments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubDepartment' }],
  status: { type: String, enum: ['Pending', 'Resolved'], default: 'Pending' },
  hearingDate: Date,
  reminderSent: { type: Boolean, default: false },
  affidavitDueDate: Date,
  affidavitSubmissionDate: Date,
  counterAffidavitRequired: { type: Boolean, default: false },
  reminderSentCount: { type: Number, default: 0 },
  lastReminderSent: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Department schema
const departmentSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name_en: { type: String, required: true },
  name_hi: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// SubDepartment schema
const subDepartmentSchema = new mongoose.Schema({
  departmentId: { type: Number, required: true },
  name_en: { type: String, required: true },
  name_hi: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Email reminder schema
const emailReminderSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  email: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['sent', 'failed'], default: 'sent' }
});

// Admin schema
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Case = mongoose.model('Case', caseSchema);
const Department = mongoose.model('Department', departmentSchema);
const SubDepartment = mongoose.model('SubDepartment', subDepartmentSchema);
const EmailReminder = mongoose.model('EmailReminder', emailReminderSchema);
// Track cases with multiple sub-departments
const multiSubCaseSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true, unique: true },
  subDepartments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubDepartment' }],
  createdAt: { type: Date, default: Date.now }
});
const MultiSubCase = mongoose.model('MultiSubCase', multiSubCaseSchema);
const Admin = mongoose.model('Admin', adminSchema);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ===== CASE ENDPOINTS =====

// Get all cases with filtering and pagination
app.get('/cases', async (req, res) => {
  try {
    const { 
      department, 
      subDepartment, 
      status, 
      page, 
      limit,
      search 
    } = req.query;
    
    let query = {};
    
    if (department) query.department = parseInt(department);
    if (subDepartment) {
      if (mongoose.Types.ObjectId.isValid(subDepartment)) {
        query.$or = [
          { subDepartment },
          { subDepartments: subDepartment }
        ];
      }
    }
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { caseNumber: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { petitionNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    let casesQuery = Case.find(query).populate(['subDepartment', 'subDepartments']).sort({ createdAt: -1 });
    
    if (page && limit) {
      const skip = (parseInt(page) - 1) * parseInt(limit);
      casesQuery = casesQuery.skip(skip).limit(parseInt(limit));
    }
    
    const cases = await casesQuery;
    const total = await Case.countDocuments(query);
    
    res.json({
      cases,
      pagination: page && limit ? {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      } : null
    });
  } catch (err) {
    console.error('Error fetching cases:', err);
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});
app.post('/send-email', async (req, res) => {
  try {
    const { to, subject, html } = req.body;

    // Validate required fields
    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
    }

    // Create transporter with Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "jrkwrit53@gmail.com", // Your Gmail address
        pass: "bqvd jtyv dilm pnnr", // Your Gmail App Password
      },
    });

    // Email options
    const mailOptions = {
      from: {
        name: 'District Magistrate Office, Ayodhya',
        address: process.env.GMAIL_USER || '',
      },
      to: to,
      subject: subject,
      html: html,
      attachments: [], // You can add PDF attachments here if needed
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html } = req.body;
    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
    }
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "jrkwrit53@gmail.com",
        pass: "bqvd jtyv dilm pnnr",
      },
    });
    const mailOptions = {
      from: {
        name: 'District Magistrate Office, Ayodhya',
        address: process.env.GMAIL_USER || '',
      },
      to: to,
      subject: subject,
      html: html,
      attachments: [],
    };
    const info = await transporter.sendMail(mailOptions);
    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
// Update case
app.put('/cases/:id', async (req, res) => {
  try {
    const caseId = req.params.id;
    const updateData = { ...req.body, updatedAt: new Date() };

    const updatedCase = await Case.findByIdAndUpdate(
      caseId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCase) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json(updatedCase);
  } catch (err) {
    console.error('Error updating case:', err);
    res.status(500).json({ error: 'Failed to update case' });
  }
});

// Get case by ID or by caseNumber (populated)
app.get('/cases/:input', async (req, res) => {
  try {
    const { input } = req.params;

    let caseData = null;

    // Try ObjectId lookup first
    if (ObjectId.isValid(input)) {
      caseData = await Case.findById(input).populate(['subDepartment', 'subDepartments']);
      if (caseData) {
        return res.json(caseData);
      }
    }

    // Fallback: lookup by caseNumber (case-sensitive as stored)
    caseData = await Case.findOne({ caseNumber: input }).populate(['subDepartment', 'subDepartments']);
    if (caseData) {
      return res.json(caseData);
    }

    return res.status(404).json({ message: 'Case not found' });
  } catch (err) {
    console.error('Error fetching case by input:', err);
    return res.status(500).json({ error: 'Failed to fetch case' });
  }
});


// Get case by caseNumber (case-insensitive, ignore leading zeros)
// app.get('/cases/by-number/:caseNumber', async (req, res) => {
//   try {
//     const { caseNumber } = req.params;
//     console.log('Searching for caseNumber:', caseNumber);
//     // Remove leading zeros for search
//     const normalized = caseNumber.replace(/^0+/, '');
//     // Regex: match with or without leading zeros, case-insensitive
//     const regex = new RegExp(`^0*${normalized}$`, 'i');
//     const caseData = await Case.findOne({ caseNumber: regex });
//     if (!caseData) {
//       return res.status(404).json({ error: 'Case not found' });
//     }
//     res.json(caseData);
//   } catch (err) {
//     console.error('Error fetching case by number:', err);
//     res.status(500).json({ error: 'Failed to fetch case by number' });
//   }
// });/
// Example GET route
app.get('/cases/:input', async (req, res) => {
  const { input } = req.params;

  // Try to search by MongoDB ObjectId
  if (ObjectId.isValid(input)) {
      const caseData = await Case.findById(input);
      if (caseData) return res.json(caseData);
  }
  
  // Else, try to search by caseNumber
  const caseData = await Case.findOne({ caseNumber: input });
  if (caseData) return res.json(caseData);

  res.status(404).json({ message: "Case not found" });
});


// Create new case
app.post('/cases', async (req, res) => {
  try {
    const body = req.body || {};

    const petitionername = body.petitionername || body.petitionerName;
    const respondentname = body.respondentname || body.respondentName;

    const department = typeof body.department === 'string' ? parseInt(body.department, 10) : body.department;

    const toDate = (d) => {
      if (!d) return undefined;
      const dt = new Date(d);
      return isNaN(dt.getTime()) ? undefined : dt;
    };

    let subDepartment = body.subDepartment;
    if (!subDepartment && Array.isArray(body.subDepartments) && body.subDepartments.length > 0) {
      subDepartment = body.subDepartments.find((v) => !!v);
    }

    // Build subDepartments array with only valid ObjectIds
    const subDepartments = Array.isArray(body.subDepartments)
      ? body.subDepartments.filter((v) => typeof v === 'string' && mongoose.Types.ObjectId.isValid(v))
      : [];

    if (subDepartment && !mongoose.Types.ObjectId.isValid(subDepartment)) {
      subDepartment = undefined;
    }

    const filingDate = toDate(body.filingDate);
    const affidavitDueDate = toDate(body.affidavitDueDate);
    const affidavitSubmissionDate = toDate(body.affidavitSubmissionDate);

    const caseData = {
      caseNumber: body.caseNumber,
      petitionername,
      respondentname,
      filingDate,
      petitionNumber: body.petitionNumber,
      noticeNumber: body.noticeNumber,
      writType: body.writType,
      department,
      subDepartment: subDepartment || undefined,
      subDepartments: subDepartments,
      status: body.status || 'Pending',
      affidavitDueDate,
      affidavitSubmissionDate,
      counterAffidavitRequired: !!body.counterAffidavitRequired,
      updatedAt: new Date(),
    };

    const missing = [];
    // caseNumber is now optional
    if (!caseData.petitionername) missing.push('petitionerName');
    if (!caseData.respondentname) missing.push('respondentName');
    if (!caseData.filingDate) missing.push('filingDate (valid date)');
    if (typeof caseData.department !== 'number' || isNaN(caseData.department)) missing.push('department (number)');
    if (missing.length) {
      return res.status(400).json({ error: 'Missing or invalid fields', details: missing });
    }

    console.log('Creating case with normalized data:', caseData);
    const newCase = new Case(caseData);
    await newCase.save();
    await newCase.populate(['subDepartment', 'subDepartments']);

    // If multiple sub-departments are associated, record in MultiSubCase
    if (Array.isArray(caseData.subDepartments) && caseData.subDepartments.length > 1) {
      try {
        await MultiSubCase.findOneAndUpdate(
          { caseId: newCase._id },
          { caseId: newCase._id, subDepartments: caseData.subDepartments },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (e) {
        console.error('Failed to record MultiSubCase:', e && e.message);
      }
    }

    return res.status(201).json(newCase);
  } catch (err) {
    console.error('Error creating case:', err && err.message, err && err.errors);
    if (err && err.name === 'ValidationError') {
      const details = Object.entries(err.errors || {}).reduce((acc, [k, v]) => {
        acc[k] = v && v.message ? v.message : 'Invalid value';
        return acc;
      }, {});
      return res.status(400).json({ error: 'Validation failed', details });
    }
    return res.status(500).json({ error: 'Failed to create case', message: err && err.message ? err.message : 'Unknown error' });
  }
});

// Update case
app.put('/cases/:id', async (req, res) => {
  try {
    const caseId = req.params.id;
    const updateData = { ...req.body, updatedAt: new Date() };
    
    const updatedCase = await Case.findByIdAndUpdate(
      caseId, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!updatedCase) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    res.json(updatedCase);
  } catch (err) {
    console.error('Error updating case:', err);
    res.status(500).json({ error: 'Failed to update case' });
  }
});

// Delete case
app.delete('/cases/:id', async (req, res) => {
  try {
    const caseId = req.params.id;
    const deletedCase = await Case.findByIdAndDelete(caseId);
    
    if (!deletedCase) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    res.json({ message: 'Case deleted successfully' });
  } catch (err) {
    console.error('Error deleting case:', err);
    res.status(500).json({ error: 'Failed to delete case' });
  }
});

// ===== SUB-DEPARTMENT ENDPOINTS =====

// Create sub-department
app.post('/sub-departments', async (req, res) => {
  try {
    const { departmentId, subDeptNameEn, subDeptNameHi } = req.body;
    
    // Validate department exists
    const department = await Department.findOne({ id: parseInt(departmentId) });
    if (!department) {
      return res.status(400).json({ error: 'Department not found' });
    }
    
    const newSubDepartment = new SubDepartment({
      departmentId: parseInt(departmentId),
      name_en: subDeptNameEn,
      name_hi: subDeptNameHi
    });
    
    await newSubDepartment.save();
    res.status(201).json(newSubDepartment);
  } catch (err) {
    console.error('Error saving sub-department:', err);
    res.status(500).json({ error: 'Failed to save sub-department' });
  }
});

// Get sub-departments with optional filtering
app.get('/sub-departments', async (req, res) => {
  try {
    const { departmentId } = req.query;
    let query = {};
    
    if (departmentId) {
      query.departmentId = parseInt(departmentId);
    }
    
    const subDepartments = await SubDepartment.find(query).sort({ createdAt: -1 });
    res.json(subDepartments);
  } catch (err) {
    console.error('Error fetching sub-departments:', err);
    res.status(500).json({ error: 'Failed to fetch sub-departments' });
  }
});

// Get sub-department by ID
app.get('/sub-departments/:id', async (req, res) => {
  try {
    const subDeptId = req.params.id;
    const subDepartment = await SubDepartment.findById(subDeptId);
    
    if (!subDepartment) {
      return res.status(404).json({ error: 'Sub-department not found' });
    }
    
    res.json(subDepartment);
  } catch (err) {
    console.error('Error fetching sub-department:', err);
    res.status(500).json({ error: 'Failed to fetch sub-department' });
  }
});

// Update sub-department
app.put('/sub-departments/:id', async (req, res) => {
  try {
    const subDeptId = req.params.id;
    const updateData = req.body;
    
    const updatedSubDept = await SubDepartment.findByIdAndUpdate(
      subDeptId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedSubDept) {
      return res.status(404).json({ error: 'Sub-department not found' });
    }
    
    res.json(updatedSubDept);
  } catch (err) {
    console.error('Error updating sub-department:', err);
    res.status(500).json({ error: 'Failed to update sub-department' });
  }
});

// Delete sub-department
app.delete('/sub-departments/:id', async (req, res) => {
  try {
    const subDeptId = req.params.id;
    
    // Check if any cases are using this sub-department
    const casesUsingSubDept = await Case.findOne({ subDepartment: subDeptId });
    if (casesUsingSubDept) {
      return res.status(400).json({ 
        error: 'Cannot delete sub-department that has associated cases' 
      });
    }
    
    const deletedSubDept = await SubDepartment.findByIdAndDelete(subDeptId);
    
    if (!deletedSubDept) {
      return res.status(404).json({ error: 'Sub-department not found' });
    }
    
    res.json({ message: 'Sub-department deleted successfully' });
  } catch (err) {
    console.error('Error deleting sub-department:', err);
    res.status(500).json({ error: 'Failed to delete sub-department' });
  }
});

// ===== DEPARTMENT ENDPOINTS =====

// Get all departments
app.get('/departments', async (req, res) => {
  try {
    const departments = await Department.find({}).sort({ id: 1 });
    res.json(departments);
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// Get department by ID
app.get('/departments/:id', async (req, res) => {
  try {
    const department = await Department.findOne({ id: parseInt(req.params.id) });
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.json(department);
  } catch (err) {
    console.error('Error fetching department:', err);
    res.status(500).json({ error: 'Failed to fetch department' });
  }
});

// Create department
app.post('/departments', async (req, res) => {
  try {
    const { id, name_en, name_hi } = req.body;

    // Check if department with this ID already exists
    const existingDept = await Department.findOne({ id: parseInt(id) });
    if (existingDept) {
      return res.status(400).json({ error: 'Department with this ID already exists' });
    }
    
    const newDepartment = new Department({
      id: parseInt(id),
      name_en,
      name_hi,
     
    });
    
    await newDepartment.save();
    res.status(201).json(newDepartment);
  } catch (err) {
    console.error('Error creating department:', err);
    res.status(500).json({ error: 'Failed to create department' });
  }
});

// ===== EMAIL REMINDER ENDPOINTS =====

// Send email reminder
app.post('/email-reminders', async (req, res) => {
  try {
    const { caseId, email } = req.body;
    
    // Validate case exists
    const caseData = await Case.findById(caseId);
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    // Create email reminder record
    const emailReminder = new EmailReminder({
      caseId,
      email
    });
    
    await emailReminder.save();
    
    // Update case reminder count
    await Case.findByIdAndUpdate(caseId, {
      $inc: { reminderSentCount: 1 },
      reminderSent: true,
      lastReminderSent: new Date()
    });
    
    // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
    console.log(`Email reminder sent for case ${caseId} to ${email}`);
    
    res.status(201).json({
      message: 'Email reminder sent successfully',
      reminderId: emailReminder._id
    });
  } catch (err) {
    console.error('Error sending email reminder:', err);
    res.status(500).json({ error: 'Failed to send email reminder' });
  }
});

// Get email reminders for a case
app.get('/email-reminders/case/:caseId', async (req, res) => {
  try {
    const { caseId } = req.params;
    const reminders = await EmailReminder.find({ caseId }).sort({ sentAt: -1 });
    res.json(reminders);
  } catch (err) {
    console.error('Error fetching email reminders:', err);
    res.status(500).json({ error: 'Failed to fetch email reminders' });
  }
});

// ===== STATISTICS ENDPOINTS =====

// Get dashboard statistics
app.get('/statistics', async (req, res) => {
  try {
    const totalCases = await Case.countDocuments();
    const pendingCases = await Case.countDocuments({ status: 'Pending' });
    const resolvedCases = await Case.countDocuments({ status: 'Resolved' });
    const totalDepartments = await Department.countDocuments();
    const totalSubDepartments = await SubDepartment.countDocuments();
    
    // Cases by department
    const casesByDepartment = await Case.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Recent cases
    const recentCases = await Case.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      totalCases,
      pendingCases,
      resolvedCases,
      totalDepartments,
      totalSubDepartments,
      casesByDepartment,
      recentCases
    });
  } catch (err) {
    console.error('Error fetching statistics:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Endpoint to check if a case has multiple sub-departments
app.get('/cases/:id/multi-sub', async (req, res) => {
  try {
    const doc = await MultiSubCase.findOne({ caseId: req.params.id }).populate('subDepartments');
    res.json({ hasMultiple: !!doc, subDepartments: doc ? doc.subDepartments : [] });
  } catch (err) {
    console.error('Error checking multi-sub for case:', err);
    res.status(500).json({ error: 'Failed to check multi-sub status' });
  }
});

// ===== SEED DATA ENDPOINT =====

// Seed initial data
app.post('/seed-data', async (req, res) => {
  try {
    // Seed departments
    const departments = [
      { id: 1, name_en: "Administration Department", name_hi: "प्रशासन विभाग" },
      { id: 2, name_en: "Development Department", name_hi: "विकास विभाग" }
    ];
    
    for (const dept of departments) {
      await Department.findOneAndUpdate(
        { id: dept.id },
        dept,
        { upsert: true, new: true }
      );
    }
    
    res.json({ message: 'Seed data created successfully' });
  } catch (err) {
    console.error('Error seeding data:', err);
    res.status(500).json({ error: 'Failed to seed data' });
  }
});

// Admin login endpoint
app.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    // For simplicity, just return success (no JWT/session)
    res.json({ message: 'Login successful', email: admin.email });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Seed admin user endpoint (run once, then can be removed)
app.post('/admin/seed', async (req, res) => {
  try {
    const adminUsers = [
      { email: 'admincourt@gmail.com', password: 'Admin@123' },
      { email: 'courtadmin@gmail.com', password: 'Admin2@123' }
    ];

    const results = [];

    for (const { email, password } of adminUsers) {
      let admin = await Admin.findOne({ email });

      if (admin) {
        results.push({ email, status: 'Already exists' });
        continue;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      admin = new Admin({ email, password: hashedPassword });
      await admin.save();
      results.push({ email, status: 'Created' });
    }

    res.json({ message: 'Admin seeding complete', results });
  } catch (err) {
    console.error('Admin seed error:', err);
    res.status(500).json({ error: 'Failed to seed admin users' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/`);
  console.log(`API Documentation: Available endpoints:`);
  console.log(`- GET /cases - Get all cases`);
  console.log(`- POST /cases - Create new case`);
  console.log(`- PUT /cases/:id - Update case`);
  console.log(`- DELETE /cases/:id - Delete case`);
  console.log(`- GET /sub-departments - Get sub-departments`);
  console.log(`- POST /sub-departments - Create sub-department`);
  console.log(`- GET /departments - Get departments`);
  console.log(`- POST /email-reminders - Send email reminder`);
});