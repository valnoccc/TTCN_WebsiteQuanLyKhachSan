import axiosClient from './axiosClient';

const roomTypeApi = {
    getAll() {
        return axiosClient.get('/room-types');
    },
    create(data) {
        return axiosClient.post('/room-types', data);
    },
    update(id, data) {
        return axiosClient.put(`/room-types/${id}`, data);
    },
    delete(id) {
        return axiosClient.delete(`/room-types/${id}`);
    }
};

export default roomTypeApi;