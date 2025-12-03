import { useState, useEffect } from 'react';
import {
    Plus, Edit, Trash2, X, Save, Loader2,
    CheckCircle, AlertCircle, AlertTriangle
} from 'lucide-react';
import roomTypeApi from '../../api/roomTypeApi';

const RoomTypeManager = () => {
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    // State Modal Thêm/Sửa
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // State Modal Xóa (Mới)
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const [formData, setFormData] = useState({
        MaLoai: null, TenLoai: '', GiaTheoGio: '', GiaTheoNgay: '', TienNghi: '', MoTa: ''
    });

    // --- STATE QUẢN LÝ THÔNG BÁO (TOAST) ---
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Hàm hiển thị Toast
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        // Tự động tắt sau 3 giây
        setTimeout(() => setToast({ ...toast, show: false }), 3000);
    };

    const fetchTypes = async () => {
        try {
            const data = await roomTypeApi.getAll();
            setTypes(data);
        } catch (error) {
            console.error(error);
            showToast("Lỗi tải danh sách loại phòng!", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTypes(); }, []);

    // --- LOGIC FORM THÊM/SỬA ---
    const handleAdd = () => {
        setIsEditing(false);
        setFormData({ MaLoai: null, TenLoai: '', GiaTheoGio: '', GiaTheoNgay: '', TienNghi: '', MoTa: '' });
        setShowModal(true);
    };

    const handleEdit = (item) => {
        setIsEditing(true);
        setFormData(item);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate dữ liệu cơ bản
        if (!formData.TenLoai || !formData.GiaTheoNgay) {
            showToast("Vui lòng điền đầy đủ thông tin bắt buộc!", "error");
            return;
        }

        const submitData = {
            ...formData,
            GiaTheoGio: parseFloat(formData.GiaTheoGio),
            GiaTheoNgay: parseFloat(formData.GiaTheoNgay)
        };

        try {
            if (isEditing) {
                await roomTypeApi.update(formData.MaLoai, submitData);
                showToast('Cập nhật loại phòng thành công!', 'success');
            } else {
                await roomTypeApi.create(submitData);
                showToast('Thêm loại phòng mới thành công!', 'success');
            }
            setShowModal(false);
            fetchTypes();
        } catch (error) {
            showToast(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
        }
    };

    // --- LOGIC XÓA (MODAL + TOAST) ---
    const openDeleteConfirmation = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await roomTypeApi.delete(deleteId);
            showToast('Đã xóa loại phòng thành công!', 'success');
            fetchTypes();
        } catch (error) {
            showToast(error.response?.data?.message || 'Không thể xóa loại phòng này!', 'error');
        } finally {
            setShowDeleteModal(false);
            setDeleteId(null);
        }
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-teal-600" size={40} /></div>;

    return (
        <div className="relative">

            {/* --- TOAST NOTIFICATION COMPONENT --- */}
            {toast.show && (
                <div className={`fixed top-24 right-5 z-[60] flex items-center gap-3 px-6 py-4 rounded-lg shadow-xl animate-fade-in-left border-l-4 transition-all duration-300 ${toast.type === 'success'
                    ? 'bg-white text-teal-700 border-teal-500'
                    : 'bg-white text-red-700 border-red-500'
                    }`}>
                    {toast.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                    <div>
                        <h4 className="font-bold text-sm uppercase">{toast.type === 'success' ? 'Thành công' : 'Lỗi'}</h4>
                        <p className="font-medium text-base">{toast.message}</p>
                    </div>
                    <button onClick={() => setToast({ ...toast, show: false })} className="ml-4 text-gray-400 hover:text-gray-600">
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Quản Lý Loại Phòng</h2>
                    <p className="text-gray-500 text-base mt-1">Cấu hình giá và tiện nghi cho các hạng phòng</p>
                </div>
                <button onClick={handleAdd} className="flex items-center gap-2 bg-teal-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-teal-700 transition shadow-md shadow-teal-200 text-base">
                    <Plus size={20} /> Thêm loại mới
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-700 text-base font-semibold border-b border-gray-100">
                            <th className="px-6 py-5">ID</th>
                            <th className="px-6 py-5">Tên loại</th>
                            <th className="px-6 py-5">Giá/giờ</th>
                            <th className="px-6 py-5">Giá/ngày</th>
                            <th className="px-6 py-5">Tiện nghi</th>
                            <th className="px-6 py-5 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {types.map((item) => (
                            <tr key={item.MaLoai} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-5 text-gray-500 font-mono text-sm">#{item.MaLoai}</td>
                                <td className="px-6 py-5 font-bold text-gray-800 text-base">{item.TenLoai}</td>
                                <td className="px-6 py-5 text-teal-600 text-base">{formatPrice(item.GiaTheoGio)}</td>
                                <td className="px-6 py-5 text-teal-600 font-bold text-base">{formatPrice(item.GiaTheoNgay)}</td>
                                <td className="px-6 py-5 text-gray-600 text-sm max-w-md truncate" title={item.TienNghi}>
                                    {item.TienNghi}
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex justify-center gap-3">
                                        <button onClick={() => handleEdit(item)} className="p-2.5 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 transition">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => openDeleteConfirmation(item.MaLoai)} className="p-2.5 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL FORM THÊM/SỬA --- */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-xl text-gray-800">{isEditing ? 'Cập nhật Loại Phòng' : 'Thêm Loại Phòng Mới'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 transition"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-base font-medium text-gray-700 mb-1.5">Tên loại phòng</label>
                                <input type="text" required value={formData.TenLoai} onChange={(e) => setFormData({ ...formData, TenLoai: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-base" placeholder="Ví dụ: Deluxe Room" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-base font-medium text-gray-700 mb-1.5">Giá theo giờ</label>
                                    <input type="number" required value={formData.GiaTheoGio} onChange={(e) => setFormData({ ...formData, GiaTheoGio: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-base" />
                                </div>
                                <div>
                                    <label className="block text-base font-medium text-gray-700 mb-1.5">Giá theo ngày</label>
                                    <input type="number" required value={formData.GiaTheoNgay} onChange={(e) => setFormData({ ...formData, GiaTheoNgay: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-base" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-base font-medium text-gray-700 mb-1.5">Tiện nghi (cách nhau dấu phẩy)</label>
                                <input type="text" value={formData.TienNghi} onChange={(e) => setFormData({ ...formData, TienNghi: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-base" placeholder="Wifi, Tivi, Điều hòa..." />
                            </div>
                            <div>
                                <label className="block text-base font-medium text-gray-700 mb-1.5">Mô tả chung</label>
                                <textarea rows="3" value={formData.MoTa} onChange={(e) => setFormData({ ...formData, MoTa: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-base" placeholder="Mô tả ngắn về hạng phòng này..."></textarea>
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

            {/* --- MODAL XÁC NHẬN XÓA (MỚI) --- */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận xóa loại phòng?</h3>
                        <p className="text-gray-500 text-base mb-6">
                            Hành động này không thể hoàn tác. <br />
                            <span className="text-red-500 text-sm font-medium">(Lưu ý: Hệ thống sẽ chặn nếu đang có phòng thuộc loại này)</span>
                        </p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setShowDeleteModal(false)} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition text-base">Hủy bỏ</button>
                            <button onClick={confirmDelete} className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition shadow-lg shadow-red-200 text-base">Xóa ngay</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomTypeManager;