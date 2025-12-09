import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import bookingApi from '../../api/bookingApi';
import { ArrowLeft, Printer, Download } from 'lucide-react';

const InvoiceDetail = () => {
    const { id } = useParams(); // Đây là MaHD
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                // Gọi API lấy chi tiết hóa đơn
                const res = await bookingApi.getInvoiceById(id);
                setInvoice(res);
            } catch (error) {
                console.error(error);
                alert("Không tìm thấy hóa đơn");
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [id]);

    const formatMoney = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('vi-VN') : '---';

    const handlePrint = () => window.print();

    if (loading) return <div className="p-10 text-center">Đang tải hóa đơn...</div>;
    if (!invoice) return <div className="p-10 text-center text-red-500">Dữ liệu trống</div>;

    // Parse JSON danh sách phòng (nếu lưu dạng chuỗi trong DB)
    let roomDetails = [];
    try {
        roomDetails = typeof invoice.ChiTietPhong === 'string' ? JSON.parse(invoice.ChiTietPhong) : invoice.ChiTietPhong;
    } catch (e) { roomDetails = []; }

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans flex flex-col items-center">

            {/* --- THANH CÔNG CỤ (Ẩn khi in) --- */}
            <div className="w-full max-w-3xl mb-6 flex justify-between items-center print:hidden">
                <button onClick={() => navigate('/admin/invoices')} className="flex items-center gap-2 text-gray-600 hover:text-teal-600 font-bold">
                    <ArrowLeft size={20} /> Quay lại danh sách
                </button>
                <div className="flex gap-3">
                    <button onClick={handlePrint} className="px-5 py-2.5 bg-teal-700 text-white rounded-lg shadow-md hover:bg-teal-800 flex items-center gap-2 font-bold transition">
                        <Printer size={20} /> In Hóa Đơn
                    </button>
                </div>
            </div>

            {/* --- TỜ HÓA ĐƠN (A4) --- */}
            <div className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl p-10 print:shadow-none print:p-0 print:w-full" id="invoice-content">

                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 uppercase tracking-widest">Hóa Đơn</h1>
                        <p className="text-gray-500 mt-2 font-medium">Mã HĐ: #{invoice.MaHD}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold text-teal-700 uppercase">Khách Sạn Titilus Luxury</h2>
                        <p className="text-sm text-gray-600 mt-1">180 Cao Lỗ, Phường 4, Quận 8, TP.HCM</p>
                        <p className="text-sm text-gray-600">Hotline: 0984 523 312</p>
                    </div>
                </div>

                {/* Thông tin 2 bên */}
                <div className="grid grid-cols-2 gap-12 mb-8">
                    <div>
                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Khách hàng</h3>
                        <p className="font-bold text-lg text-gray-800">{invoice.TenKhachHang}</p>
                        <p className="text-gray-600">{invoice.SDT}</p>
                        <p className="text-gray-600">{invoice.Email}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Chi tiết đơn</h3>
                        <p className="text-gray-600"><strong>Ngày lập:</strong> {formatDate(invoice.NgayLap)}</p>
                        <p className="text-gray-600"><strong>Đơn đặt phòng:</strong> #{invoice.MaDonDat}</p>
                        <p className="text-gray-600"><strong>Hình thức TT:</strong> {invoice.HinhThucThanhToan}</p>
                    </div>
                </div>

                {/* Bảng chi tiết dịch vụ */}
                <table className="w-full mb-8 border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-y-2 border-gray-200 text-gray-600 text-sm uppercase">
                            <th className="py-3 text-left pl-4">Mô tả dịch vụ / Phòng</th>
                            <th className="py-3 text-right pr-4">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700 text-sm">
                        {/* List phòng */}
                        {roomDetails && roomDetails.map((room, idx) => (
                            <tr key={idx} className="border-b border-gray-100">
                                <td className="py-4 pl-4">
                                    <p className="font-bold text-gray-800">{room.TenPhong}</p>
                                    <span className="text-xs text-gray-500">
                                        Check-in: {formatDate(invoice.NgayNhanPhong)} - Check-out: {formatDate(invoice.NgayTraPhong)}
                                    </span>
                                </td>
                                <td className="py-4 text-right pr-4 font-medium">
                                    {formatMoney(room.Gia)}
                                </td>
                            </tr>
                        ))}

                        {/* Tổng tiền phòng */}
                        <tr className="border-b border-gray-100">
                            <td className="py-4 pl-4 font-medium text-gray-600">Tổng tiền phòng</td>
                            <td className="py-4 text-right pr-4 font-bold text-gray-800">{formatMoney(invoice.TienPhong)}</td>
                        </tr>

                        {/* Phụ thu */}
                        {Number(invoice.PhuThu) > 0 && (
                            <tr className="border-b border-gray-100 bg-red-50/30">
                                <td className="py-4 pl-4 font-medium text-red-600">Phụ thu / Dịch vụ thêm</td>
                                <td className="py-4 text-right pr-4 font-bold text-red-600">
                                    + {formatMoney(invoice.PhuThu)}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Tổng kết */}
                <div className="flex justify-end mb-16">
                    <div className="w-1/2">
                        <div className="flex justify-between py-4 border-t-2 border-gray-800">
                            <span className="text-xl font-bold text-teal-800">TỔNG THANH TOÁN</span>
                            <span className="text-2xl font-bold text-teal-800">{formatMoney(invoice.TongTienThanhToan || invoice.TongTien)}</span>
                        </div>
                    </div>
                </div>

                {/* Chữ ký */}
                <div className="flex justify-between text-center text-sm mb-12">
                    <div>
                        <p className="font-bold mb-16">Khách hàng</p>
                        <p className="text-xs italic">(Ký, ghi rõ họ tên)</p>
                    </div>
                    <div>
                        <p className="font-bold mb-16">Người lập phiếu</p>
                        <p className="text-xs italic">(Ký, ghi rõ họ tên)</p>
                    </div>
                </div>

                <div className="text-center text-xs text-gray-400 border-t border-gray-100 pt-6">
                    <p>Cảm ơn quý khách đã sử dụng dịch vụ tại Titilus Luxury Hotel!</p>
                </div>
            </div>

            {/* Style in ấn */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #invoice-content, #invoice-content * { visibility: visible; }
                    #invoice-content { 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 100%; 
                        margin: 0; 
                        padding: 0;
                        box-shadow: none;
                    }
                    .print\\:hidden { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default InvoiceDetail;