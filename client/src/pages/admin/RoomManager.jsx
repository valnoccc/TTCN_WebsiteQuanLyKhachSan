import { useState, useEffect } from 'react';
import {
    Building2, DoorOpen, Users, TrendingUp,
    Search, Plus, Edit, Trash2, Loader2, X, Save, CheckCircle, AlertCircle, AlertTriangle
} from 'lucide-react';
import roomApi from '../../api/roomApi';
import roomTypeApi from '../../api/roomTypeApi';

const RoomManager = () => {
    const [rooms, setRooms] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    // State Modal Thêm/Sửa
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // --- STATE CHO MODAL XÓA (MỚI) ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const [formData, setFormData] = useState({
        MaPhong: null, TenPhong: '', MaLoai: '', SucChua: '', DienTich: '', TrangThai: 'Trong', MoTa: ''
    });

    // State Toast Thông báo
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [stats, setStats] = useState({ totalRooms: 0, occupiedRooms: 0, emptyRooms: 0 });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ ...toast, show: false }), 3000);
    };

    const fetchData = async () => {
        try {
            const resRooms = await roomApi.getAll({ limit: 100 });
            let roomData = resRooms.data || resRooms;
            if (!Array.isArray(roomData)) roomData = [];
            setRooms(roomData);

            const occupied = roomData.filter(r => r.TrangThai !== 'Trong').length;
            setStats({
                totalRooms: roomData.length,
                occupiedRooms: occupied,
                emptyRooms: roomData.length - occupied
            });

            const resTypes = await roomTypeApi.getAll();
            setRoomTypes(resTypes);
        } catch (error) {
            console.error(error);
            showToast("Không thể tải dữ liệu!", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // --- LOGIC FORM THÊM/SỬA ---
    const handleAdd = () => {
        setIsEditing(false);
        setFormData({ MaPhong: null, TenPhong: '', MaLoai: roomTypes[0]?.MaLoai || '', SucChua: '', DienTich: '', TrangThai: 'Trong', MoTa: '' });
        setShowModal(true);
    };

    const handleEdit = (room) => {
        setIsEditing(true);
        setFormData({ ...room, MaLoai: room.MaLoai, MoTa: room.MoTa || '' });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        //const submitData = { ...formData, MaLoai: parseInt(formData.MaLoai), SucChua: parseInt(formData.SucChua), DienTich: parseFloat(formData.DienTich) };
        const submitData = { ...formData, MaLoai: parseInt(formData.MaLoai), SucChua: parseInt(formData.SucChua), DienTich: parseFloat(formData.DienTich), MoTa: formData.MoTa };
        try {
            if (isEditing) await roomApi.update(formData.MaPhong, submitData);
            else await roomApi.create(submitData);

            showToast(isEditing ? 'Cập nhật thành công!' : 'Thêm mới thành công!', 'success');
            setShowModal(false);
            fetchData();
        } catch (error) {
            showToast(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
        }
    };

    // --- LOGIC XÓA (Đã thay đổi không dùng alert) ---

    // 1. Mở modal xác nhận
    const openDeleteConfirmation = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    // 2. Thực hiện xóa khi bấm nút "Xóa" trong modal
    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await roomApi.delete(deleteId);
            showToast('Đã xóa phòng thành công!', 'success');
            fetchData();
        } catch (error) {
            showToast('Không thể xóa phòng này!', 'error');
        } finally {
            setShowDeleteModal(false); // Đóng modal dù thành công hay thất bại
            setDeleteId(null);
        }
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    if (loading) return <div className="flex justify-center items-center h-64 text-teal-600"><Loader2 className="animate-spin" size={40} /></div>;

    return (
        <div className="relative">
            {/* TOAST */}
            {toast.show && (
                <div className={`fixed top-24 right-5 z-[60] flex items-center gap-2 px-6 py-4 rounded-lg shadow-xl animate-fade-in-left border-l-4 ${toast.type === 'success' ? 'bg-white text-teal-700 border-teal-500' : 'bg-white text-red-700 border-red-500'
                    }`}>
                    {toast.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                    <span className="font-medium text-base">{toast.message}</span>
                </div>
            )}

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Quản Lý Phòng</h2>
                    <p className="text-gray-500 text-base mt-1">Danh sách và trạng thái các phòng khách sạn</p>
                </div>
                <button onClick={handleAdd} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-lg font-medium transition shadow-md shadow-teal-200 text-base">
                    <Plus size={20} /> Thêm phòng mới
                </button>
            </div>

            {/* KHỐI THỐNG KÊ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start">
                    <div>
                        <p className="text-gray-500 text-sm mb-1">Tổng phòng</p>
                        <h3 className="text-3xl font-bold text-gray-800">{stats.totalRooms}</h3>
                        <p className="text-gray-400 text-sm mt-2">{stats.emptyRooms} phòng trống</p>
                    </div>
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Building2 size={24} /></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start">
                    <div>
                        <p className="text-gray-500 text-sm mb-1">Đang sử dụng</p>
                        <h3 className="text-3xl font-bold text-gray-800">{stats.occupiedRooms}</h3>
                        <p className="text-gray-400 text-sm mt-2">{stats.totalRooms > 0 ? ((stats.occupiedRooms / stats.totalRooms) * 100).toFixed(0) : 0}% công suất</p>
                    </div>
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><DoorOpen size={24} /></div>
                </div>
            </div>

            {/* BẢNG DANH SÁCH */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-700 text-base font-semibold border-b border-gray-100">
                                <th className="px-6 py-5">Mã số</th>
                                <th className="px-6 py-5">Tên phòng</th>
                                <th className="px-6 py-5">Loại</th>
                                <th className="px-6 py-5">Giá/ngày</th>
                                <th className="px-6 py-5">Sức chứa</th>
                                <th className="px-6 py-5">Trạng thái</th>
                                <th className="px-6 py-5 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rooms.map((room) => (
                                <tr key={room.MaPhong} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-5 text-gray-500 font-mono text-sm">#{room.MaPhong}</td>
                                    <td className="px-6 py-5 text-gray-800 font-bold text-base">{room.TenPhong}</td>
                                    <td className="px-6 py-5">
                                        <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-sm font-medium border border-gray-200">
                                            {room.TenLoai || 'Chưa phân loại'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-teal-600 font-bold text-base">{formatPrice(room.GiaTheoNgay)}</td>
                                    <td className="px-6 py-5 text-gray-600 text-base">{room.SucChua} người</td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 w-fit ${room.TrangThai === 'Trong' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            <span className={`w-2 h-2 rounded-full ${room.TrangThai === 'Trong' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            {room.TrangThai === 'Trong' ? 'Còn trống' : (room.TrangThai === 'DangO' ? 'Đang ở' : room.TrangThai)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-center gap-3">
                                            <button onClick={() => handleEdit(room)} className="p-2.5 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 transition"><Edit size={18} /></button>

                                            {/* GỌI HÀM MỞ MODAL XÓA */}
                                            <button onClick={() => openDeleteConfirmation(room.MaPhong)} className="p-2.5 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL FORM THÊM/SỬA --- */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-xl text-gray-800">{isEditing ? 'Cập nhật Phòng' : 'Thêm Phòng Mới'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 transition"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-base font-medium text-gray-700 mb-1.5">Tên phòng</label>
                                <input type="text" required value={formData.TenPhong} onChange={(e) => setFormData({ ...formData, TenPhong: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-base" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-base font-medium text-gray-700 mb-1.5">Loại phòng</label>
                                    <select required value={formData.MaLoai} onChange={(e) => setFormData({ ...formData, MaLoai: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-base bg-white">
                                        <option value="">-- Chọn loại --</option>
                                        {roomTypes.map(type => <option key={type.MaLoai} value={type.MaLoai}>{type.TenLoai}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-base font-medium text-gray-700 mb-1.5">Trạng thái</label>
                                    <select value={formData.TrangThai} onChange={(e) => setFormData({ ...formData, TrangThai: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-base bg-white">
                                        <option value="Trong">Còn trống</option>
                                        <option value="DangO">Đang ở</option>
                                        <option value="DonDep">Dọn dẹp</option>
                                        <option value="SuaChua">Sửa chữa</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-base font-medium text-gray-700 mb-1.5">Sức chứa</label>
                                    <input type="number" required value={formData.SucChua} onChange={(e) => setFormData({ ...formData, SucChua: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-base" />
                                </div>
                                <div>
                                    <label className="block text-base font-medium text-gray-700 mb-1.5">Diện tích</label>
                                    <input type="number" value={formData.DienTich} onChange={(e) => setFormData({ ...formData, DienTich: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-base" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-base font-medium text-gray-700 mb-1.5">Mô tả</label>
                                <textarea rows="3" value={formData.MoTa} onChange={(e) => setFormData({ ...formData, MoTa: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-base"></textarea>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition text-base">Hủy</button>
                                <button type="submit" className="px-6 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition flex items-center gap-2 text-base">
                                    Lưu lại
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL XÁC NHẬN XÓA) --- */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận xóa phòng?</h3>
                        <p className="text-gray-500 text-base mb-6">
                            Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa phòng này khỏi hệ thống không?
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition text-base"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition shadow-lg shadow-red-200 text-base"
                            >
                                Xóa ngay
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomManager;