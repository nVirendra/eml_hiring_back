const mongoose = require('mongoose');

const CandidateResponseSchema = new mongoose.Schema({
  techId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FormModel',
    required: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CandidateModel',
    required: true
  },
  responses: [{
    questionId: {
      type: String,
      required: true
    },
    questionText: String,
    questionType: {
      type: String,
      enum: ['number', 'select', 'checkbox']
    },
    answer: mongoose.Schema.Types.Mixed, // Can be string, number, or array
    pointsEarned: {
      type: Number,
      default: 0
    }
  }],
  totalScore: {
    type: Number,
    default: 0
  },
  actualTotalScore:{
    type: Number,
    default: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['submitted', 'reviewed', 'selected', 'rejected'],
    default: 'submitted'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CandidateResponseModel',CandidateResponseSchema);