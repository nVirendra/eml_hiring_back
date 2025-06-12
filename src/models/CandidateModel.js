const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    position: {
      type: String,
      trim: true
    },
    dob: {
      type: String,
      trim: true
    },
    gender:{
      type:String,
      trim:true,
    },
    state: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    experience: {
      type: String,
      trim: true
    },
    resumeUrl:{
      type:String,
      trim:true,
      default:'',
    },
    currentCompany: {
      type: String,
      trim: true
    },companyState: {
      type: String,
      trim: true
    },
    companyCity: {
      type: String,
      trim: true
    },
    noticePeriod: {
      type: String,
      trim: true
    }
  }, {
  timestamps: true
});

module.exports = mongoose.model('CandidateModel',CandidateSchema);