import axios from 'axios';

const API_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('luxe_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('luxe_token');
      localStorage.removeItem('luxe_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
};

// Products
export const productApi = {
  getAll:       (params) => api.get('/products', { params }),
  getById:      (id)     => api.get(`/products/${id}`),
  getCategories:()       => api.get('/products/categories'),
  create:       (data)   => api.post('/products', data),
  update:       (id, d)  => api.put(`/products/${id}`, d),
  delete:       (id)     => api.delete(`/products/${id}`),
};

// Cart
export const cartApi = {
  get:    ()            => api.get('/cart'),
  add:    (data)        => api.post('/cart', data),
  update: (id, qty)     => api.put(`/cart/${id}?quantity=${qty}`),
  clear:  ()            => api.delete('/cart'),
};

// Orders
export const orderApi = {
  place:     (data)     => api.post('/orders', data),
  getMyOrders:(params)  => api.get('/orders', { params }),
  getById:   (id)       => api.get(`/orders/${id}`),
  getAllAdmin:(params)   => api.get('/orders/admin/all', { params }),
  updateStatus:(id, s)  => api.patch(`/orders/${id}/status`, { status: s }),
};

// Admin
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
};

export default api;
