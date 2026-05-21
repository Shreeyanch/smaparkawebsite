import api from "./config";

/**
 * L5 Loyalty API Service
 * Handles all L5 loyalty system API calls
 */
const l5Api = {
  // ========================
  // POINTS
  // ========================

  /**
   * Get customer's L5 points balance across all outlets
   */
  getPointsBalance: async (storeId, token) => {
    const response = await api.get(`/api/l5/points/${storeId}`, {
      headers: { token },
    });
    return response.data;
  },

  /**
   * Get customer's point transactions
   */
  getTransactions: async (storeId, token, params = {}) => {
    const response = await api.get(`/api/l5/points/${storeId}/transactions`, {
      headers: { token },
      params,
    });
    return response.data;
  },

  // ========================
  // REDEMPTIONS (Discounts)
  // ========================

  /**
   * Redeem a discount at a specific outlet
   */
  redeemDiscount: async (storeId, outletId, threshold, token) => {
    const response = await api.post(
      `/api/l5/redemptions/${storeId}`,
      { outletId, threshold },
      { headers: { token } }
    );
    return response.data;
  },

  /**
   * Get active redemptions (discounts) for customer
   */
  getActiveRedemptions: async (storeId, token) => {
    const response = await api.get(`/api/l5/redemptions/${storeId}/active`, {
      headers: { token },
    });
    return response.data;
  },

  /**
   * Get redemption history
   */
  getRedemptionHistory: async (storeId, token) => {
    const response = await api.get(`/api/l5/redemptions/${storeId}/history`, {
      headers: { token },
    });
    return response.data;
  },

  /**
   * Use a redemption (mark as used)
   */
  useRedemption: async (storeId, redemptionId, token) => {
    const response = await api.post(
      `/api/l5/redemptions/${storeId}/${redemptionId}/use`,
      {},
      { headers: { token } }
    );
    return response.data;
  },

  // ========================
  // VOUCHERS
  // ========================

  /**
   * Get customer's vouchers
   */
  getVouchers: async (storeId, token, status = null) => {
    const params = status ? { status } : {};
    const response = await api.get(`/api/l5/vouchers/${storeId}`, {
      headers: { token },
      params,
    });
    return response.data;
  },

  /**
   * Use a voucher
   */
  useVoucher: async (storeId, voucherId, token) => {
    const response = await api.post(
      `/api/l5/vouchers/${storeId}/${voucherId}/use`,
      {},
      { headers: { token } }
    );
    return response.data;
  },

  // ========================
  // LEADERBOARD
  // ========================

  /**
   * Get current month's leaderboard
   */
  getCurrentLeaderboard: async (storeId, token) => {
    const response = await api.get(`/api/l5/leaderboard/${storeId}/current`, {
      headers: { token },
    });
    return response.data;
  },

  /**
   * Get leaderboard history (past months)
   */
  getLeaderboardHistory: async (storeId, token, months = 6) => {
    const response = await api.get(`/api/l5/leaderboard/${storeId}/history`, {
      headers: { token },
      params: { months },
    });
    return response.data;
  },

  /**
   * Get monthly winners
   */
  getMonthlyWinners: async (storeId, token, limit = 12) => {
    const response = await api.get(`/api/l5/leaderboard/${storeId}/winners`, {
      headers: { token },
      params: { limit },
    });
    return response.data;
  },

  // ========================
  // THREE MONTH WINNERS
  // ========================

  /**
   * Get three month winners
   */
  getThreeMonthWinners: async (storeId, token) => {
    const response = await api.get(`/api/l5/three-month-winners/${storeId}`, {
      headers: { token },
    });
    return response.data;
  },

  // ========================
  // CONFIG
  // ========================

  /**
   * Get L5 configuration for a store
   */
  getConfig: async (storeId, token) => {
    const response = await api.get(`/api/l5/config/${storeId}`, {
      headers: { token },
    });
    return response.data;
  },

  // ========================
  // ADMIN ENDPOINTS
  // ========================

  /**
   * Award prizes to leaderboard winners (admin only)
   */
  awardPrizes: async (storeId, month, year, prizes, adminToken) => {
    const response = await api.post(
      `/api/l5/leaderboard/${storeId}/award`,
      { month, year, prizes },
      { headers: { token: adminToken } }
    );
    return response.data;
  },

  /**
   * Award three month prize (admin only)
   */
  awardThreeMonthPrize: async (storeId, winnerId, adminToken) => {
    const response = await api.post(
      `/api/l5/three-month-winners/${storeId}/${winnerId}/award`,
      {},
      { headers: { token: adminToken } }
    );
    return response.data;
  },

  /**
   * Update L5 configuration (admin only)
   */
  updateConfig: async (storeId, config, adminToken) => {
    const response = await api.put(
      `/api/l5/config/${storeId}`,
      config,
      { headers: { token: adminToken } }
    );
    return response.data;
  },

  /**
   * Enable L5 format for a store (admin only)
   */
  enableL5Format: async (storeId, adminToken) => {
    const response = await api.post(
      `/api/l5/config/${storeId}/enable`,
      {},
      { headers: { token: adminToken } }
    );
    return response.data;
  },

  /**
   * Get admin dashboard data
   */
  getAdminDashboard: async (storeId, adminToken) => {
    // Fetch multiple data points for admin dashboard
    const [leaderboard, threeMonthWinners, config] = await Promise.all([
      api.get(`/api/l5/leaderboard/${storeId}/current`, {
        headers: { token: adminToken },
      }),
      api.get(`/api/l5/three-month-winners/${storeId}`, {
        headers: { token: adminToken },
      }),
      api.get(`/api/l5/config/${storeId}`, {
        headers: { token: adminToken },
      }),
    ]);

    return {
      leaderboard: leaderboard.data,
      threeMonthWinners: threeMonthWinners.data,
      config: config.data,
    };
  },
};

export default l5Api;
