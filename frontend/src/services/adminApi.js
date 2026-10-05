import { api } from '../api';
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getProducts: () => api.get('/admin/products'), createProduct: d => api.post('/admin/products', d), updateProduct: (id,d) => api.put(`/admin/products/${id}`,d), deleteProduct: id => api.delete(`/admin/products/${id}`),
  getPlants: () => api.get('/admin/plants'), createPlant: d => api.post('/admin/plants', d), updatePlant: (id,d) => api.put(`/admin/plants/${id}`,d), deletePlant: id => api.delete(`/admin/plants/${id}`),
  getIngredients: () => api.get('/admin/ingredients'), createIngredient: d => api.post('/admin/ingredients', d), updateIngredient: (id,d) => api.put(`/admin/ingredients/${id}`,d), deleteIngredient: id => api.delete(`/admin/ingredients/${id}`),
  getMixRules: () => api.get('/admin/mix-rules'), createMixRule: d => api.post('/admin/mix-rules', d), updateMixRule: (id,d) => api.put(`/admin/mix-rules/${id}`,d), deleteMixRule: id => api.delete(`/admin/mix-rules/${id}`),
  getInventory: () => api.get('/admin/inventory'), addStock: (id,quantity) => api.post(`/admin/inventory/${id}/add`,{quantity}), removeStock: (id,quantity) => api.post(`/admin/inventory/${id}/remove`,{quantity}), setStock: (id,quantity) => api.put(`/admin/inventory/${id}`,{quantity}),
  getOrders: (status='') => api.get('/admin/orders',{params:status?{status}:{}}), getOrder: id => api.get(`/admin/orders/${id}`), updateOrderStatus: (id,status,note='') => api.put(`/admin/orders/${id}/status`,{status,note}),
  getUsers: () => api.get('/admin/users'), updateUserStatus: (id,active) => api.put(`/admin/users/${id}/status`,{active}),
  getReportOverview: () => api.get('/admin/reports/overview'), getSalesReport: () => api.get('/admin/reports/sales'), getOrderReport: () => api.get('/admin/reports/orders'), getCustomMixReport: () => api.get('/admin/reports/custom-mixes'),
};
