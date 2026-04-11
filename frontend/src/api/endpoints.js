import api from "./client";

export const authApi = {
  login: (username, password) =>
    api.post("/auth/login/", { username, password }),
  register: (data) => api.post("/auth/register/", data),
  logout: () => api.post("/auth/logout/"),
  getMe: () => api.get("/auth/me/"),
};

export const workshopApi = {
  getCoordinatorWorkshops: () => api.get("/workshops/coordinator/"),
  getInstructorWorkshops: () => api.get("/workshops/instructor/"),
  getWorkshop: (id) => api.get(`/workshops/${id}/`),
  proposeWorkshop: (data) => api.post("/workshops/propose/", data),
  acceptWorkshop: (id) => api.post(`/workshops/${id}/accept/`),
  changeWorkshopDate: (id, newDate) =>
    api.post(`/workshops/${id}/change-date/`, { new_date: newDate }),
  addComment: (workshopId, data) =>
    api.post(`/workshops/${workshopId}/comments/`, data),
};

export const workshopTypeApi = {
  list: () => api.get("/workshop-types/"),
  get: (id) => api.get(`/workshop-types/${id}/`),
  getTnC: (id) => api.get(`/workshop-types/${id}/tnc/`),
};

export const profileApi = {
  getMe: () => api.get("/profile/"),
  updateMe: (data) => api.put("/profile/", data),
  getUser: (userId) => api.get(`/profile/${userId}/`),
};

export const statsApi = {
  getPublicStats: (params) => api.get("/statistics/public/", { params }),
};

export const filterApi = {
  getOptions: () => api.get("/filter-options/"),
};
