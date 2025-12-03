import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft, User, CreditCard,
    CheckCircle2, ShieldCheck, Loader2, AlertCircle, Clock, Banknote, Store
} from 'lucide-react';

const BookingForm = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Lấy dữ liệu từ trang chi tiết phòng
    const stateData = location.state || {};
    const { room, checkIn, checkOut, days, totalPrice } = stateData;

    const [loading, setLoading] = useState(false);

    // Form khách hàng
    const [customerInfo, setCustomerInfo] = useState({
        fullName: '',
        email: '',
        phone: '',
        note: '',
    });

    const [paymentMethod, setPaymentMethod] = useState('ChuyenKhoan');

    // Tự động điền thông tin user nếu đã login
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setCustomerInfo(prev => ({
                    ...prev,
                    fullName: user.fullname || '',
                    email: user.email || '',
                    phone: user.phone || ''
                }));
            } catch (error) {
                console.error("Lỗi khi lấy thông tin user:", error);
            }
        }
    }, []);

    // Nếu thiếu dữ liệu phòng -> báo lỗi
    if (!room || !checkIn || !checkOut) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gray-50">
                <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md">
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy thông tin đặt phòng!</h2>
                    <button
                        onClick={() => navigate('/rooms')}
                        className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium"
                    >
                        Quay lại danh sách phòng
                    </button>
                </div>
            </div>
        );
    }

    // Format hiển thị
    const formatPrice = price => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    const formatDateDisplay = dateStr => new Date(dateStr).toLocaleDateString('vi-VN');
    const formatDateForDB = dateStr => new Date(dateStr).toISOString().split('T')[0];

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const storedUser = localStorage.getItem('user');
            const currentUser = storedUser ? JSON.parse(storedUser) : null;

            // --- DEBUG: In ra để xem user đang lưu cái gì ---
            console.log("🔍 Thông tin user trong LocalStorage:", currentUser);

            // 1. Tự động tìm ID người dùng (thử các trường hợp phổ biến)
            const userId = currentUser?.id

            // 2. Kiểm tra nếu không tìm thấy ID
            if (!userId) {
                alert("Không tìm thấy ID người dùng. Vui lòng Đăng xuất và Đăng nhập lại!");
                // navigate('/login'); // Bỏ comment dòng này nếu muốn tự động chuyển trang
                setLoading(false);
                return;
            }

            // 3. Chuẩn bị dữ liệu gửi đi
            const bookingPayload = {
                MaPhong: room.MaPhong,

                // Gán ID vừa tìm được vào đây
                MaNguoiDung: userId,

                TenKhachHang: customerInfo.fullName,
                SDT: customerInfo.phone,
                Email: customerInfo.email,
                GhiChu: customerInfo.note || "",

                NgayNhanDuKien: formatDateForDB(checkIn),
                NgayTraDuKien: formatDateForDB(checkOut),

                TongTien: Number(totalPrice),
                PhuongThucThanhToan: paymentMethod,
                TrangThaiDon: 'ChoDuyet'
            };

            // console.log('📦 Dữ liệu gửi đi:', bookingPayload);

            const response = await axios.post('http://localhost:5000/api/bookings/create', bookingPayload);

            if (response.data && response.data.success) {
                const { MaDonDat } = response.data.data;
                navigate('/booking-success', {
                    state: {
                        bookingData: {
                            MaDonDat: MaDonDat,
                            TongTien: totalPrice,
                            PhuongThucThanhToan: paymentMethod,
                            TenKhachHang: customerInfo.fullName,
                            Email: customerInfo.email
                        },
                        roomName: room.TenPhong,
                        checkIn: checkIn,
                        checkOut: checkOut,
                    }
                });
            } else {
                alert(response.data?.message || "Đặt phòng thất bại.");
            }

        } catch (error) {
            console.error("Lỗi:", error);
            if (error.response) {
                alert(`Lỗi Server: ${error.response.data.message || error.response.data.error}`);
            } else {
                alert(`Lỗi kết nối: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-20 pt-6 font-sans">
            <div className="container mx-auto px-4">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 text-gray-500 hover:text-teal-600 flex items-center gap-2 transition"
                >
                    <ArrowLeft size={20} /> Quay lại chi tiết phòng
                </button>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
                    Xác nhận đặt phòng
                </h1>

                <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">

                    {/* Cột trái: Thông tin khách */}
                    <div className="w-full lg:w-2/3 space-y-6">

                        {/* Thông tin liên hệ */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                <div className="p-2 bg-teal-50 text-teal-600 rounded-full"><User size={20} /></div>
                                <h2 className="text-lg font-bold text-gray-800">Thông tin liên hệ</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                                    <input
                                        type="text" required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                        placeholder="Nguyễn Văn A"
                                        value={customerInfo.fullName}
                                        onChange={e => setCustomerInfo({ ...customerInfo, fullName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                                    <input
                                        type="tel" required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                        placeholder="0912 xxx xxx"
                                        value={customerInfo.phone}
                                        onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                                    <input
                                        type="email" required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                        placeholder="email@example.com"
                                        value={customerInfo.email}
                                        onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú / Yêu cầu</label>
                                    <textarea
                                        rows="2"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                                        placeholder="Ví dụ: Tôi muốn check-in sớm..."
                                        value={customerInfo.note}
                                        onChange={e => setCustomerInfo({ ...customerInfo, note: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Phương thức thanh toán */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                <div className="p-2 bg-teal-50 text-teal-600 rounded-full"><CreditCard size={20} /></div>
                                <h2 className="text-lg font-bold text-gray-800">Thanh toán</h2>
                            </div>

                            <div className="space-y-3">
                                <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'ChuyenKhoan' ? 'border-teal-500 bg-teal-50/20 shadow-md' : 'border-gray-200 hover:border-teal-300'}`}>
                                    <input
                                        type="radio" name="payment" value="ChuyenKhoan"
                                        className="w-5 h-5 text-teal-600 accent-teal-600"
                                        checked={paymentMethod === 'ChuyenKhoan'}
                                        onChange={() => setPaymentMethod('ChuyenKhoan')}
                                    />
                                    <div className="p-2 bg-gray-100 rounded-full text-gray-600"><Banknote size={24} /></div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-gray-800">Thanh toán trực tuyến</p>
                                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Ưu tiên</span>
                                        </div>
                                        <p className="text-sm text-gray-500">Giữ phòng đảm bảo. Nhận mã QR ngay sau khi đặt.</p>
                                    </div>
                                </label>

                                <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'TaiQuay' ? 'border-teal-500 bg-teal-50/20 shadow-md' : 'border-gray-200 hover:border-teal-300'}`}>
                                    <input
                                        type="radio" name="payment" value="TaiQuay"
                                        className="w-5 h-5 text-teal-600 accent-teal-600"
                                        checked={paymentMethod === 'TaiQuay'}
                                        onChange={() => setPaymentMethod('TaiQuay')}
                                    />
                                    <div className="p-2 bg-gray-100 rounded-full text-gray-600"><Store size={24} /></div>
                                    <div>
                                        <p className="font-bold text-gray-800">Thanh toán tại khách sạn</p>
                                        <p className="text-sm text-gray-500">Trả toàn bộ khi nhận phòng.</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Nút submit mobile */}
                        <button type="submit" disabled={loading} className="lg:hidden w-full bg-teal-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-teal-700 transition flex justify-center items-center gap-2">
                            {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
                            {loading ? 'Đang xử lý...' : 'Xác Nhận Đặt Phòng'}
                        </button>
                    </div>

                    {/* Cột phải: Tóm tắt đơn */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 sticky top-6">
                            <h3 className="font-bold text-lg border-b pb-3 mb-4 text-gray-800">Thông tin phòng</h3>

                            <div className="flex gap-4 mb-4">
                                <img
                                    src={room.HinhAnh || room.DanhSachAnh?.[0] || "https://via.placeholder.com/150"}
                                    alt="Room"
                                    className="w-20 h-20 object-cover rounded-lg bg-gray-200"
                                />
                                <div>
                                    <p className="text-sm text-gray-500">{room.TenLoai}</p>
                                    <p className="font-bold text-gray-800 line-clamp-2">{room.TenPhong}</p>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm text-gray-600 mb-6 bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between"><span>Nhận phòng:</span><span className="font-bold text-gray-800">{formatDateDisplay(checkIn)} (14:00)</span></div>
                                <div className="flex justify-between"><span>Trả phòng:</span><span className="font-bold text-gray-800">{formatDateDisplay(checkOut)} (12:00)</span></div>
                                <div className="flex justify-between"><span>Số đêm:</span><span className="font-bold text-gray-800">{days} đêm</span></div>
                            </div>

                            <div className="flex justify-between items-center pt-2 mb-2">
                                <span className="text-gray-600">Tổng tiền:</span>
                                <span className="font-bold text-xl text-teal-700">{formatPrice(totalPrice)}</span>
                            </div>

                            {paymentMethod === 'TaiQuay' ? (
                                <div className="bg-gray-100 text-gray-700 text-xs p-3 rounded mb-6 border border-gray-200 flex flex-col gap-1">
                                    <div className="flex justify-between font-bold text-sm"><span>Thanh toán ngay:</span><span>0 ₫</span></div>
                                    <div className="flex justify-between"><span>Sẽ thanh toán tại quầy:</span><span className="font-bold">{formatPrice(totalPrice)}</span></div>
                                </div>
                            ) : (
                                <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded mb-6 border border-yellow-100 flex flex-col gap-1">
                                    <div className="flex justify-between font-bold text-sm"><span>Cần thanh toán ngay:</span><span>{formatPrice(totalPrice)}</span></div>
                                    <p className="text-yellow-700 italic mt-1">Hoàn tất thanh toán để đơn đặt phòng được xác nhận ngay.</p>
                                </div>
                            )}

                            {/* Nút submit desktop */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="hidden lg:flex w-full bg-teal-600 text-white font-bold py-3.5 rounded-xl hover:bg-teal-700 transition justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-teal-200"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                                {loading ? 'Đang xử lý...' : paymentMethod === 'TaiQuay' ? 'Hoàn Tất Đặt Phòng' : 'Thanh Toán Ngay'}
                            </button>

                            <div className="mt-4 flex justify-center items-center gap-1 text-xs text-gray-400">
                                <ShieldCheck size={14} /> Thông tin bảo mật an toàn
                            </div>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default BookingForm;
