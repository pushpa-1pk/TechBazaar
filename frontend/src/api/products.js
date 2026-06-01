import api from "./axios";

export const getAllProducts = async (params = {}) => {
  const res = await api.get("/products", { params });
  return res.data.products;
};

export const getProductById = async (id) => {
  const res = await api.get(`/products/${id}`);
  return res.data.product;
};

export const getMyProducts = async () => {
  const res = await api.get("/products/my/products");
  return res.data.products;
};

export const createProduct = async (productData) => {
  const res = await api.post("/products", productData);
  return res.data.product;
};

export const updateProduct = async (id, productData) => {
  const res = await api.put(`/products/${id}`, productData);
  return res.data.product;
};

export const deleteProduct = async (id) => {
  await api.delete(`/products/${id}`);
};

export const addReview = async (id, reviewData) => {
  const res = await api.post(`/products/${id}/reviews`, reviewData);
  return res.data.product;
};

export const deleteReview = async (id, reviewId) => {
  const res = await api.delete(`/products/${id}/reviews/${reviewId}`);
  return res.data.product;
};
