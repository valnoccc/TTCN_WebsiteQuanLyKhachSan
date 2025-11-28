import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save, Loader2 } from 'lucide-react';
import roomTypeApi from '../../api/roomTypeApi';

const RoomTypeManager = () => {
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // State cho Form
    const [formData, setFormData] = useState({
        MaLoai: null,
        TenLoai: '',
        GiaTheoGio: '',
        GiaTheoNgay: '',
        TienNghi: '',
        MoTa: ''
    });

    // Load dữ liệu
    const fetchTypes = async () => {
        try {
            const data = await roomTypeApi.getAll();
            setTypes(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    // Mở Modal Thêm mới
    const handleAdd = () => {
        setIsEditing(false);
        setFormData({ MaLoai: null, TenLoai: '', GiaTheoGio: '', GiaTheoNgay: '', TienNghi: '', MoTa: '' });
        setShowModal(true);
    };

    // Mở Modal Sửa
    const handleEdit = (item) => {
        setIsEditing(true);
        setFormData(item);
        setShowModal(true);
    };

    // Xử lý Lưu (Thêm hoặc Sửa)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await roomTypeApi.update(formData.MaLoai, formData);
                alert('Cập nhật thành công!');
            } else {
                await roomTypeApi.create(formData);
                alert('Thêm mới thành công!');
            }
            setShowModal(false);
            fetchTypes(); // Load lại danh sách
        } catch (error) {
            alert('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
        }
    };

    // Xử lý Xóa
    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa loại phòng này?')) {
            try {
                await roomTypeApi.delete(id);
                alert('Xóa thành công!');
                fetchTypes();
            } catch (error) {
                alert('Không thể xóa: ' + (error.response?.data?.message || 'Lỗi server'));
            }
        }
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-teal-600" /></div>;

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Quản Lý Loại Phòng</h2>
                    <p className="text-gray-500 text-sm">Cấu hình giá và tiện nghi cho các hạng phòng</p>
                </div>
                <button onClick={handleAdd} className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-teal-700 transition shadow-md shadow-teal-200">
                    <Plus size={20} /> Thêm loại mới
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-700 text-sm font-semibold border-b border-gray-100">
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Tên loại</th>
                            <th className="px-6 py-4">Giá theo giờ</th>
                            <th className="px-6 py-4">Giá theo ngày</th>
                            <th className="px-6 py-4">Tiện nghi</th>
                            <th className="px-6 py-4 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {types.map((item) => (
                            <tr key={item.MaLoai} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 text-gray-500 font-mono">{item.MaLoai}</td>
                                <td className="px-6 py-4 font-semibold text-gray-800">{item.TenLoai}</td>
                                <td className="px-6 py-4 text-teal-600">{formatPrice(item.GiaTheoGio)}</td>
                                <td className="px-6 py-4 text-teal-600 font-bold">{formatPrice(item.GiaTheoNgay)}</td>
                                <td className="px-6 py-4 text-gray-500 text-sm max-w-xs truncate" title={item.TienNghi}>
                                    {item.TienNghi}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => handleEdit(item)} className="p-2 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 transition">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(item.MaLoai)} className="p-2 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL FORM --- */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">{isEditing ? 'Cập nhật Loại Phòng' : 'Thêm Loại Phòng Mới'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 transition"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên loại phòng</label>
                                <input type="text" required value={formData.TenLoai} onChange={(e) => setFormData({ ...formData, TenLoai: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Ví dụ: Deluxe Room" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá theo giờ</label>
                                    <input type="number" required value={formData.GiaTheoGio} onChange={(e) => setFormData({ ...formData, GiaTheoGio: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá theo ngày</label>
                                    <input type="number" required value={formData.GiaTheoNgay} onChange={(e) => setFormData({ ...formData, GiaTheoNgay: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tiện nghi (cách nhau dấu phẩy)</label>
                                <input type="text" value={formData.TienNghi} onChange={(e) => setFormData({ ...formData, TienNghi: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Wifi, Tivi, Điều hòa..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chung</label>
                                <textarea rows="3" value={formData.MoTa} onChange={(e) => setFormData({ ...formData, MoTa: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Mô tả ngắn về hạng phòng này..."></textarea>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition">Hủy</button>
                                <button type="submit" className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition flex items-center gap-2">
                                    <Save size={18} /> Lưu lại
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomTypeManager;