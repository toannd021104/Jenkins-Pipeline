// Standard response helpers for consistent API responses

const success = (data, message = 'Success', statusCode = 200) => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

const error = (message, statusCode = 500, details = null) => {
  const response = {
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  };
  
  if (details) {
    response.details = details;
  }
  
  return response;
};

const paginated = (data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    },
    timestamp: new Date().toISOString()
  };
};

// Express middleware for consistent responses
const sendSuccess = (req, res, next) => {
  res.success = (data, message, statusCode = 200) => {
    res.status(statusCode).json(success(data, message, statusCode));
  };
  next();
};

const sendError = (req, res, next) => {
  res.error = (message, statusCode = 500, details = null) => {
    res.status(statusCode).json(error(message, statusCode, details));
  };
  next();
};

const sendPaginated = (req, res, next) => {
  res.paginated = (data, page, limit, total) => {
    res.json(paginated(data, page, limit, total));
  };
  next();
};

module.exports = {
  success,
  error,
  paginated,
  sendSuccess,
  sendError,
  sendPaginated
};