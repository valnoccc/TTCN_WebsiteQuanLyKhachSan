import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Eye, CheckCircle, XCircle, LogIn, LogOut, Loader2, Calendar, User, CreditCard,
    AlertCircle, AlertTriangle, X, CheckSquare, Plus, Save
} from 'lucide-react';
import bookingApi from '../../api/bookingApi';
import userApi from '../../api/userApi';
import roomApi from '../../api/roomApi';

const BookingManager = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const navigate = useNavigate();
    // --- STATE MODAL TẠO ĐƠN ---
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [customerList, setCustomerList] = useState([]);
    const [roomList, setRoomList] = useState([]);

    const [newBooking, setNewBooking] = useState({
        MaNguoiDung: '',
        NgayNhanDuKien: '',
        NgayTraDuKien: '',
        TienCoc: 0,
        SelectedRooms: []
    });

    // State Toast & Confirm
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [confirmModal, setConfirmModal] = useState({ show: false, id: null, status: '', message: '' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ ...toast, show: false }), 3000);
    };

    // Load danh sách đơn đặt
    const fetchBookings = async () => {
        try {
            const data = await bookingApi.getAll();
            setBookings(data);
        } catch (error) {
            showToast("Lỗi tải danh sách đơn đặt!", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBookings(); }, []);

    // --- LOGIC TẠO ĐƠN MỚI ---
    const handleOpenCreateModal = async () => {
        try {
            setShowCreateModal(true);
            // Lấy danh sách khách hàng
            const users = await userApi.getAll();
            setCustomerList(users.filter(u => u.VaiTro === 'KhachHang'));

            // Lấy danh sách phòng (Lấy limit lớn để hiện hết)
            const resRooms = await roomApi.getAll({ limit: 100 });
            const allRooms = resRooms.data || resRooms;
            // Chỉ hiển thị phòng đang TRỐNG
            setRoomList(Array.isArray(allRooms) ? allRooms.filter(r => r.TrangThai === 'Trong') : []);

        } catch (error) {
            showToast("Lỗi tải dữ liệu khách/phòng", "error");
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();

        if (!newBooking.MaNguoiDung || !newBooking.NgayNhanDuKien || !newBooking.NgayTraDuKien || newBooking.SelectedRooms.length === 0) {
            showToast("Vui lòng nhập đủ thông tin!", "error");
            return;
        }

        const start = new Date(newBooking.NgayNhanDuKien);
        const end = new Date(newBooking.NgayTraDuKien);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        if (days <= 0) {
            showToast("Ngày trả phải sau ngày nhận!", "error");
            return;
        }

        let totalAmount = 0;
        const roomDetails = [];

        newBooking.SelectedRooms.forEach(roomId => {
            const room = roomList.find(r => r.MaPhong === parseInt(roomId));
            if (room) {
                const roomPrice = room.GiaTheoNgay;
                totalAmount += roomPrice * days;
                roomDetails.push({ MaPhong: roomId, Gia: roomPrice });
            }
        });

        const submitData = {
            MaNguoiDung: newBooking.MaNguoiDung,
            NgayNhanDuKien: newBooking.NgayNhanDuKien,
            NgayTraDuKien: newBooking.NgayTraDuKien,
            TongTien: totalAmount,
            TienCoc: parseInt(newBooking.TienCoc) || 0,
            DanhSachPhong: roomDetails
        };

        try {
            await bookingApi.create(submitData);
            showToast("Tạo đơn thành công!", "success");
            setShowCreateModal(false);
            setNewBooking({ MaNguoiDung: '', NgayNhanDuKien: '', NgayTraDuKien: '', TienCoc: 0, SelectedRooms: [] });
            fetchBookings();
        } catch (error) {
            showToast(error.response?.data?.message || "Lỗi tạo đơn", "error");
        }
    };

    // --- LOGIC CONFIRM STATUS ---
    const openConfirmModal = (id, newStatus) => {
        let msg = "";
        switch (newStatus) {
            case 'DaCoc': msg = "Xác nhận khách đã cọc?"; break;
            case 'DaCheckIn': msg = "Xác nhận check-in?"; break;
            case 'DaCheckOut': msg = "Xác nhận check-out?"; break;
            case 'Huy': msg = "Xác nhận hủy đơn này?"; break;
            default: msg = "Thay đổi trạng thái?";
        }
        setConfirmModal({ show: true, id, status: newStatus, message: msg });
    };

    const handleConfirmAction = async () => {
        if (!confirmModal.id) return;

        try {

            // --- TRƯỜNG HỢP HỦY: GỌI API DELETE QUA bookingApi ---
            if (confirmModal.status === 'Huy') {

                //Gọi hàm từ bookingApi
                await bookingApi.deleteBooking(confirmModal.id);

                showToast('Đã xóa đơn khỏi hệ thống!', 'success');

                // Cập nhật giao diện
                setBookings(prev => prev.filter(item => item.MaDonDat !== confirmModal.id));
            }
            // --- TRƯỜNG HỢP KHÁC: GỌI API UPDATE ---
            else {
                await bookingApi.updateStatus(confirmModal.id, confirmModal.status);
                showToast('Cập nhật thành công!', 'success');

                fetchBookings();
            }

        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Có lỗi xảy ra';
            showToast(msg, 'error');
        } finally {
            setConfirmModal({ ...confirmModal, show: false });
        }
    };

    const getStatusBadge = (status) => {
        const base = "px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1 w-fit";
        switch (status) {
            case 'ChoDuyet': return <span className={`${base} bg-yellow-50 text-yellow-700 border-yellow-200`}>Chờ duyệt</span>;
            case 'DaCoc': return <span className={`${base} bg-blue-50 text-blue-700 border-blue-200`}>Đã cọc</span>;
            case 'DaCheckIn': return <span className={`${base} bg-green-50 text-green-700 border-green-200`}>Đang ở</span>;
            case 'DaCheckOut': return <span className={`${base} bg-gray-100 text-gray-600 border-gray-200`}>Hoàn thành</span>;
            case 'Huy': return <span className={`${base} bg-red-50 text-red-700 border-red-200`}>Đã hủy</span>;
            default: return <span className={base}>{status}</span>;
        }
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');

    const filteredBookings = bookings.filter(b => {
        const matchesSearch =
            b.TenKhachHang.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.MaDonDat.toString().includes(searchTerm) ||
            (b.SDT && b.SDT.includes(searchTerm));

        const matchesStatus = filterStatus === 'All' || b.TrangThaiDon === filterStatus;
        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-teal-600" size={40} /></div>;

    return (
        <div className="relative">
            {/* TOAST */}
            {toast.show && (
                <div className={`fixed top-24 right-5 z-[60] flex items-center gap-3 px-6 py-4 rounded-lg shadow-xl animate-fade-in-left border-l-4 ${toast.type === 'success' ? 'bg-white text-teal-700 border-teal-500' : 'bg-white text-red-700 border-red-500'
                    }`}>
                    {toast.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                    <span className="font-medium text-base">{toast.message}</span>
                    <button onClick={() => setToast({ ...toast, show: false })} className="ml-2 text-gray-400 hover:text-gray-600"><X size={18} /></button>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Quản Lý Đặt Phòng</h2>
                    <p className="text-gray-500 text-base mt-1">Theo dõi và xử lý quy trình nhận/trả phòng</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto items-center">
                    <button
                        onClick={handleOpenCreateModal}
                        className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-teal-700 transition shadow-md shadow-teal-200 whitespace-nowrap"
                    >
                        <Plus size={20} /> Tạo đơn mới
                    </button>

                    <select
                        className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-base shadow-sm cursor-pointer"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All">Tất cả trạng thái</option>
                        <option value="ChoDuyet">Chờ duyệt</option>
                        <option value="DaCoc">Đã cọc</option>
                        <option value="DaCheckIn">Đang ở</option>
                        <option value="DaCheckOut">Hoàn thành</option>
                        <option value="Huy">Đã hủy</option>
                    </select>

                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm mã đơn, tên, sdt..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-base shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg"><Calendar size={24} /></div>
                    <div><p className="text-gray-500 text-sm font-bold uppercase">Chờ xử lý</p><p className="text-2xl font-bold text-gray-800">{bookings.filter(b => b.TrangThaiDon === 'ChoDuyet').length}</p></div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><CreditCard size={24} /></div>
                    <div><p className="text-gray-500 text-sm font-bold uppercase">Sắp đến</p><p className="text-2xl font-bold text-gray-800">{bookings.filter(b => b.TrangThaiDon === 'DaCoc').length}</p></div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-lg"><LogIn size={24} /></div>
                    <div><p className="text-gray-500 text-sm font-bold uppercase">Đang ở</p><p className="text-2xl font-bold text-gray-800">{bookings.filter(b => b.TrangThaiDon === 'DaCheckIn').length}</p></div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-gray-100 text-gray-600 rounded-lg"><CheckSquare size={24} /></div>
                    <div><p className="text-gray-500 text-sm font-bold uppercase">Hoàn thành</p><p className="text-2xl font-bold text-gray-800">{bookings.filter(b => b.TrangThaiDon === 'DaCheckOut').length}</p></div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-700 text-base font-semibold border-b border-gray-100">
                                <th className="px-6 py-5">Mã Đơn</th>
                                <th className="px-6 py-5">Khách hàng</th>
                                <th className="px-6 py-5">Phòng đặt</th>
                                <th className="px-6 py-5">Lịch trình</th>
                                <th className="px-6 py-5">Tổng tiền</th>
                                <th className="px-6 py-5">Trạng thái</th>
                                <th className="px-6 py-5 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredBookings.length > 0 ? (
                                filteredBookings.map((item) => (
                                    <tr key={item.MaDonDat} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-5 font-mono font-bold text-teal-600 text-base">#{item.MaDonDat}</td>
                                        <td className="px-6 py-5">
                                            <p className="font-semibold text-gray-800 text-base">{item.TenKhachHang}</p>
                                            <p className="text-sm text-gray-500">{item.SDT}</p>
                                        </td>
                                        <td className="px-6 py-5 text-gray-600 text-base max-w-xs truncate" title={item.DanhSachPhong}>
                                            {item.DanhSachPhong || '---'}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1 text-gray-600 text-base">
                                                <div className="flex items-center gap-2"><LogIn size={14} className="text-teal-600" /> {formatDate(item.NgayNhanDuKien)}</div>
                                                <div className="flex items-center gap-2"><LogOut size={14} className="text-red-400" /> {formatDate(item.NgayTraDuKien)}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 font-bold text-gray-800 text-base">{formatPrice(item.TongTien)}</td>
                                        <td className="px-6 py-5">{getStatusBadge(item.TrangThaiDon)}</td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-center gap-2">
                                                {item.TrangThaiDon === 'ChoDuyet' && (
                                                    <>
                                                        <button onClick={() => openConfirmModal(item.MaDonDat, 'DaCoc')} className="p-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition" title="Xác nhận cọc"><CheckCircle size={18} /></button>
                                                        <button onClick={() => openConfirmModal(item.MaDonDat, 'Huy')} className="p-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition" title="Hủy đơn"><XCircle size={18} /></button>
                                                    </>
                                                )}
                                                {item.TrangThaiDon === 'DaCoc' && (
                                                    <button onClick={() => openConfirmModal(item.MaDonDat, 'DaCheckIn')} className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-bold shadow-md shadow-teal-200 transition"><LogIn size={16} /> Check-in</button>
                                                )}
                                                {item.TrangThaiDon === 'DaCheckIn' && (
                                                    <button onClick={() => openConfirmModal(item.MaDonDat, 'DaCheckOut')} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm font-bold shadow-md transition"><LogOut size={16} /> Check-out</button>
                                                )}
                                                <button
                                                    onClick={() => navigate(`/admin/bookings/${item.MaDonDat}`)}
                                                    className="p-2.5 text-gray-400 hover:text-teal-600 transition"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="7" className="text-center py-12 text-gray-500 text-base">Không tìm thấy đơn đặt phòng nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL TẠO ĐƠN MỚI --- */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-xl text-gray-800">Tạo Đơn Đặt Phòng Mới</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-red-500 transition"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="p-6 space-y-5">
                            {/* Chọn Khách Hàng */}
                            <div>
                                <label className="block text-base font-medium text-gray-700 mb-1.5">Khách hàng</label>
                                <select
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-base bg-white"
                                    value={newBooking.MaNguoiDung}
                                    onChange={(e) => setNewBooking({ ...newBooking, MaNguoiDung: e.target.value })}
                                >
                                    <option value="">-- Chọn khách hàng --</option>
                                    {customerList.map(c => (
                                        <option key={c.MaNguoiDung} value={c.MaNguoiDung}>{c.HoTen} ({c.SDT})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Chọn Ngày */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-base font-medium text-gray-700 mb-1.5">Ngày nhận (Dự kiến)</label>
                                    <input type="date" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-base"
                                        value={newBooking.NgayNhanDuKien}
                                        onChange={(e) => setNewBooking({ ...newBooking, NgayNhanDuKien: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-base font-medium text-gray-700 mb-1.5">Ngày trả (Dự kiến)</label>
                                    <input type="date" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-base"
                                        value={newBooking.NgayTraDuKien}
                                        onChange={(e) => setNewBooking({ ...newBooking, NgayTraDuKien: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Chọn Phòng (Multi select) */}
                            <div>
                                <label className="block text-base font-medium text-gray-700 mb-1.5">Chọn phòng (Giữ Ctrl để chọn nhiều)</label>
                                <select multiple required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-base bg-white h-32"
                                    value={newBooking.SelectedRooms}
                                    onChange={(e) => {
                                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                                        setNewBooking({ ...newBooking, SelectedRooms: selected });
                                    }}
                                >
                                    {roomList.map(r => (
                                        <option key={r.MaPhong} value={r.MaPhong}>
                                            {r.TenPhong} - {r.TenLoai} ({formatPrice(r.GiaTheoNgay)}/đêm)
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">* Chỉ hiển thị các phòng đang TRỐNG</p>
                            </div>

                            {/* Tiền cọc */}
                            <div>
                                <label className="block text-base font-medium text-gray-700 mb-1.5">Tiền cọc trước (VNĐ)</label>
                                <input type="number" min="0" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-base"
                                    value={newBooking.TienCoc}
                                    onChange={(e) => setNewBooking({ ...newBooking, TienCoc: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition text-base">Hủy</button>
                                <button type="submit" className="px-6 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition flex items-center gap-2 text-base">
                                    Tạo đơn
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Confirm */}
            {confirmModal.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-6 text-center transform transition-all scale-100">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmModal.status === 'Huy' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                            {confirmModal.status === 'Huy' ? <AlertTriangle size={32} /> : <AlertCircle size={32} />}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận thay đổi?</h3>
                        <p className="text-gray-600 text-base mb-6">{confirmModal.message}</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setConfirmModal({ ...confirmModal, show: false })} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition text-base">Hủy bỏ</button>
                            <button onClick={handleConfirmAction} className={`px-6 py-3 text-white rounded-xl font-semibold transition shadow-lg text-base ${confirmModal.status === 'Huy' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-teal-600 hover:bg-teal-700 shadow-teal-200'}`}>Đồng ý</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingManager;