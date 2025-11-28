import axiosClient from './axiosClient';

const authApi = {
    register(data) {
        const url = '/auth/register';
        return axiosClient.post(url, data);
    },

    login(data) {
        const url = '/auth/login';
        return axiosClient.post(url, data);
    },

    // Hàm lấy thông tin user hiện tại (Sẽ dùng sau này)
    getMe() {
        const url = '/auth/me';
        return axiosClient.get(url);
    },

    changePassword(data) {
        return axiosClient.post('/auth/change-password', data);
    }
};

export default authApi;