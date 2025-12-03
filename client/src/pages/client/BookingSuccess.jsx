import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Home, FileText, Banknote, Store, Phone } from 'lucide-react';
import { useEffect } from 'react';

const BookingSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // Nhận dữ liệu từ BookingForm gửi sang
    const { bookingData, roomName, paymentMethod } = location.state || {};

    // Nếu không có dữ liệu (truy cập trực tiếp link), đẩy về trang chủ
    useEffect(() => {
        if (!bookingData) {
            navigate('/');
        }
    }, [bookingData, navigate]);

    if (!bookingData) return null;

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden animate-fade-in-up">

                {/* Header Thành công */}
                <div className="bg-teal-600 p-8 text-center text-white">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <CheckCircle2 size={48} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Đặt phòng thành công!</h1>
                    <p className="opacity-90">Cảm ơn bạn đã lựa chọn Titilus.</p>
                </div>

                <div className="p-8">
                    {/* Thông tin đơn hàng */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-500 text-sm">Mã đơn đặt:</span>
                            <span className="font-mono font-bold text-gray-800 text-lg">#{bookingData.MaDonDat}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-500 text-sm">Phòng:</span>
                            <span className="font-medium text-gray-800">{roomName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 text-sm">Tổng thanh toán:</span>
                            <span className="font-bold text-teal-600 text-lg">{formatPrice(bookingData.TongTien)}</span>
                        </div>
                    </div>

                    {/* Hướng dẫn thanh toán (Đã sửa: Bỏ QR Code) */}
                    {paymentMethod === 'ChuyenKhoan' ? (
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 text-teal-700 font-bold mb-4 bg-teal-50 p-2 rounded-lg">
                                <Banknote size={20} /> Thanh toán chuyển khoản
                            </div>

                            <div className="bg-teal-50 p-4 rounded-xl text-teal-800 text-sm mb-4 border border-teal-100 text-left">
                                <p className="mb-2 font-semibold">Đơn đặt phòng của bạn đã được ghi nhận.</p>
                                <p className="mb-2">Vui lòng kiểm tra email để nhận thông tin tài khoản ngân hàng và hướng dẫn chuyển khoản chi tiết.</p>
                                <p className="flex items-center gap-1 mt-3 text-xs text-gray-500">
                                    <Phone size={12} /> Cần hỗ trợ gấp? Gọi ngay hotline: <strong className="text-teal-700">1900 xxxx</strong>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 text-blue-700 font-bold mb-4 bg-blue-50 p-2 rounded-lg">
                                <Store size={20} /> Thanh toán tại quầy
                            </div>
                            <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm mb-4 border border-blue-100 text-left">
                                <p className="mb-2 flex gap-2"><CheckCircle2 size={16} className="shrink-0 mt-0.5" /> Đơn phòng đã được ghi nhận.</p>
                                <p className="flex gap-2"><Banknote size={16} className="shrink-0 mt-0.5" /> Vui lòng thanh toán <strong>{formatPrice(bookingData.TongTien)}</strong> khi làm thủ tục nhận phòng.</p>
                            </div>
                        </div>
                    )}

                    {/* Nút điều hướng */}
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
                        >
                            <Home size={18} /> Trang chủ
                        </button>
                        <button
                            onClick={() => navigate('/profile')}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition shadow-lg"
                        >
                            <FileText size={18} /> Đơn của tôi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingSuccess;