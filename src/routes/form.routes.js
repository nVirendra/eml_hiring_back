// routes/form.routes.js
const express = require('express');
const router = express.Router();
const FormModel = require('../models/FormModel'); // adjust path to your model
const authenticate = require('../middlewares/auth.middleware')

// Get all forms with filter, pagination
router.get('/', async (req, res) => {
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
      total,
    });
  } catch (error) {
    console.error('Error getting forms:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching forms',
      error: error.message,
    });
  }
});

// Get form by technology
router.get('/:technology', async (req, res) => {
  try {
    const form = await FormModel.find({ technology: req.params.technology });

    if (!form || form.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Form not found',
      });
    }

    res.json({
      success: true,
      data: form,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching form',
      error: error.message,
    });
  }
});

// Create a new form
router.post('/', authenticate, async (req, res) => {
 try {
     const {  technology, questions, createdBy } = req.body;
 
     // Validate required fields
     if (!technology || !questions || questions.length === 0) {
       return res.status(400).json({
         success: false,
         message: 'technology, and questions are required',
       });
     }
 
     // Validate questions structure
     for (const question of questions) {
       if (!question.question || !question.type) {
         return res.status(400).json({
           success: false,
           message: 'Each question must have text and type',
         });
       }
 
       if (!['number', 'select', 'checkbox'].includes(question.type)) {
         return res.status(400).json({
           success: false,
           message: 'Invalid question type',
         });
       }
     }
 
     const form = new FormModel({
       technology,
       questions,
       createdBy: createdBy || 'admin',
     });
 
     const savedForm = await form.save();
 
     res.status(201).json({
       success: true,
       message: 'Form created successfully',
       data: savedForm,
     });
   } catch (error) {
     console.log('Error: ', error.message);
     res.status(500).json({
       success: false,
       message: 'Error creating form',
       error: error.message,
     });
   }
});


module.exports = router;
