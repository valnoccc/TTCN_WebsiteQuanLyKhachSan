import axiosClient from './axiosClient';

const bookingApi = {
    getAll() {
        return axiosClient.get('/bookings');
    },

    getById(id) {
        return axiosClient.get(`/bookings/${id}`);
    },

    create: (data) => {
        const url = '/bookings/create'; // Endpoint Backend (đã có base URL)
        return axiosClient.post(url, data);
    },

    updateStatus(id, status) {
        return axiosClient.put(`/bookings/${id}/status`, { status });
    },

    createBookingByAdmin(data) {
        return axiosClient.post('/bookings/create', data);
    },

    deleteBooking(id) {
        return axiosClient.delete(`/bookings/delete/${id}`);
    },

    checkout(data) {
        return axiosClient.post('/bookings/checkout', data);
    },

    getInvoiceById(id) {
        return axiosClient.get(`/bookings/invoices/detail/${id}`);
    }
};

export default bookingApi;