import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const makeAmbassador = async (
  userId: string,
  token: string
) => {
  return axios.post(
    `${BASE_URL}/api/ambassador/admin/make-ambassador/${userId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
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
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};