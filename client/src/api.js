import axios from 'axios';

const baseURL =
  typeof window !== 'undefined' && window.location.protocol === 'file:'
    ? 'http://localhost:4000'
    : '/';

export const api = axios.create({ baseURL });

export const Invoices = {
  list: (params) => api.get('/api/invoices', { params }).then((r) => r.data),
  get: (id) => api.get(`/api/invoices/${id}`).then((r) => r.data),
  create: (data) => api.post('/api/invoices', data).then((r) => r.data),
  update: (id, data) => api.put(`/api/invoices/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/api/invoices/${id}`).then((r) => r.data),
  nextNumber: (prefix) => api.get('/api/invoices/next-number', { params: { prefix } }).then((r) => r.data),
};

export const Customers = {
  list: (q) => api.get('/api/customers', { params: { q } }).then((r) => r.data),
  create: (data) => api.post('/api/customers', data).then((r) => r.data),
  update: (id, data) => api.put(`/api/customers/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/api/customers/${id}`).then((r) => r.data),
};

export const Products = {
  list: (q) => api.get('/api/products', { params: { q } }).then((r) => r.data),
  create: (data) => api.post('/api/products', data).then((r) => r.data),
  update: (id, data) => api.put(`/api/products/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/api/products/${id}`).then((r) => r.data),
};

export const Companies = {
  getDefault: () => api.get('/api/companies/default').then((r) => r.data),
  saveDefault: (data) => api.put('/api/companies/default', data).then((r) => r.data),
};

export const Stats = {
  dashboard: () => api.get('/api/stats/dashboard').then((r) => r.data),
};
