import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import {
    Search, FileText, Printer, DollarSign, Calendar,
    CheckCircle, ArrowUpRight, Loader2
} from 'lucide-react';

const InvoiceManager = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Load dữ liệu
    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                // Gọi API mới tạo (hoặc viết thêm vào bookingApi)
                const res = await axiosClient.get('/bookings/invoices/all');
                setInvoices(res.data || res);
            } catch (error) {
                console.error("Lỗi tải hóa đơn:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    // Format tiền
    const formatMoney = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    // Format ngày
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN') + ' ' + new Date(dateString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    // Lọc tìm kiếm
    const filteredInvoices = invoices.filter(inv =>
        inv.MaHD.toString().includes(searchTerm) ||
        inv.MaDonDat.toString().includes(searchTerm) ||
        (inv.TenKhachHang && inv.TenKhachHang.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Tính tổng doanh thu hiển thị
    const totalRevenue = filteredInvoices.reduce((sum, item) => sum + parseFloat(item.TongTienThanhToan), 0);

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-teal-600" size={40} /></div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <FileText className="text-teal-600" /> Quản Lý Hóa Đơn
                    </h2>
                    <p className="text-gray-500 mt-1">Lịch sử doanh thu và thanh toán</p>
                </div>

                {/* Thẻ Doanh thu nhanh */}
                <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-teal-100 flex items-center gap-4">
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Tổng doanh thu</p>
                        <p className="text-xl font-bold text-teal-700">{formatMoney(totalRevenue)}</p>
                    </div>
                </div>
            </div>

            {/* Thanh công cụ */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm mã hóa đơn, mã đơn, tên khách..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-teal-50 text-teal-700 rounded-lg font-bold hover:bg-teal-100 flex items-center gap-2 transition">
                        <Printer size={18} /> Xuất Báo Cáo
                    </button>
                </div>
            </div>

            {/* Bảng Danh Sách */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-700 text-sm font-bold border-b border-gray-100">
                                <th className="px-6 py-4">#ID</th>
                                <th className="px-6 py-4">Mã Đơn</th>
                                <th className="px-6 py-4">Khách Hàng</th>
                                <th className="px-6 py-4">Ngày Lập</th>
                                <th className="px-6 py-4">Hình Thức</th>
                                <th className="px-6 py-4 text-right">Tổng Tiền</th>
                                <th className="px-6 py-4 text-center">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredInvoices.length > 0 ? (
                                filteredInvoices.map((item) => (
                                    <tr key={item.MaHD} className="hover:bg-gray-50 transition group">
                                        <td className="px-6 py-4 font-mono font-bold text-gray-600">#{item.MaHD}</td>
                                        <td className="px-6 py-4 text-teal-600 font-medium cursor-pointer hover:underline" onClick={() => navigate(`/admin/bookings/${item.MaDonDat}`)}>
                                            #{item.MaDonDat}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-800">{item.TenKhachHang || "---"}</div>
                                            <div className="text-xs text-gray-500">{item.SDT}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} /> {formatDate(item.NgayLap)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded border border-gray-200 bg-gray-50 text-xs font-medium text-gray-600">
                                                {item.HinhThucThanhToan === 'TienMat' ? 'Tiền mặt' :
                                                    item.HinhThucThanhToan === 'ChuyenKhoan' ? 'Chuyển khoản' : item.HinhThucThanhToan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-teal-700 text-base">
                                            {formatMoney(item.TongTienThanhToan)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => navigate(`/admin/invoices/detail/${item.MaHD}`)} // Dùng MaHD để mở hóa đơn
                                                className="p-2 text-gray-400 hover:text-teal-600 rounded-lg transition"
                                                title="Xem chi tiết hóa đơn"
                                            >
                                                Xem chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="7" className="text-center py-12 text-gray-500">Không tìm thấy hóa đơn nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InvoiceManager;