import api from "./client";

export const authApi = {
  login: (username, password) =>
    api.post("/auth/login/", { username, password }),
  register: (data) => api.post("/auth/register/", data),
  logout: () => api.post("/auth/logout/"),
  getMe: () => api.get("/auth/me/"),
  activate: (key) => api.get(`/auth/activate/${key}/`),
  changePassword: (data) => api.post("/auth/change-password/", data),
};

export const workshopApi = {
  getCoordinatorWorkshops: () => api.get("/workshops/coordinator/"),
  getInstructorWorkshops: () => api.get("/workshops/instructor/"),
  getWorkshop: (id) => api.get(`/workshops/${id}/`),
  proposeWorkshop: (data) => api.post("/workshops/propose/", data),
  acceptWorkshop: (id) => api.post(`/workshops/${id}/accept/`),
  rejectWorkshop: (id) => api.post(`/workshops/${id}/reject/`),
  changeWorkshopDate: (id, newDate) =>
    api.post(`/workshops/${id}/change-date/`, { new_date: newDate }),
  addComment: (workshopId, data) =>
    api.post(`/workshops/${workshopId}/comments/`, data),
};

export const workshopTypeApi = {
  list: () => api.get("/workshop-types/"),
  get: (id) => api.get(`/workshop-types/${id}/`),
  getTnC: (id) => api.get(`/workshop-types/${id}/`),
  create: (data) => api.post("/workshop-types/create/", data),
  update: (id, data) => api.put(`/workshop-types/${id}/update/`, data),
};

export const profileApi = {
  getMe: () => api.get("/profile/"),
  updateMe: (data) => api.put("/profile/", data),
  getUser: (userId) => api.get(`/profile/${userId}/`),
};

export const statsApi = {
  getPublicStats: (params) => api.get("/statistics/public/", { params }),
  getInstructorStats: () => api.get("/statistics/instructor/"),
  downloadCsv: (params) => {
    const url = new URL("/api/statistics/public/", window.location.origin);
    const searchParams = new URLSearchParams();
    if (params?.from_date) searchParams.set("from_date", params.from_date);
    if (params?.to_date) searchParams.set("to_date", params.to_date);
    if (params?.state) searchParams.set("state", params.state);
    if (params?.workshop_type) searchParams.set("workshop_type", params.workshop_type);
    searchParams.set("download", "1");
    url.search = searchParams.toString();
    window.location.href = url.toString();
  },
};

export const filterApi = {
  getOptions: () => api.get("/filter-options/"),
};

export const adminApi = {
  getUsers: () => api.get("/admin/users/"),
  promoteUser: (userId) => api.post(`/admin/users/${userId}/promote/`),
  demoteUser: (userId) => api.post(`/admin/users/${userId}/demote/`),
  createWorkshop: (data) => api.post("/admin/workshops/create/", data),
  deleteWorkshop: (id) => api.delete(`/admin/workshops/${id}/delete/`),
};
