const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  formId: { type: String, required: true, ref: 'Form' },
  responses: { type: Object, required: true },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', submissionSchema);