import express from "express";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import Form from "../models/Form.js";
import Submission from "../models/Submission.js";
import "dotenv/config";

const router = express.Router();

const EMAIL_USER="yourgmail@gmail.com"
const EMAIL_PASS="your-app-password"

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// 1. Create new form
router.post('/forms', async (req, res) => {
  try {
    const { fields, salesperson_email } = req.body;

    if (!fields || !Array.isArray(fields) || !salesperson_email) {
      return res.status(400).json({ error: 'Missing fields or email' });
    }

    const formId = uuidv4();

    const newForm = new Form({
      _id: formId,
      fields,
      salesperson_email,
    });

    await newForm.save();

    res.json({ formId });
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({ error: 'Failed to create form' });
  }
});

// 2. Get form by ID
router.get('/forms/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    res.json({ fields: form.fields, submissionsId: form.submissionsId || null });
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. Submit form responses
router.post('/submissions/:formId', async (req, res) => {
  try {
    const { responses } = req.body;

    if (!responses || typeof responses !== 'object') {
      return res.status(400).json({ error: 'Invalid responses' });
    }

    // Save submission
    const submission = new Submission({
      formId: req.params.formId,
      responses,
    });
    await submission.save();

    if(submission._id){
      Form.findByIdAndUpdate(req.params.formId, { $set: { submissionsId: submission._id } }).exec();
      req.params.formId
    }

    // Find salesperson email
    const form = await Form.findById(req.params.formId);
    if (form && form.salesperson_email) {
      const mailOptions = {
        from: EMAIL_USER,
        to: form.salesperson_email,
        subject: 'New Form Submission Received',
        text: `Form ID: ${req.params.formId}\n\nResponses:\n${JSON.stringify(responses, null, 2)}`,
        html: `<pre>${JSON.stringify(responses, null, 2)}</pre>`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Email error:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
    }

    res.json({ success: true, message: 'Submission received' });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ error: 'Failed to save submission' });
  }
});

// GET /api/forms - Get all forms (for dashboard)
router.get('/forms', async (req, res) => {
  try {
    const forms = await Form.find().sort({ createdAt: -1 });
    res.json(forms);
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/submissions/:formId - Get all submissions for a form
router.get('/submissions/:formId', async (req, res) => {
  try {
    const submissions = await Submission.find({ formId: req.params.formId }).sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;