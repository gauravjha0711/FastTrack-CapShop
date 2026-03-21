import axiosInstance from "./axiosInstance";

export const getCart = async () => {
  const response = await axiosInstance.get("/gateway/orders/cart");
  return response.data;
};

export const addToCart = async (productId, quantity) => {
  const response = await axiosInstance.post("/gateway/orders/cart/items", {
    productId,
    quantity,
  });
  return response.data;
};

export const updateCartItemQuantity = async (itemId, quantity) => {
  const response = await axiosInstance.put(`/gateway/orders/cart/items/${itemId}`, {
    quantity,
  });
  return response.data;
};

export const removeCartItem = async (itemId) => {
  const response = await axiosInstance.delete(`/gateway/orders/cart/items/${itemId}`);
  return response.data;
};

export const startCheckout = async (addressData) => {
  const response = await axiosInstance.post("/gateway/orders/checkout/start", addressData);
  return response.data;
};

export const simulatePayment = async (paymentMethod, simulateSuccess) => {
  const response = await axiosInstance.post("/gateway/orders/payment/simulate", {
    paymentMethod,
    simulateSuccess,
  });
  return response.data;
};

export const placeOrder = async (deliveryOption) => {
  const response = await axiosInstance.post("/gateway/orders/place", {
    deliveryOption,
  });
  return response.data;
};

export const getMyOrders = async () => {
  const response = await axiosInstance.get("/gateway/orders/my");
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await axiosInstance.get(`/gateway/orders/${orderId}`);
  return response.data;
};

export const cancelOrder = async (orderId) => {
  const response = await axiosInstance.put(`/gateway/orders/${orderId}/cancel`);
  return response.data;
};