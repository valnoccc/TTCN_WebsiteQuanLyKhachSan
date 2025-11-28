import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Shield, Save, Camera, Lock, Key, AlertCircle, CheckCircle2 } from 'lucide-react';
import authApi from '../../api/authApi';

const Profile = () => {
    // Lấy thông tin an toàn, tránh lỗi null
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : {};
    });

    // State quản lý Tab đang chọn
    const [activeTab, setActiveTab] = useState('info');

    // State cho Form thông tin
    const [infoData, setInfoData] = useState({
        fullname: user.fullname || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
    });

    // State cho Form mật khẩu
    const [passData, setPassData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // --- STATE MỚI: QUẢN LÝ THÔNG BÁO ---
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Khi chuyển tab thì xóa sạch thông báo cũ
    useEffect(() => {
        setError('');
        setSuccess('');
    }, [activeTab]);

    // Xử lý nhập liệu
    const handleInfoChange = (e) => setInfoData({ ...infoData, [e.target.name]: e.target.value });

    const handlePassChange = (e) => {
        setPassData({ ...passData, [e.target.name]: e.target.value });
        // Khi người dùng bắt đầu gõ lại thì ẩn lỗi đi cho đỡ rối
        if (error) setError('');
    };

    // Submit đổi mật khẩu
    const handlePassSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // 1. Validate: Kiểm tra rỗng (Dù html có required nhưng check thêm cho chắc)
        if (!passData.currentPassword || !passData.newPassword || !passData.confirmPassword) {
            setError("Vui lòng điền đầy đủ các trường bắt buộc.");
            return;
        }

        // 2. Validate: Độ dài mật khẩu
        if (passData.newPassword.length < 6) {
            setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
            return;
        }

        // 3. Validate: Trùng mật khẩu cũ
        if (passData.newPassword === passData.currentPassword) {
            setError("Mật khẩu mới không được trùng với mật khẩu hiện tại.");
            return;
        }

        // 4. Validate: Khớp mật khẩu xác nhận
        if (passData.newPassword !== passData.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp!");
            return;
        }

        try {
            await authApi.changePassword({
                currentPassword: passData.currentPassword,
                newPassword: passData.newPassword
            });

            setSuccess("Đổi mật khẩu thành công!");
            setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' }); // Reset form

            // Tự động ẩn thông báo thành công sau 3 giây
            setTimeout(() => setSuccess(''), 3000);

        } catch (error) {
            console.error("Lỗi chi tiết:", error); // Log ra để xem

            // SỬA LẠI ĐOẠN NÀY: Kiểm tra kỹ trước khi set state
            let message = "Lỗi khi đổi mật khẩu";

            if (error.response && error.response.data && error.response.data.message) {
                message = error.response.data.message;
            } else if (error.message) {
                message = error.message;
            }

            setError(message); // Đảm bảo luôn truyền vào chuỗi text, không phải object
        }
    };

    return (
        <div className="container mx-auto px-4 py-10 font-sans min-h-[600px]">
            <div className="flex flex-col md:flex-row gap-8">

                {/* --- SIDEBAR TRÁI --- */}
                <div className="w-full md:w-1/3 lg:w-1/4">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center sticky top-24">
                        <div className="relative inline-block mb-4">
                            <div className="w-32 h-32 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 text-5xl font-bold mx-auto border-4 border-white shadow-md">
                                {user.fullname ? user.fullname.charAt(0).toUpperCase() : 'U'}
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">{user.fullname}</h2>
                        <p className="text-gray-500 text-sm mb-6">@{user.username}</p>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${activeTab === 'info' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <User size={18} /> Thông tin cá nhân
                            </button>
                            <button
                                onClick={() => setActiveTab('password')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${activeTab === 'password' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Lock size={18} /> Đổi mật khẩu
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- NỘI DUNG PHẢI --- */}
                <div className="w-full md:w-2/3 lg:w-3/4">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">

                        {/* === TAB 1: THÔNG TIN CÁ NHÂN === */}
                        {activeTab === 'info' && (
                            <div className="animate-fade-in">
                                <h1 className="text-2xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">Thông tin cá nhân</h1>
                                <form>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên</label>
                                            <input type="text" name="fullname" value={infoData.fullname} onChange={handleInfoChange}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                            <input type="email" name="email" value={infoData.email} onChange={handleInfoChange}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                                            <input type="text" name="phone" value={infoData.phone} onChange={handleInfoChange}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ</label>
                                            <input type="text" name="address" value={infoData.address} onChange={handleInfoChange} placeholder="Nhập địa chỉ..."
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition" />
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4 border-t border-gray-100">
                                        <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-6 rounded-lg transition shadow-md shadow-teal-200">
                                            Lưu Thay Đổi
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* === TAB 2: ĐỔI MẬT KHẨU === */}
                        {activeTab === 'password' && (
                            <div className="animate-fade-in">
                                <h1 className="text-2xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">Đổi mật khẩu</h1>

                                {/* KHU VỰC HIỂN THỊ THÔNG BÁO LỖI/THÀNH CÔNG */}
                                {error && (
                                    <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                        <AlertCircle size={20} className="shrink-0" />
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                                        <CheckCircle2 size={20} className="shrink-0" />
                                        {success}
                                    </div>
                                )}

                                <form onSubmit={handlePassSubmit} className="max-w-md">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu hiện tại</label>
                                            <div className="relative">
                                                <Key className="absolute left-3 top-3 text-gray-400" size={18} />
                                                <input
                                                    type="password" name="currentPassword"
                                                    value={passData.currentPassword} onChange={handlePassChange}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu mới</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                                                <input
                                                    type="password" name="newPassword"
                                                    value={passData.newPassword} onChange={handlePassChange}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition"
                                                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 text-teal-600" size={18} />
                                                <input
                                                    type="password" name="confirmPassword"
                                                    value={passData.confirmPassword} onChange={handlePassChange}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition"
                                                    placeholder="Nhập lại mật khẩu mới"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                                Cập nhật mật khẩu
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;