import axiosInstance from "./axiosInstance";

export const getAdminDashboardSummary = async () => {
  const response = await axiosInstance.get("/gateway/admin/dashboard/summary");
  return response.data;
};

export const getAdminProducts = async () => {
  const response = await axiosInstance.get("/gateway/admin/products");
  return response.data;
};

export const createAdminProduct = async (productData) => {
  const response = await axiosInstance.post("/gateway/admin/products", productData);
  return response.data;
};

export const updateAdminProduct = async (id, productData) => {
  const response = await axiosInstance.put(`/gateway/admin/products/${id}`, productData);
  return response.data;
};

export const deactivateAdminProduct = async (id) => {
  const response = await axiosInstance.delete(`/gateway/admin/products/${id}`);
  return response.data;
};

export const updateAdminStock = async (id, stock) => {
  const response = await axiosInstance.put(`/gateway/admin/products/${id}/stock`, { stock });
  return response.data;
};

export const getAdminOrders = async () => {
  const response = await axiosInstance.get("/gateway/admin/orders");
  return response.data;
};

export const updateAdminOrderStatus = async (id, status) => {
  const response = await axiosInstance.put(`/gateway/admin/orders/${id}/status`, { status });
  return response.data;
};

export const getSalesReport = async () => {
  const response = await axiosInstance.get("/gateway/admin/reports/sales");
  return response.data;
};

export const getStatusSplitReport = async () => {
  const response = await axiosInstance.get("/gateway/admin/reports/status-split");
  return response.data;
};