import { useState, useEffect } from 'react';
import { Search, Trash2, Mail, Phone, User, Loader2, Plus, Edit, Save, X, CheckCircle, AlertCircle, AlertTriangle, MapPin, Shield } from 'lucide-react';
import userApi from '../../api/userApi';

const CustomerManager = () => {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // State Modal Thêm/Sửa
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Cập nhật state formData
    const [formData, setFormData] = useState({
        MaNguoiDung: null,
        TenDangNhap: '',
        HoTen: '',
        Email: '',
        SDT: '',
        DiaChi: '',
        VaiTro: 'KhachHang'
    });

    // State Modal Xóa
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // State Toast
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ ...toast, show: false }), 3000);
    };

    const fetchCustomers = async () => {
        try {
            const data = await userApi.getAll();
            setCustomers(data);
            setFilteredCustomers(data);
        } catch (error) {
            showToast("Lỗi tải danh sách khách hàng", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCustomers(); }, []);

    useEffect(() => {
        const results = customers.filter(c =>
            c.HoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.Email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.SDT?.includes(searchTerm)
        );
        setFilteredCustomers(results);
    }, [searchTerm, customers]);

    // --- XỬ LÝ FORM THÊM/SỬA ---
    const handleAdd = () => {
        setIsEditing(false);
        setFormData({
            MaNguoiDung: null,
            TenDangNhap: '',
            HoTen: '',
            Email: '',
            SDT: '',
            DiaChi: '',
            VaiTro: 'KhachHang'
        });
        setShowModal(true);
    };

    const handleEdit = (customer) => {
        setIsEditing(true);
        setFormData({
            ...customer,
            DiaChi: customer.DiaChi || '', // Đảm bảo không bị null
            VaiTro: customer.VaiTro || 'KhachHang'
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await userApi.update(formData.MaNguoiDung, formData);
                showToast('Cập nhật thông tin thành công!', 'success');
            } else {
                await userApi.create(formData);
                showToast('Thêm khách hàng mới thành công!', 'success');
            }
            setShowModal(false);
            fetchCustomers();
        } catch (error) {
            showToast(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
        }
    };

    // --- XỬ LÝ XÓA ---
    const openDeleteConfirmation = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await userApi.delete(deleteId);
            showToast('Đã xóa khách hàng!', 'success');
            fetchCustomers();
        } catch (error) {
            showToast(error.response?.data?.message || 'Không thể xóa', 'error');
        } finally {
            setShowDeleteModal(false);
            setDeleteId(null);
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-teal-600" size={40} /></div>;

    return (
        <div className="relative">
            {/* TOAST NOTIFICATION */}
            {toast.show && (
                <div className={`fixed top-24 right-5 z-[60] flex items-center gap-3 px-6 py-4 rounded-lg shadow-xl animate-fade-in-left border-l-4 ${toast.type === 'success' ? 'bg-white text-teal-700 border-teal-500' : 'bg-white text-red-700 border-red-500'
                    }`}>
                    {toast.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                    <span className="font-medium text-base">{toast.message}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Quản Lý Người Dùng</h2>
                    <p className="text-gray-500 text-base mt-1">Danh sách khách hàng và nhân viên</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm theo tên, email, sdt..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition text-base shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={handleAdd} className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-teal-700 transition shadow-md shadow-teal-200 whitespace-nowrap">
                        <Plus size={20} /> Thêm mới
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><User size={28} /></div>
                    <div>
                        <p className="text-gray-500 text-sm uppercase font-bold">Tổng tài khoản</p>
                        <p className="text-3xl font-bold text-gray-800">{customers.length}</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-700 text-base font-semibold border-b border-gray-100">
                                <th className="px-6 py-5">ID</th>
                                <th className="px-6 py-5">Thông tin cá nhân</th>
                                <th className="px-6 py-5">Liên hệ</th>
                                <th className="px-6 py-5">Địa chỉ</th> {/* Cột mới */}
                                <th className="px-6 py-5">Vai trò</th>
                                <th className="px-6 py-5 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer.MaNguoiDung} className="hover:bg-gray-50 transition group">
                                        <td className="px-6 py-5 text-gray-500 font-mono text-sm">#{customer.MaNguoiDung}</td>

                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${customer.VaiTro === 'Admin' ? 'bg-purple-500' : (customer.VaiTro === 'NhanVien' ? 'bg-blue-500' : 'bg-teal-500')
                                                    }`}>
                                                    {customer.HoTen ? customer.HoTen.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800 text-base">{customer.HoTen}</p>
                                                    <p className="text-sm text-gray-400">@{customer.TenDangNhap}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5 text-base text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Mail size={16} className="text-gray-400" /> <span>{customer.Email || '---'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone size={16} className="text-gray-400" /> <span>{customer.SDT || '---'}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Hiển thị Địa chỉ */}
                                        <td className="px-6 py-5 text-gray-600 text-base max-w-xs truncate" title={customer.DiaChi}>
                                            <div className="flex items-center gap-2">
                                                <MapPin size={16} className="text-gray-400 shrink-0" />
                                                <span>{customer.DiaChi || '---'}</span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1.5 rounded text-sm font-bold border flex items-center gap-1 w-fit ${customer.VaiTro === 'Admin'
                                                ? 'bg-purple-50 text-purple-700 border-purple-100'
                                                : (customer.VaiTro === 'NhanVien' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-green-50 text-green-700 border-green-100')
                                                }`}>
                                                {customer.VaiTro === 'Admin' && <Shield size={12} />}
                                                {customer.VaiTro}
                                            </span>
                                        </td>

                                        <td className="px-6 py-5 text-center">
                                            <div className="flex justify-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(customer)} className="p-2.5 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition" title="Sửa thông tin">
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteConfirmation(customer.MaNguoiDung)}
                                                    className="p-2.5 border border-red-100 rounded-lg text-red-500 hover:bg-red-50 hover:border-red-200 transition"
                                                    title="Xóa tài khoản"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-10 text-gray-500 text-base">
                                        Không tìm thấy kết quả.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL FORM --- */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-xl text-gray-800">{isEditing ? 'Cập nhật Thông Tin' : 'Thêm Người Dùng Mới'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 transition"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Chỉ cho nhập Username khi thêm mới */}
                            {!isEditing && (
                                <div>
                                    <label className="block text-base font-medium text-gray-700 mb-1.5">Tên đăng nhập *</label>
                                    <input type="text" required value={formData.TenDangNhap} onChange={(e) => setFormData({ ...formData, TenDangNhap: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-base" />
                                </div>
                            )}

                            <div>
                                <label className="block text-base font-medium text-gray-700 mb-1.5">Họ và tên *</label>
                                <input type="text" required value={formData.HoTen} onChange={(e) => setFormData({ ...formData, HoTen: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-base" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-base font-medium text-gray-700 mb-1.5">Email</label>
                                    <input type="email" value={formData.Email} onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-base" />
                                </div>
                                <div>
                                    <label className="block text-base font-medium text-gray-700 mb-1.5">Số điện thoại</label>
                                    <input type="text" value={formData.SDT} onChange={(e) => setFormData({ ...formData, SDT: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-base" />
                                </div>
                            </div>

                            {/* Ô NHẬP ĐỊA CHỈ MỚI */}
                            <div>
                                <label className="block text-base font-medium text-gray-700 mb-1.5">Địa chỉ</label>
                                <input type="text" value={formData.DiaChi} onChange={(e) => setFormData({ ...formData, DiaChi: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-base" placeholder="Số nhà, đường, phường, quận..." />
                            </div>

                            {/* Ô CHỌN VAI TRÒ (ROLE) MỚI */}
                            <div>
                                <label className="block text-base font-medium text-gray-700 mb-1.5">Vai trò</label>
                                <select
                                    value={formData.VaiTro}
                                    onChange={(e) => setFormData({ ...formData, VaiTro: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-base bg-white"
                                >
                                    <option value="KhachHang">Khách Hàng</option>
                                    <option value="NhanVien">Nhân Viên</option>
                                    <option value="Admin">Quản Trị Viên (Admin)</option>
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition text-base">Hủy</button>
                                <button type="submit" className="px-6 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition flex items-center gap-2 text-base">
                                    <Save size={20} /> Lưu lại
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Xóa (Giữ nguyên) */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận xóa tài khoản?</h3>
                        <p className="text-gray-500 text-base mb-6">
                            Hành động này sẽ xóa vĩnh viễn khách hàng và không thể hoàn tác.
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

export default CustomerManager;