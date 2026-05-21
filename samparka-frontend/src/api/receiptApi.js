import api from "./config";

const receiptApi = {
  // ── Customer endpoints ───────────────────────────────────────────────────────

  // OCR-only extract — no DB write. Returns structured data for confirm screen.
  // Optional provider param for admin testing: "paddleocr" | "google_vision"
  extractReceipt: (formData, token, provider = null) => {
    const url = provider
      ? `/api/receipts/extract?provider=${provider}`
      : "/api/receipts/extract";
    return api.post(url, formData, {
      headers: { token, "Content-Type": "multipart/form-data" },
    });
  },

  submitReceipt: (formData, token) =>
    api.post("/api/receipts/submit/customer", formData, {
      headers: { token, "Content-Type": "multipart/form-data" },
    }),

  getCustomerHistory: (token, page = 1) =>
    api.get(`/api/receipts/customer/history?page=${page}&limit=10`, {
      headers: { token },
    }),

  // ── Store staff / admin endpoints ────────────────────────────────────────────

  // OCR-only extract for staff (no DB write). Uses storeMiddleware auth.
  extractReceiptStaff: (formData, storeToken, provider = null) => {
    const url = provider
      ? `/api/receipts/extract/staff?provider=${provider}`
      : "/api/receipts/extract/staff";
    return api.post(url, formData, {
      headers: { token: storeToken, "Content-Type": "multipart/form-data" },
    });
  },

  submitReceiptStaff: (formData, storeToken, provider = null) => {
    const url = provider
      ? `/api/receipts/submit/staff?provider=${provider}`
      : "/api/receipts/submit/staff";
    return api.post(url, formData, {
      headers: { token: storeToken, "Content-Type": "multipart/form-data" },
    });
  },

  listSubmissions: (storeToken, status = "pending", page = 1) =>
    api.get(`/api/receipts/submissions?status=${status}&page=${page}&limit=20`, {
      headers: { token: storeToken },
    }),

  getSubmissionDetail: (submissionId, storeToken) =>
    api.get(`/api/receipts/${submissionId}/detail`, {
      headers: { token: storeToken },
    }),

  approve: (submissionId, storeToken, payload = {}) =>
    api.post(`/api/receipts/${submissionId}/approve`, payload, {
      headers: { token: storeToken },
    }),

  reject: (submissionId, storeToken, payload = {}) =>
    api.post(`/api/receipts/${submissionId}/reject`, payload, {
      headers: { token: storeToken },
    }),

  reverse: (submissionId, storeToken, payload = {}) =>
    api.post(`/api/receipts/${submissionId}/reverse`, payload, {
      headers: { token: storeToken },
    }),

  // ── Portal endpoints (user JWT from admin portal — authMiddleware) ───────────

  listPortalStores: (token) =>
    api.get("/api/receipts/portal/stores", { headers: { token } }),

  listPortalSubmissions: (token, storeId, status = "pending", page = 1) =>
    api.get(`/api/receipts/portal/submissions?storeId=${storeId}&status=${status}&page=${page}&limit=20`, {
      headers: { token },
    }),

  approvePortal: (submissionId, token, payload = {}) =>
    api.post(`/api/receipts/portal/${submissionId}/approve`, payload, { headers: { token } }),

  rejectPortal: (submissionId, token, payload = {}) =>
    api.post(`/api/receipts/portal/${submissionId}/reject`, payload, { headers: { token } }),

  reversePortal: (submissionId, token, payload = {}) =>
    api.post(`/api/receipts/portal/${submissionId}/reverse`, payload, { headers: { token } }),

  updatePortalScanConfig: (token, storeId, payload) =>
    api.put(`/api/receipts/portal/scan-config/${storeId}`, payload, { headers: { token } }),

  getItemAnalytics: (token, storeId, dateRange = "30d") =>
    api.get(`/api/receipts/portal/item-analytics?storeId=${storeId}&dateRange=${dateRange}`, {
      headers: { token },
    }),

  // Scan config update (store token — storeMiddleware)
  updateScanConfig: (storeToken, payload) =>
    api.put("/api/receipts/scan-config", payload, { headers: { token: storeToken } }),
};

export default receiptApi;
