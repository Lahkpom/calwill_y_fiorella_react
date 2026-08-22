import { apiRequest } from './api';

const getList = (response) => {
    if (Array.isArray(response)) return response;
    return response?.content || response?.data || response?.items || [];
};

export const getAdminProducts = async () => {
    const response = await apiRequest('/admin/products?status=all&include=variants');
    return getList(response);
};

export const createAdminProduct = async (product) => apiRequest('/admin/products', {
    method: 'POST',
    body: product,
});

export const updateAdminProduct = async (productId, product) => apiRequest(`/admin/products/${encodeURIComponent(productId)}`, {
    method: 'PATCH',
    body: product,
});

export const updateAdminProductStatus = async (productId, status) => apiRequest(`/admin/products/${encodeURIComponent(productId)}/status`, {
    method: 'PATCH',
    body: { status },
});

export const deleteAdminProduct = async (productId) => apiRequest(`/admin/products/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
});