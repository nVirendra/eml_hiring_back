const { body, validationResult } = require('express-validator');

// Register validations
const validateRegister = [
  body('firstName').notEmpty().withMessage('First name is required'),

  body('email').isEmail().withMessage('Valid email is required'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[@$!%*?&#]/)
    .withMessage('Password must contain at least one special character'),

  body('phone').isMobilePhone().withMessage('Valid phone number is required'),

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
  validateRegister,
};
