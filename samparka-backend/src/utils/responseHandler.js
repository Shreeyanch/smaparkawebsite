/**
 * Standardized API Response Handler
 * Ensures consistent response format across all endpoints
 */

module.exports = {
  /**
   * Success response
   * @param {Object} res - Express response object
   * @param {any} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code (default 200)
   */
  success: (res, data, message = "Success", statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  },

  /**
   * Error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default 400)
   * @param {any} errors - Additional error details
   */
  error: (res, message, statusCode = 400, errors = null) => {
    const response = {
      success: false,
      message,
    };
    if (errors) {
      response.errors = errors;
    }
    return res.status(statusCode).json(response);
  },

  /**
   * Paginated response
   * @param {Object} res - Express response object
   * @param {Array} data - Array of items
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @param {number} total - Total item count
   * @param {string} message - Success message
   */
  paginated: (res, data, page, limit, total, message = "Success") => {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  },

  /**
   * Created response (201)
   * @param {Object} res - Express response object
   * @param {any} data - Created resource data
   * @param {string} message - Success message
   */
  created: (res, data, message = "Created successfully") => {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  },

  /**
   * No content response (204)
   * @param {Object} res - Express response object
   */
  noContent: (res) => {
    return res.status(204).send();
  },

  /**
   * Not found response (404)
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  notFound: (res, message = "Resource not found") => {
    return res.status(404).json({
      success: false,
      message,
    });
  },

  /**
   * Unauthorized response (401)
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  unauthorized: (res, message = "Unauthorized") => {
    return res.status(401).json({
      success: false,
      message,
    });
  },

  /**
   * Server error response (500)
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  serverError: (res, message = "Internal server error") => {
    return res.status(500).json({
      success: false,
      message,
    });
  },
};
