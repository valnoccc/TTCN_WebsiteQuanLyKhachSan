import axiosClient from './axiosClient';

const roomApi = {
    getAll(params) {
        return axiosClient.get('/rooms', { params });
    },
    get(id) {
        return axiosClient.get(`/rooms/${id}`);
    },
    getRelated(id) {
        return axiosClient.get(`/rooms/${id}/related`);
    },
    getFeatured() {
        return axiosClient.get('/rooms/featured');
    },
    // --- THÊM MỚI ---
    create(data) {
        return axiosClient.post('/rooms', data);
    },
    update(id, data) {
        return axiosClient.put(`/rooms/${id}`, data);
    },
    delete(id) {
        return axiosClient.delete(`/rooms/${id}`);
    }
};

export default roomApi;