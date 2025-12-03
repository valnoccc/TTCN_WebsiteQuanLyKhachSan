import axiosClient from './axiosClient';

const userApi = {
    getAll() { return axiosClient.get('/users'); },
    create(data) { return axiosClient.post('/users', data); },
    update(id, data) { return axiosClient.put(`/users/${id}`, data); },
    delete(id) { return axiosClient.delete(`/users/${id}`); }
};
export default userApi;