import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import bookingApi from '../../api/bookingApi'; // Đảm bảo bạn đã import đúng
import {
    ArrowLeft, Printer, CheckCircle, AlertTriangle,
    CreditCard, Calendar, User, DollarSign, Save
} from 'lucide-react';

const BookingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    // State cho phần thanh toán & phụ thu
    const [surcharge, setSurcharge] = useState(0); // Tiền phạt/phụ thu
    const [surchargeNote, setSurchargeNote] = useState(''); // Lý do phạt
    const [paymentMethod, setPaymentMethod] = useState('TienMat');
    const [showInvoice, setShowInvoice] = useState(false); // Hiển thị modal hóa đơn

    // Hàm lấy dữ liệu
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await bookingApi.getById(id);

                // --- BƯỚC 1: LOG RA ĐỂ XEM DỮ LIỆU THỰC TẾ ---
                //console.log("📥 Dữ liệu API trả về:", res);

                // --- BƯỚC 2: SỬA LẠI CÁCH SET STATE ---ta'
                if (res && res.MaDonDat) {
                    setBooking(res); // <--- KHẢ NĂNG CAO LÀ DÒNG NÀY
                } else if (res && res.data) {
                    setBooking(res.data); // (Cách cũ của bạn)
                } else {
                    console.warn("Cấu trúc dữ liệu lạ:", res);
                }

            } catch (error) {
                console.error("Lỗi:", error);
                alert("Lỗi tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    // Hàm định dạng tiền
    const formatMoney = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    // Hàm định dạng ngày
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN') + ' ' + new Date(dateString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    // Tính toán tổng cuối
    const totalRoomCharge = booking ? parseFloat(booking.TongTien) : 0;
    const deposit = booking ? parseFloat(booking.TienCoc) : 0;
    const finalSurcharge = parseFloat(surcharge) || 0;

    // Tổng tiền phòng + Phụ thu
    const finalTotal = totalRoomCharge + finalSurcharge;

    // SỬA TẠI ĐÂY: Thực thu = Tổng tiền + Phụ thu (Không trừ cọc)
    const remainingAmount = finalTotal;


    // Hàm in hóa đơn
    const handlePrint = () => {
        window.print();
    };

    const handleCompleteOrder = async () => {
        const confirmMsg = `Xác nhận thu ${formatMoney(remainingAmount)} và xuất hóa đơn?`;
        if (!window.confirm(confirmMsg)) return;

        try {
            // Chuẩn bị JSON danh sách phòng
            const roomListJSON = JSON.stringify(booking.ChiTiet.map(r => ({
                TenPhong: r.TenPhong,
                Gia: r.GiaThucTe || r.GiaTheoNgay
            })));

            const payload = {
                MaDonDat: id,
                PhuThu: finalSurcharge,
                GhiChuPhuThu: surchargeNote,

                // Gửi đúng tên biến mà Backend controller đang đợi
                TongTienThanhToan: remainingAmount,
                HinhThucThanhToan: paymentMethod,

                // Thông tin Snapshot
                TenKhachHang: booking.TenKhachHang || booking.HoTen,
                Email: booking.Email,
                SDT: booking.SDT,
                NgayNhanPhong: formatDateForDB(booking.NgayNhanDuKien), // Gửi YYYY-MM-DD
                NgayTraPhong: formatDateForDB(booking.NgayTraDuKien),
                TienPhong: totalRoomCharge,
                ChiTietPhongJSON: roomListJSON
            };

            // Gọi API
            await bookingApi.checkout(payload);

            alert("Lưu hóa đơn thành công! Đang chuyển về danh sách...");

            // Chuyển hướng về trang quản lý
            navigate('/admin/bookings');

        } catch (error) {
            console.error(error);
            alert("Lỗi: " + (error.response?.data?.message || "Không thể lưu hóa đơn"));
        }
    };

    // Thêm hàm tiện ích này nếu chưa có trong component
    const formatDateForDB = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toISOString().slice(0, 19).replace('T', ' '); // YYYY-MM-DD HH:mm:ss
    };

    if (loading) return <div className="p-8 text-center">Đang tải...</div>;
    if (!booking) return <div className="p-8 text-center text-red-500">Dữ liệu trống</div>;

    return (
        <div className="bg-gray-50 min-h-screen p-6 font-sans">
            {/* --- THANH ĐIỀU HƯỚNG (Ẩn khi in) --- */}
            <div className="print:hidden mb-6 flex justify-between items-center">
                <button onClick={() => navigate('/admin/bookings')} className="flex items-center gap-2 text-gray-600 hover:text-teal-600">
                    <ArrowLeft size={20} /> Quay lại danh sách
                </button>
                <div className="flex items-center gap-3">

                    {/* TRƯỜNG HỢP 1: ĐÃ THANH TOÁN (Có hóa đơn trong DB) */}
                    {booking.HasInvoice ? (
                        <div className="flex items-center gap-2 animate-fade-in">
                            {/* Hiện Label "Đã thanh toán" */}
                            <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg font-bold border border-green-200 text-sm">
                                <CheckCircle size={16} /> Đã Thanh Toán
                            </span>

                            {/* Chỉ hiện nút In lại hóa đơn */}
                            <button
                                onClick={handlePrint}
                                className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-900 shadow-md"
                            >
                                <Printer size={20} /> In Hóa Đơn
                            </button>
                        </div>
                    ) : (
                        /* TRƯỜNG HỢP 2: CHƯA THANH TOÁN (Chưa có hóa đơn & Chưa hủy) */
                        booking.TrangThaiDon !== 'Huy' && (
                            <button
                                onClick={() => setShowInvoice(true)}
                                className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-teal-700 font-bold shadow-lg shadow-teal-200"
                            >
                                <CreditCard size={20} /> Thanh Toán & Check-out
                            </button>
                        )
                    )}

                    {/* Nếu đơn đã Hủy thì không hiện gì hoặc hiện label Đã Hủy */}
                    {booking.TrangThaiDon === 'Huy' && (
                        <span className="text-red-500 font-bold border border-red-200 bg-red-50 px-3 py-2 rounded-lg">
                            Đơn đã hủy
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block">

                {/* --- CỘT TRÁI: THÔNG TIN CHI TIẾT --- */}
                <div className="lg:col-span-2 space-y-6 print:hidden">
                    {/* Thẻ trạng thái */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Đơn đặt #{booking.MaDonDat}</h1>
                                <p className="text-gray-500 text-sm">Ngày tạo: {formatDate(booking.NgayDat)}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold 
                                ${booking.TrangThaiDon === 'DaCheckOut' ? 'bg-green-100 text-green-700' :
                                    booking.TrangThaiDon === 'Huy' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                {booking.TrangThaiDon === 'DaCheckOut' ? 'Đã Hoàn Thành' :
                                    booking.TrangThaiDon === 'Huy' ? 'Đã Hủy' : booking.TrangThaiDon}
                            </span>
                        </div>
                    </div>

                    {/* Thông tin Khách hàng */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><User size={20} /> Thông tin khách hàng</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><span className="text-gray-500 block text-xs">Họ tên</span> <span className="font-medium">{booking.TenKhachHang || booking.HoTen}</span></div>
                            <div><span className="text-gray-500 block text-xs">SĐT</span> <span className="font-medium">{booking.SDT}</span></div>
                            <div><span className="text-gray-500 block text-xs">Email</span> <span className="font-medium">{booking.Email}</span></div>
                            <div><span className="text-gray-500 block text-xs">Ghi chú</span> <span className="font-medium italic">{booking.GhiChu || "Không có"}</span></div>
                        </div>
                    </div>

                    {/* Danh sách phòng */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Calendar size={20} /> Chi tiết phòng</h3>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600 border-b">
                                <tr>
                                    <th className="p-3">Phòng</th>
                                    <th className="p-3">Check-in</th>
                                    <th className="p-3">Check-out</th>
                                    <th className="p-3 text-right">Giá</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Giả sử booking.ChiTiet là mảng các phòng */}
                                {booking.ChiTiet && booking.ChiTiet.map((room, idx) => (
                                    <tr key={idx} className="border-b last:border-0">
                                        <td className="p-3 font-medium">{room.TenPhong}</td>
                                        <td className="p-3">{formatDate(booking.NgayNhanDuKien)}</td>
                                        <td className="p-3">{formatDate(booking.NgayTraDuKien)}</td>
                                        <td className="p-3 text-right font-medium">
                                            {formatMoney(room.GiaThucTe || room.GiaTheoNgay)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- CỘT PHẢI: TỔNG KẾT TÀI CHÍNH --- */}
                <div className="lg:col-span-1 print:hidden">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><DollarSign size={20} /> Tổng kết chi phí</h3>

                        <div className="space-y-3 text-sm border-b pb-4 mb-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tiền phòng:</span>
                                <span className="font-medium">{formatMoney(totalRoomCharge)}</span>
                            </div>
                            <div className="flex justify-between text-red-600">
                                <span>Phụ thu / Phạt:</span>
                                <span className="font-medium">+ {formatMoney(finalSurcharge)}</span>
                            </div>
                            {/* Hiển thị tiền cọc để tham khảo, nhưng không trừ vào thực thu bên dưới */}
                            <div className="flex justify-between text-green-600">
                                <span>Đã đặt cọc:</span>
                                <span className="font-medium">{formatMoney(deposit)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-xl font-bold text-teal-800">
                            <span>Thực thu:</span>
                            {/* SỬA FORMULA TẠI ĐÂY */}
                            <span>{formatMoney(totalRoomCharge + finalSurcharge)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {showInvoice && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

                        {/* Header Modal */}
                        <div className="bg-teal-700 p-4 flex justify-between items-center text-white print:hidden">
                            <h2 className="font-bold text-lg flex items-center gap-2"><CreditCard /> Thanh Toán & Xuất Hóa Đơn</h2>
                            <button onClick={() => setShowInvoice(false)} className="hover:bg-white/20 p-1 rounded">✕</button>
                        </div>

                        {/* --- NỘI DUNG HÓA ĐƠN (Phần sẽ được in) --- */}
                        <div id="invoice-print-area" className="p-8 bg-white text-gray-800">
                            {/* Header Hóa đơn */}
                            <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
                                <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">Hóa Đơn Thanh Toán</h1>
                                <p className="text-sm font-semibold">KHÁCH SẠN TITILUS LUXURY</p>
                                <p className="text-xs text-gray-500">180 Cao Lỗ, Phường 4, Quận 8, TP.HCM - Hotline: 0984 523 312</p>
                            </div>

                            {/* Thông tin chung */}
                            <div className="flex justify-between text-sm mb-6">
                                <div>
                                    <p><strong>Khách hàng:</strong> {booking.TenKhachHang}</p>
                                    <p><strong>Số điện thoại:</strong> {booking.SDT}</p>
                                </div>
                                <div className="text-right">
                                    <p><strong>Mã hóa đơn:</strong> #{booking.MaDonDat}-{Date.now().toString().slice(-4)}</p>
                                    <p><strong>Ngày lập:</strong> {new Date().toLocaleDateString('vi-VN')}</p>
                                </div>
                            </div>

                            {/* Bảng chi tiết */}
                            <table className="w-full text-sm border-collapse border border-gray-300 mb-6">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border p-2 text-left">Diễn giải</th>
                                        <th className="border p-2 text-right">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border p-2">
                                            Tiền phòng ({booking.ChiTiet?.length || 1} phòng) <br />
                                            <span className="text-xs text-gray-500">
                                                Từ {formatDate(booking.NgayNhanDuKien)} đến {formatDate(booking.NgayTraDuKien)}
                                            </span>
                                        </td>
                                        <td className="border p-2 text-right">{formatMoney(totalRoomCharge)}</td>
                                    </tr>
                                    {/* Nhập phụ thu (Chỉ hiện input nếu chưa in, khi in sẽ hiện text) */}
                                    <tr>
                                        <td className="border p-2 flex flex-col gap-1">
                                            <span className="font-semibold text-red-600">Phụ thu / Phạt / Minibar</span>
                                            <input
                                                type="text"
                                                placeholder="Nhập lý do (VD: Vỡ ly, Nước suối...)"
                                                className="border-b border-gray-300 outline-none text-xs w-full print:hidden"
                                                value={surchargeNote}
                                                onChange={e => setSurchargeNote(e.target.value)}
                                            />
                                            <span className="hidden print:inline text-xs italic">{surchargeNote}</span>
                                        </td>
                                        <td className="border p-2 text-right text-red-600 font-bold">
                                            <div className="flex items-center justify-end gap-1 print:hidden">
                                                <input
                                                    type="number"
                                                    className="w-24 text-right border rounded p-1 outline-teal-500"
                                                    value={surcharge}
                                                    onChange={e => setSurcharge(Number(e.target.value))}
                                                />
                                            </div>
                                            <span className="hidden print:inline">{formatMoney(finalSurcharge)}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border p-2">Đã đặt cọc</td>
                                        <td className="border p-2 text-right text-green-600">-{formatMoney(deposit)}</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-100 font-bold text-lg">
                                        <td className="border p-3 text-right">TỔNG CỘNG THANH TOÁN</td>
                                        <td className="border p-3 text-right">{formatMoney(remainingAmount)}</td>
                                    </tr>
                                </tfoot>
                            </table>

                            {/* Footer Hóa đơn */}
                            <div className="mt-12 flex justify-between text-center text-sm">
                                <div>
                                    <p className="font-bold">Khách hàng</p>
                                    <p className="text-xs italic mt-8">(Ký, ghi rõ họ tên)</p>
                                </div>
                                <div>
                                    <p className="font-bold">Nhân viên thu ngân</p>
                                    <p className="text-xs italic mt-8">(Ký, ghi rõ họ tên)</p>
                                </div>
                            </div>
                            <p className="text-center text-xs text-gray-400 mt-12">Cảm ơn quý khách đã sử dụng dịch vụ!</p>
                        </div>

                        {/* Footer Modal (Chứa nút hành động) */}
                        <div className="bg-gray-50 p-4 border-t flex justify-between items-center print:hidden">
                            <div className="flex items-center gap-2">
                                <span>Hình thức thanh toán:</span>
                                <select
                                    className="border rounded p-1.5 outline-none"
                                    value={paymentMethod}
                                    onChange={e => setPaymentMethod(e.target.value)}
                                >
                                    <option value="TienMat">Tiền mặt</option>
                                    <option value="ChuyenKhoan">Chuyển khoản</option>
                                    <option value="TheTinDung">Thẻ tín dụng</option>
                                </select>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handlePrint}
                                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 flex items-center gap-2"
                                >
                                    <Printer size={18} /> In Trước
                                </button>
                                <button
                                    onClick={handleCompleteOrder}
                                    className="px-6 py-2 bg-teal-700 text-white rounded font-bold hover:bg-teal-800 flex items-center gap-2 shadow-lg"
                                >
                                    <Save size={18} /> Xác Nhận & Check-out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CSS Ẩn hiện khi in */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #invoice-print-area, #invoice-print-area * { visibility: visible; }
                    #invoice-print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; }
                    .print\\:hidden { display: none !important; }
                    .print\\:inline { display: inline !important; }
                }
            `}</style>
        </div>
    );
};

export default BookingDetail;