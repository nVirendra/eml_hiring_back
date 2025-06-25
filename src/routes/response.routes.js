
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;

const upload = require('../utils/upload');
const cloudinary = require('../config/cloudinary');
const FormModel = require('../models/FormModel')
const CandidateResponseModel = require('../models/CandidateResponseModel');
const CandidateModel = require('../models/CandidateModel');
const authenticate = require('../middlewares/auth.middleware')



const uploadToCloudinary = (fileBuffer, originalName) => {
  return new Promise((resolve, reject) => {
    const fileNameWithoutExt = originalName.split('.').slice(0, -1).join('-');

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'eml_hire/resumes',
        resource_type: 'raw',
        public_id: `${fileNameWithoutExt}-${Date.now()}`,
        use_filename: true,
        overwrite: true
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
};



// Submit candidate response
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      dob,
      gender,
      state,
      city,
      permanent_city,
      experience,
      questions,
      currentCompany,
      companyState,
      companyCity,
      noticePeriod,
      companyDesignation,
      techId,
      tech,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Candidate name and email are required',
      });
    }

    const resume = req.file;
    var resumeUrl = '';
    if (resume) {
      const result = await uploadToCloudinary(resume.buffer,resume.originalname);
      resumeUrl = result.secure_url;
    }

    const  candidateInfo =  {
            name,
            email,
            phone,
            position: companyDesignation,
            dob,
            gender,
            state,
            city,
            permanent_city,
            experience,
            resumeUrl,
            currentCompany,
            companyState,
            companyCity,
            noticePeriod,
    };


   // Check if candidate exists
    let candidate = await CandidateModel.findOne({ email });
    let candidateId;
    if (candidate) {
        await CandidateModel.updateOne(
        { _id: candidate._id },
        { $set: candidateInfo }
      );
    }else{
      const newCandidate = new CandidateModel(candidateInfo);
      candidate = await newCandidate.save();
    }
    candidateId = candidate._id;

    //store candidate response if tech selected
    if(techId){
      // Check if form exists
      const form = await FormModel.findById(techId);
      if (!form || !form.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Form not found or inactive',
        });
      }

      // Check if candidate already submitted response for this form
      // const existingResponse = await CandidateResponseModel.findOne({
      //   techId: techId,
      //   candidateId: candidateId,
      // });

      // if (existingResponse) {
      //   return res.status(409).json({
      //     success: false,
      //     message: 'Candidate has already submitted response for this form',
      //   });
      // }

      const questionsObj = questions;
      // Assuming req.body.questions is the object with questionId: answer

      const processedResponses = [];
      let totalScore = 0;
      let actualTotalScore = 0;

      // Convert scoring to Map if it's not already
      form.questions.forEach((q) => {
        if (!(q.scoring instanceof Map)) {
          q.scoring = new Map(Object.entries(q.scoring));
        }
      });

      

      for (const [questionId, answer] of Object.entries(questionsObj)) {
        const question = form.questions.find((q) => q.id === questionId);
        if (!question) continue;

        console.log( 'debug',question.type, question.scoring);


        let actualPoints = 0;
        let pointsEarned = 0;

        if (question.type === 'number') {
          const numAnswer = parseInt(answer) || 0;
          pointsEarned = question.scoring.get(numAnswer.toString()) || 0;

          // Take maximum value from scoring for number type
        actualPoints = Math.max(...question.scoring.values());

        } else if (question.type === 'select' || question.type === 'radio') {
          pointsEarned = question.scoring.get(answer) || 0;

          // Take maximum value from scoring for select/radio type
          actualPoints = Math.max(...question.scoring.values());

        } else if (question.type === 'checkbox' && Array.isArray(answer)) {
          pointsEarned = answer.reduce((sum, value) => {
            return sum + (question.scoring.get(value) || 0);
          }, 0);

          // Take sum of all scoring values for checkbox type
          actualPoints = Array.from(question.scoring.values()).reduce((sum, value) => sum + value, 0);
        }

        processedResponses.push({
          questionId,
          questionText: question.question,
          questionType: question.type,
          answer,
          pointsEarned,
        });

        totalScore += pointsEarned;
        actualTotalScore += actualPoints;
      }

      // Create candidate response
      const candidateResponse = new CandidateResponseModel({
        techId,
        candidateId:candidateId,
        responses: processedResponses,
        totalScore,
        actualTotalScore,
      });

      const savedResponse = await candidateResponse.save();

      res.status(201).json({
        success: true,
        message: 'Response submitted successfully',
        data: {
          responseId: savedResponse._id,
          totalScore: savedResponse.totalScore,
          submittedAt: savedResponse.submittedAt,
        },
      });

    }


    res.status(201).json({
        success: true,
        message: 'Caniddate information successfully saved',
        data: {
          candidateId:candidateId,
        },
      });

    
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: 'Error submitting response',
      error: error.message,
    });
  }
});


// Dashboard statistics
router.get('/stats', authenticate, async (req, res) => {
  try {

    const { tech, page = 1, limit = 6 } = req.query;

    console.log(tech, page, limit  );
    const skip = (parseInt(page) - 1) * parseInt(limit);

    
    let techFilter = {};
    if (tech && ObjectId.isValid(tech)) {
      techFilter = { techId: new ObjectId(tech) };
    }



    const totalForms = await FormModel.countDocuments({ isActive: true });
    const totalResponses = await CandidateResponseModel.countDocuments();

    const totalTechResponseCount = await CandidateResponseModel.find(techFilter).countDocuments();

    let recentResponses = await CandidateResponseModel.find(techFilter)
      .populate('techId', 'title technology')
      .populate('candidateId') // candidate info
      .select('candidateId totalScore actualTotalScore submittedAt')
      .sort({ totalScore: -1, submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)).lean();

      // Rename candidateId to candidateInfo in result
      recentResponses = recentResponses.map(resp => ({
        ...resp,
        candidateInfo: resp.candidateId,
        candidateId: undefined,
      }));

    const topTechnologies = await CandidateResponseModel.aggregate([
      {
        $lookup: {
          from: 'formmodels',
          localField: 'techId',
          foreignField: '_id',
          as: 'form'
        }
      },
      {
        $unwind: {
          path: '$form',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $group: {
          _id: {
            technology: '$form.technology',
            formId: '$form._id'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          _id: 0,
          technology: '$_id.technology',
          formId: '$_id.formId',
          count: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalForms,
        totalResponses,
        totalTechResponseCount,
        recentResponses,
        topTechnologies,
      },
    });
  } catch (error) {
    console.log('this is err',error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message,
    });
  }
});

// Get specific candidate response
router.get('/:id', async (req, res) => {
  try {
  
    const response = await CandidateResponseModel.findById(req.params.id)
      .populate('techId', 'title technology questions')  // include form info
      .populate('candidateId')                           // full candidate details
      .lean();

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Response not found',
      });
    }

    // Rename candidateId to candidateInfo for frontend clarity
    const formattedResponse = {
      ...response,
      candidateInfo: response.candidateId,
    };
    delete formattedResponse.candidateId;

    res.json({
      success: true,
      data: formattedResponse,
    });
  } catch (error) {
    console.error('Error fetching candidate response:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching response',
      error: error.message,
    });
  }
});

module.exports = router;
