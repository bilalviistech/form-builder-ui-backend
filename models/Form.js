const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // We'll use UUID as string
  fields: { type: Array, required: true },
  salesperson_email: { type: String, required: true },
  submissionsId: { type: String, ref: 'Submission' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Form', formSchema);