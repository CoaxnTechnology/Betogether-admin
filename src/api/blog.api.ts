import client, { API_BASE_URL } from "./client";

// The blog module lives under /api/blogs, a sibling of the /api/admin
// prefix baked into `client`'s baseURL — so these calls use absolute
// URLs. `client` still attaches the auth token and handles 401s via its
// interceptors regardless of the URL being absolute.
const BLOG_BASE = `${API_BASE_URL}/api/blogs`;

export interface BlogListParams {
  status?: "draft" | "published" | "";
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const getAllBlogsAdmin = async (params: BlogListParams = {}) => {
  return client.get(`${BLOG_BASE}/admin/all`, { params });
};

export const getBlogByIdAdmin = async (id: string) => {
  return client.get(`${BLOG_BASE}/admin/${id}`);
};

export const createBlog = async (formData: FormData) => {
  return client.post(`${BLOG_BASE}/admin/create`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateBlog = async (id: string, formData: FormData) => {
  return client.put(`${BLOG_BASE}/admin/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteBlog = async (id: string) => {
  return client.delete(`${BLOG_BASE}/admin/delete/${id}`);
};
