import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:5000/api', // Đảm bảo cổng này khớp với Backend
    headers: {
        'Content-Type': 'application/json',
    },
});

// 1. Interceptor REQUEST: Tự động gắn Token vào mọi request
axiosClient.interceptors.request.use(async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 2. Interceptor RESPONSE: Xử lý dữ liệu trả về
axiosClient.interceptors.response.use((response) => {
    // Backend trả về: { message: "...", token: "..." }
    // Ta chỉ lấy phần data đó, bỏ qua phần config rườm rà của axios
    return response.data;
}, (error) => {
    // Nếu lỗi 401 (Hết hạn token) -> Đá về Login
    // (Trừ trường hợp đang ở trang login/register thì không cần đá)
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest.url.includes('/auth')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
    throw error;
});

export default axiosClient;