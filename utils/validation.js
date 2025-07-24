const { body } = require('express-validator');

const registerValidation = [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const auctionValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('startingPrice').isNumeric().withMessage('Starting price must be a number'),
  body('endTime').notEmpty().withMessage('End time is required')
];

module.exports = { registerValidation, auctionValidation }; 