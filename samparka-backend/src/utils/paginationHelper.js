/**
 * Pagination Helper
 * Extracts and validates pagination parameters from request
 */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const MIN_LIMIT = 1;

module.exports = {
  /**
   * Extract pagination params from request query
   * @param {Object} req - Express request object
   * @returns {{ page: number, limit: number, skip: number }}
   */
  getPaginationParams: (req) => {
    const page = Math.max(DEFAULT_PAGE, parseInt(req.query.page) || DEFAULT_PAGE);
    const limit = Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, parseInt(req.query.limit) || DEFAULT_LIMIT));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  },

  /**
   * Build pagination metadata for response
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @param {number} total - Total item count
   * @returns {Object} Pagination metadata
   */
  buildPaginationMeta: (page, limit, total) => {
    const pages = Math.ceil(total / limit);
    return {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    };
  },

  /**
   * Build MongoDB aggregation pagination stages
   * @param {number} skip - Documents to skip
   * @param {number} limit - Documents to return
   * @returns {Array} Aggregation stages
   */
  getAggregationPagination: (skip, limit) => {
    return [{ $skip: skip }, { $limit: limit }];
  },

  // Constants exported for use elsewhere
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
};
