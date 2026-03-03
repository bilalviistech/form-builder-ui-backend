import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  formId: { type: String, required: true, ref: 'Form' },
  responses: { type: Object, required: true },
  submittedAt: { type: Date, default: Date.now }
});

const Submission = mongoose.model("Submission", submissionSchema);
export default Submission;