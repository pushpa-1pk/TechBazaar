import api from "./axios";

export const getMyOrders = async () => {
  const res = await api.get("/orders/my");
  return res.data.orders;
};

export const getSellerOrders = async () => {
  const res = await api.get("/orders/seller/my");
  return res.data.orders;
};

export const getOrderById = async (id) => {
  const res = await api.get(`/orders/${id}`);
  return res.data.order;
};

export const cancelOrder = async (id) => {
  const res = await api.put(`/orders/${id}/cancel`);
  return res.data.order;
};
