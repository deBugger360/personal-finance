// Consistent Error Response Shape
// {
//   error: "Human readable message",
//   code: "ERROR_CODE", (Optional)
//   details: ... (Optional, dev only)
// }

function errorHandler(err, req, res, next) {
  console.error("Server Error:", err);

  const statusCode = err.statusCode || 500;
  const response = {
    error: err.message || 'Internal Server Error'
  };

  // Safe exposure of SQLite constraints
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    response.error = 'This item already exists.';
    response.code = 'DUPLICATE_ENTRY';
    return res.status(409).json(response);
  }

  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    response.error = 'Invalid reference (e.g., category not found).';
    response.code = 'INVALID_REFERENCE';
    return res.status(400).json(response);
  }

  res.status(statusCode).json(response);
}

// Wrapper to catch async errors automatically
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom Error Class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { errorHandler, asyncHandler, AppError };
