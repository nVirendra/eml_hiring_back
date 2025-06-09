const { body, validationResult } = require('express-validator');

// Register validations
const validateCreateTech = [
  body('name').notEmpty().withMessage('First name is required'),


  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Group errors by field
      const groupedErrors = errors.array().reduce((acc, err) => {
        const existing = acc.find((e) => e.field === err.path);
        if (existing) {
          existing.msgs.push(err.msg);
        } else {
          acc.push({ field: err.path, msgs: [err.msg] });
        }
        return acc;
      }, []);

      return res.status(422).json({
        status: false,
        message: 'Validation failed',
        errors: groupedErrors,
      });
    }

    next();
  },
];

module.exports = {
  validateCreateTech,
};
