import axiosClient from "./axiosClient";

const roomApi = {

    getAll() {
        return axiosClient.get('/rooms');
    },

    get(id) {
        return axiosClient.get(`/rooms/${id}`);
    },

    getRelated(id) {
        return axiosClient.get(`/rooms/${id}/related`);
    }
};

export default roomApi;
