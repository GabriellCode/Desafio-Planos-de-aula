import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Students
export const getStudents = async () => {
  const { data } = await api.get('/students');
  return data;
};

export const getStudent = async (id) => {
  const { data } = await api.get(`/students/${id}`);
  return data;
};

export const createStudent = async (payload) => {
  const { data } = await api.post('/students', payload);
  return data;
};

export const updateStudent = async (id, payload) => {
  const { data } = await api.put(`/students/${id}`, payload);
  return data;
};

export const deleteStudent = async (id) => {
  const { data } = await api.delete(`/students/${id}`);
  return data;
};

export const reorderStudents = async (data) => {
  const res = await api.post('/students/reorder', data);
  return res.data;
};

// Lesson Plans
export const getLessonPlans = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.studentId) params.append('studentId', filters.studentId);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.title) params.append('title', filters.title);
  if (filters.subject) params.append('subject', filters.subject);
  if (filters.tags) params.append('tags', filters.tags);
  if (filters.expectedDate) params.append('expectedDate', filters.expectedDate);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

  const { data } = await api.get(`/lesson-plans?${params.toString()}`);
  return data;
};

export const getLessonPlan = async (id) => {
  const { data } = await api.get(`/lesson-plans/${id}`);
  return data;
};

export const createLessonPlan = async (payload) => {
  const { data } = await api.post('/lesson-plans', payload);
  return data;
};

export const updateLessonPlan = async (id, payload) => {
  const { data } = await api.put(`/lesson-plans/${id}`, payload);
  return data;
};

export const deleteLessonPlan = async (id) => {
  const { data } = await api.delete(`/lesson-plans/${id}`);
  return data;
};

export const reorderLessonPlans = async (payload) => {
  const { data } = await api.put('/lesson-plans/reorder', payload);
  return data;
};

// Reports
export const getReports = async (studentId) => {
  const { data } = await api.get(`/reports?studentId=${studentId}`);
  return data;
};

export const getReport = async (id) => {
  const { data } = await api.get(`/reports/${id}`);
  return data;
};

export const createReport = async (payload) => {
  const { data } = await api.post('/reports', payload);
  return data;
};

export const updateReport = async (id, payload) => {
  const { data } = await api.put(`/reports/${id}`, payload);
  return data;
};

export const deleteReport = async (id) => {
  const { data } = await api.delete(`/reports/${id}`);
  return data;
};

// AI Recommendations
export const generateAIRecommendations = async (payload) => {
  const { data } = await api.post('/ai/recommendations', payload);
  return data;
};
