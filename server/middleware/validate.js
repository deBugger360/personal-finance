const { AppError } = require('./error');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    next(new AppError(message, 400));
  }
};

module.exports = { validate };
