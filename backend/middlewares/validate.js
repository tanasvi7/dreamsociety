const Joi = require('joi');
const { ValidationError } = require('./errorHandler');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
  if (error) {
    return next(new ValidationError(error.details.map(d => d.message).join(', ')));
  }
  next();
};

module.exports = validate; 