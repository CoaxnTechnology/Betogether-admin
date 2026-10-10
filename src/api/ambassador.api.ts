import client, { API_BASE_URL } from "./client";

// The ambassador module lives under /api/ambassador, a sibling of the
// /api/admin prefix baked into `client`'s baseURL — so these calls use
// absolute URLs. `client` still attaches the auth token and handles 401s
// via its interceptors regardless of the URL being absolute.
const AMBASSADOR_BASE = `${API_BASE_URL}/api/ambassador`;

// =====================================
// APPLICATIONS
// =====================================

export const getAllApplications = async () => {
  return client.get(`${AMBASSADOR_BASE}/admin/ambassador-applications`);
};

export const approveApplication = async (
  applicationId: string,
  data: {
    ambassadorType: "standard" | "exclusive";
    commissionRate: number;
    territoryIds?: string[];
    parentAmbassadorId?: string;
  },
) => {
  return client.post(`${AMBASSADOR_BASE}/admin/approve/${applicationId}`, data);
};

export const rejectApplication = async (applicationId: string, reason: string) => {
  return client.post(`${AMBASSADOR_BASE}/admin/reject/${applicationId}`, {
    reason,
  });
};

// =====================================
// AMBASSADORS
// =====================================

export const getAllAmbassadors = async () => {
  return client.get(`${AMBASSADOR_BASE}/admin/ambassadors`);
};

export const makeAmbassador = async (
  userId: string,
  data: {
    ambassadorType: "standard" | "exclusive";
    commissionRate: number;
    territoryId?: string;
    parentAmbassadorId?: string;
  },
) => {
  return client.post(`${AMBASSADOR_BASE}/admin/make-ambassador/${userId}`, data);
};

export const removeAmbassador = async (userId: string) => {
  return client.post(`${AMBASSADOR_BASE}/remove-ambassador/${userId}`, {});
};

export const assignParentAmbassador = async (
  userId: string,
  parentAmbassadorId: string,
) => {
  return client.post(`${AMBASSADOR_BASE}/admin/assign-parent-ambassador/${userId}`, {
    parentAmbassadorId,
  });
};

// =====================================
// DASHBOARD
// =====================================

export const getAmbassadorDashboard = async () => {
  return client.get(`${AMBASSADOR_BASE}/dashboard`);
};

export const getWalletHistory = async (page: number, limit: number) => {
  return client.get(`${AMBASSADOR_BASE}/wallet-history?page=${page}&limit=${limit}`);
};

export const getAmbassadorById = async (id: string) => {
  return client.get(`${AMBASSADOR_BASE}/admin/${id}`);
};

export const getAmbassadorWalletHistory = async (id: string) => {
  return client.get(`${AMBASSADOR_BASE}/admin/${id}/wallet-history`);
};

export const getAmbassadorAnalytics = async (id: string) => {
  return client.get(`${AMBASSADOR_BASE}/admin/${id}/analytics`);
};

export const updateAmbassador = async (
  userId: string,
  data: {
    commissionRate: number;
    territoryIds?: string[];
  },
) => {
  return client.post(`${AMBASSADOR_BASE}/admin/update-ambassador/${userId}`, data);
};
