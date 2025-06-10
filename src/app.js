const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const technologyRoutes = require('./routes/technology.routes');
const FormModel = require('./models/FormModel');
const CandidateResponseModel = require('./models/CandidateResponseModel')

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
  res.send('API is running');
});

//Route for authentication
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/technologies', technologyRoutes);


// Get all forms
app.get('/api/forms', async (req, res) => {
  try {
    const { page = 1, limit = 10, technology, isActive } = req.query;
    const filter = {};
    
    if (technology) filter.technology = new RegExp(technology, 'i');
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const forms = await FormModel.find(filter)
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await FormModel.countDocuments(filter);

    res.json({
      success: true,
      data: forms,
      // pagination: {
      //   current: page,
      //   pages: Math.ceil(total / limit),
      //   total
      // }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching forms',
      error: error.message
    });
  }
});

// Get form by ID
app.get('/api/forms/:technology', async (req, res) => {
  try {
    const form = await FormModel.find({technology:req.params.technology});
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    res.json({
      success: true,
      data: form
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching form',
      error: error.message
    });
  }
});

// Create new form
app.post('/api/forms', async (req, res) => {
  try {
    const { title, technology, questions, createdBy } = req.body;

    // Validate required fields
    if (!title || !technology || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title, technology, and questions are required'
      });
    }

    // Validate questions structure
    for (const question of questions) {
      if (!question.question || !question.type) {
        return res.status(400).json({
          success: false,
          message: 'Each question must have text and type'
        });
      }

      if (!['number', 'select', 'checkbox'].includes(question.type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid question type'
        });
      }
    }

    const form = new FormModel({
      title,
      technology,
      questions,
      createdBy: createdBy || 'admin'
    });

    const savedForm = await form.save();

    res.status(201).json({
      success: true,
      message: 'Form created successfully',
      data: savedForm
    });
  } catch (error) {
    console.log('Error: ',error.message)
    res.status(500).json({
      success: false,
      message: 'Error creating form',
      error: error.message
    });
  }
});

// Update form
app.put('/api/forms/:id', async (req, res) => {
  try {
    const { title, technology, questions, isActive } = req.body;

    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    // Update fields
    if (title) form.title = title;
    if (technology) form.technology = technology;
    if (questions) form.questions = questions;
    if (isActive !== undefined) form.isActive = isActive;

    const updatedForm = await form.save();

    res.json({
      success: true,
      message: 'Form updated successfully',
      data: updatedForm
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating form',
      error: error.message
    });
  }
});

// Delete form (soft delete)
app.delete('/api/forms/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    form.isActive = false;
    await form.save();

    res.json({
      success: true,
      message: 'Form deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting form',
      error: error.message
    });
  }
});

// ==================== CANDIDATE RESPONSE ROUTES ====================

// Submit candidate response
app.post('/api/responses', async (req, res) => {
  try {
    const { name, phone, email, dob, state, city, experience,questions,currentCompany, companyState, companyCity, noticePeriod,companyDesignation,  techId, tech} = req.body;
  
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Candidate name and email are required'
      });
    }

    // Check if form exists
    const form = await FormModel.findById(techId);
    if (!form || !form.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Form not found or inactive'
      });
    }

    // Check if candidate already submitted response for this form
    const existingResponse = await CandidateResponseModel.findOne({
      techId: techId,
      'candidateInfo.email': email
    });

    if (existingResponse) {
      return res.status(409).json({
        success: false,
        message: 'Candidate has already submitted response for this form'
      });
    }
    
    
    const questionsObj = questions;
    // Assuming req.body.questions is the object with questionId: answer
    
      const processedResponses = [];
      let totalScore = 0;

      // Convert scoring to Map if it's not already
      form.questions.forEach((q) => {
        if (!(q.scoring instanceof Map)) {
          q.scoring = new Map(Object.entries(q.scoring));
        }
      });

      for (const [questionId, answer] of Object.entries(questionsObj)) {
        const question = form.questions.find(q => q.id === questionId);
        if (!question) continue;

        let pointsEarned = 0;

        if (question.type === 'number') {
          const numAnswer = parseInt(answer) || 0;
          pointsEarned = question.scoring.get(numAnswer.toString()) || 0;
        } else if (question.type === 'select' || question.type === 'radio') {
          pointsEarned = question.scoring.get(answer) || 0;
        } else if (question.type === 'checkbox' && Array.isArray(answer)) {
          pointsEarned = answer.reduce((sum, value) => {
            return sum + (question.scoring.get(value) || 0);
          }, 0);
        }

        processedResponses.push({
          questionId,
          questionText: question.question,
          questionType: question.type,
          answer,
          pointsEarned
        });

        totalScore += pointsEarned;
      }

      //return { processedResponses, totalScore };
    

    
    // Create candidate response
    const candidateResponse = new CandidateResponseModel({
      techId,
      candidateInfo:{
        name,
        email,
        phone,
        position:companyDesignation,
        dob, 
        state,
        city,
        experience,
        currentCompany, 
        companyState, 
        companyCity, 
        noticePeriod
      },
      responses: processedResponses,
      totalScore
    });

    const savedResponse = await candidateResponse.save();

    res.status(201).json({
      success: true,
      message: 'Response submitted successfully',
      data: {
        responseId: savedResponse._id,
        totalScore: savedResponse.totalScore,
        submittedAt: savedResponse.submittedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting response',
      error: error.message
    });
  }
});

// Get all responses for a form
app.get('/api/forms/:formId/responses', async (req, res) => {
  try {
    const { formId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'totalScore', 
      sortOrder = 'desc',
      status,
      minScore,
      maxScore 
    } = req.query;

    const filter = { formId };
    
    if (status) filter.status = status;
    if (minScore !== undefined || maxScore !== undefined) {
      filter.totalScore = {};
      if (minScore !== undefined) filter.totalScore.$gte = parseInt(minScore);
      if (maxScore !== undefined) filter.totalScore.$lte = parseInt(maxScore);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const responses = await CandidateResponse.find(filter)
      .populate('formId', 'title technology')
      .select('-__v')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CandidateResponse.countDocuments(filter);

    // Get statistics
    const stats = await CandidateResponse.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$totalScore' },
          maxScore: { $max: '$totalScore' },
          minScore: { $min: '$totalScore' },
          totalCandidates: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: responses,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      },
      statistics: stats[0] || {
        averageScore: 0,
        maxScore: 0,
        minScore: 0,
        totalCandidates: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching responses',
      error: error.message
    });
  }
});

// Get specific candidate response
app.get('/api/responses/:id', async (req, res) => {
  try {
    const response = await CandidateResponseModel.findById(req.params.id)
      .populate('techId', 'title technology questions');

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Response not found'
      });
    }

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching response',
      error: error.message
    });
  }
});

// Update candidate status
app.patch('/api/responses/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['submitted', 'reviewed', 'selected', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const response = await CandidateResponse.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Response not found'
      });
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: response
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message
    });
  }
});

// Get leaderboard for a form
app.get('/api/forms/:formId/leaderboard', async (req, res) => {
  try {
    const { formId } = req.params;
    const { limit = 10 } = req.query;

    const leaderboard = await CandidateResponse.find({ formId })
      .populate('formId', 'title technology')
      .select('candidateInfo totalScore submittedAt status')
      .sort({ totalScore: -1, submittedAt: 1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message
    });
  }
});

// Dashboard statistics
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const totalForms = await FormModel.countDocuments({ isActive: true });
    const totalResponses = await CandidateResponseModel.countDocuments();
    
    const recentResponses = await CandidateResponseModel.find()
      .populate('techId', 'title technology')
      .select('candidateInfo totalScore submittedAt')
      .sort({ submittedAt: -1 })
      .limit(5);

    const topTechnologies = await FormModel.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$technology', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        totalForms,
        totalResponses,
        recentResponses,
        topTechnologies
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
});



module.exports = app;
