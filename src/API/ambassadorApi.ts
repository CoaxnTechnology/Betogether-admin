import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

// =====================================
// APPLICATIONS
// =====================================

export const getAllApplications = async (token: string) => {
  return axios.get(`${BASE_URL}/api/ambassador/admin/ambassador-applications`, {
    headers: getHeaders(token),
  });
};

export const approveApplication = async (
  applicationId: string,
  data: {
    ambassadorType: "standard" | "exclusive";
    commissionRate: number;
    territoryId?: string;
    parentAmbassadorId?: string;
  },
  token: string,
) => {
  return axios.post(
    `${BASE_URL}/api/ambassador/admin/approve/${applicationId}`,
    data,
    {
      headers: getHeaders(token),
    },
  );
};

export const rejectApplication = async (
  applicationId: string,
  reason: string,
  token: string,
) => {
  return axios.post(
    `${BASE_URL}/api/ambassador/admin/reject/${applicationId}`,
    {
      reason,
    },
    {
      headers: getHeaders(token),
    },
  );
};

// =====================================
// AMBASSADORS
// =====================================

export const getAllAmbassadors = async (token: string) => {
  return axios.get(`${BASE_URL}/api/ambassador/admin/ambassadors`, {
    headers: getHeaders(token),
  });
};

export const makeAmbassador = async (
  userId: string,
  data: {
    ambassadorType: "standard" | "exclusive";
    commissionRate: number;
    territoryId?: string;
    parentAmbassadorId?: string;
  },
  token: string,
) => {
  return axios.post(
    `${BASE_URL}/api/ambassador/admin/make-ambassador/${userId}`,
    data,
    {
      headers: getHeaders(token),
    },
  );
};

export const removeAmbassador = async (
  userId: string,
  token: string
) => {
  return axios.post(
    `${BASE_URL}/api/ambassador/remove-ambassador/${userId}`,
    {},
    {
      headers: getHeaders(token),
    }
  );
};

export const assignParentAmbassador = async (
  userId: string,
  parentAmbassadorId: string,
  token: string,
) => {
  return axios.post(
    `${BASE_URL}/api/ambassador/admin/assign-parent-ambassador/${userId}`,
    {
      parentAmbassadorId,
    },
    {
      headers: getHeaders(token),
    },
  );
};

// =====================================
// DASHBOARD
// =====================================

export const getAmbassadorDashboard = async (token: string) => {
  return axios.get(`${BASE_URL}/api/ambassador/dashboard`, {
    headers: getHeaders(token),
  });
};

export const getWalletHistory = async (
  page: number,
  limit: number,
  token: string,
) => {
  return axios.get(
    `${BASE_URL}/api/ambassador/wallet-history?page=${page}&limit=${limit}`,
    {
      headers: getHeaders(token),
    },
  );
};
export const getAmbassadorById = async (id: string, token: string) => {
  return axios.get(`${BASE_URL}/api/ambassador/admin/${id}`, {
    headers: getHeaders(token),
  });
};

export const getAmbassadorWalletHistory = async (id: string, token: string) => {
  return axios.get(`${BASE_URL}/api/ambassador/admin/${id}/wallet-history`, {
    headers: getHeaders(token),
  });
};

export const getAmbassadorAnalytics = async (id: string, token: string) => {
  return axios.get(`${BASE_URL}/api/ambassador/admin/${id}/analytics`, {
    headers: getHeaders(token),
  });
};
