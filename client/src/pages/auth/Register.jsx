import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '../../api/authApi';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '', password: '', fullname: '', email: '', phone: ''
    });

    // Thêm state lỗi
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Xóa lỗi khi người dùng gõ lại
    };

    // Hàm kiểm tra hợp lệ
    const validateForm = () => {
        // 1. Kiểm tra rỗng
        if (!formData.username || !formData.password || !formData.fullname) {
            return "Vui lòng điền đầy đủ thông tin bắt buộc (*)";
        }
        // 2. Kiểm tra độ dài mật khẩu
        if (formData.password.length < 6) {
            return "Mật khẩu phải có ít nhất 6 ký tự";
        }
        // 3. Kiểm tra Email (Dùng Regex chuẩn)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            return "Email không đúng định dạng";
        }
        // 4. Kiểm tra SĐT (Số VN: 10 số, bắt đầu bằng 0)
        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        if (formData.phone && !phoneRegex.test(formData.phone)) {
            return "Số điện thoại không hợp lệ";
        }

        return null; // Không có lỗi
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Gọi hàm kiểm tra trước
        const validateError = validateForm();
        if (validateError) {
            setError(validateError);
            return; // Dừng lại, không gửi lên server
        }

        try {
            await authApi.register(formData);
            alert('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (err) {
            // Lỗi từ Backend trả về (Ví dụ: Username trùng)
            setError(err.response?.data?.message || 'Đăng ký thất bại');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 to-teal-500 py-12 font-sans">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Tạo Tài Khoản</h2>

                {/* Hiển thị thông báo lỗi màu đỏ */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Tên đăng nhập *</label>
                            <input type="text" name="username" onChange={handleChange}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500" />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Mật khẩu *</label>
                            <input type="password" name="password" onChange={handleChange}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder="Tối thiểu 6 ký tự" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Họ và tên *</label>
                        <input type="text" name="fullname" onChange={handleChange}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                        <input type="text" name="email" onChange={handleChange}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Số điện thoại</label>
                        <input type="text" name="phone" onChange={handleChange}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>

                    <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700 font-bold mt-4 shadow-lg shadow-teal-200 transition">
                        Đăng Ký
                    </button>
                </form>
                <p className="mt-4 text-center text-gray-600 text-sm">
                    Đã có tài khoản? <Link to="/login" className="text-teal-600 hover:underline font-bold">Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;