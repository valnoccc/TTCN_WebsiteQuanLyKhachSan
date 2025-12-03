import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Users, Maximize, Bed, BedDouble, X, ChevronLeft, ChevronRight } from 'lucide-react';
import roomApi from '../../api/roomApi';

const RoomList = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [priceRange, setPriceRange] = useState(5000000); // Giá max mặc định

    // --- STATE PHÂN TRANG ---
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 6,
        totalPages: 1
    });

    // Hàm gọi API
    const fetchRooms = async (page) => {
        setLoading(true);
        try {
            const response = await roomApi.getAll({
                page: page,
                limit: 6
            });

            // Xử lý dữ liệu trả về từ API phân trang
            if (response.data) {
                setRooms(response.data);
                setPagination({
                    page: response.pagination.page,
                    limit: response.pagination.limit,
                    totalPages: response.pagination.totalPages
                });
            } else {
                setRooms([]);
            }

            window.scrollTo(0, 0);
        } catch (error) {
            console.error("Lỗi tải phòng:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms(1);
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchRooms(newPage);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen py-8 font-sans">
            <div className="container mx-auto px-4">

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Danh Sách Phòng</h1>
                    <p className="text-sm text-gray-500 mt-1">Trang {pagination.page} / {pagination.totalPages}</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* --- SIDEBAR BỘ LỌC (ĐẦY ĐỦ) --- */}
                    <div className="w-full lg:w-1/4">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                    <Filter size={18} /> Bộ Lọc
                                </h3>
                                <button className="text-teal-600 text-sm flex items-center gap-1 hover:underline">
                                    <X size={14} /> Xóa
                                </button>
                            </div>

                            {/* 1. Khoảng Giá */}
                            <div className="mb-8">
                                <h4 className="font-semibold mb-4 text-gray-700 text-sm uppercase tracking-wide">Khoảng Giá</h4>
                                <input
                                    type="range"
                                    min="0"
                                    max="5000000"
                                    step="100000"
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(e.target.value)}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                                />
                                <div className="flex justify-between text-sm text-gray-600 mt-2 font-medium">
                                    <span>0đ</span>
                                    <span>{formatPrice(priceRange)}</span>
                                </div>
                            </div>

                            {/* 2. Sức chứa */}
                            <div className="mb-8">
                                <h4 className="font-semibold mb-4 text-gray-700 text-sm uppercase tracking-wide">Số lượng khách</h4>
                                <div className="space-y-3">
                                    {[
                                        { label: '1 - 2 Người', val: '2' },
                                        { label: '3 - 4 Người', val: '4' },
                                        { label: '5+ Người', val: '6' }
                                    ].map((item, index) => (
                                        <label key={index} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 transition" />
                                            <span className="text-gray-600 flex items-center gap-2 group-hover:text-teal-600 transition">
                                                <Users size={16} className="text-gray-400 group-hover:text-teal-600" /> {item.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* 3. Loại Giường */}
                            <div className="mb-8">
                                <h4 className="font-semibold mb-4 text-gray-700 text-sm uppercase tracking-wide">Loại Giường</h4>
                                <div className="space-y-3">
                                    {[
                                        { label: '1 Giường đôi lớn', icon: <BedDouble size={16} /> },
                                        { label: '2 Giường đơn', icon: <Bed size={16} /> },
                                        { label: '2 Giường đôi', icon: <BedDouble size={16} /> }
                                    ].map((item, index) => (
                                        <label key={index} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 transition" />
                                            <span className="text-gray-600 flex items-center gap-2 group-hover:text-teal-600 transition">
                                                <span className="text-gray-400 group-hover:text-teal-600">{item.icon}</span> {item.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* 4. Loại Phòng */}
                            <div className="mb-4">
                                <h4 className="font-semibold mb-4 text-gray-700 text-sm uppercase tracking-wide">Hạng Phòng</h4>
                                <div className="space-y-3">
                                    {['Standard', 'Deluxe', 'Suite', 'Presidential'].map((type) => (
                                        <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 transition" />
                                            <span className="text-gray-600 group-hover:text-teal-600 transition">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- DANH SÁCH PHÒNG --- */}
                    <div className="w-full lg:w-3/4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                            {rooms.length > 0 ? (
                                rooms.map((room) => (
                                    <div key={room.MaPhong} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition duration-300 group flex flex-col h-full">
                                        {/* Hình ảnh */}
                                        <div className="relative h-60 overflow-hidden">
                                            <img
                                                src={room.HinhAnh || "https://via.placeholder.com/400x300?text=No+Image"}
                                                alt={room.TenPhong}
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                            />
                                            {room.TrangThai === 'Trong' ? (
                                                <span className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase shadow-sm">Còn trống</span>
                                            ) : (
                                                <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase shadow-sm">Đã đặt</span>
                                            )}
                                        </div>
                                        {/* Nội dung */}
                                        <div className="p-6 flex flex-col flex-grow">
                                            <div className="mb-4">
                                                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{room.TenPhong}</h3>
                                                <p className="text-gray-500 text-sm line-clamp-2">{room.MoTa || "Phòng nghỉ hiện đại..."}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-6">
                                                <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100"><Users size={16} className="text-teal-600" /> {room.SucChua} người</span>
                                                <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100"><Maximize size={16} className="text-teal-600" /> {room.DienTich}m²</span>
                                            </div>
                                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                                                <div><span className="text-2xl font-bold text-teal-600 block">{formatPrice(room.GiaTheoNgay)}</span><span className="text-xs text-gray-400 font-medium">/đêm</span></div>
                                                <div className="flex gap-3">
                                                    <Link to={`/rooms/${room.MaPhong}`} className="px-5 py-2.5 border-2 border-teal-600 text-teal-600 font-bold rounded-lg hover:bg-teal-50 transition text-sm">Chi tiết</Link>
                                                    <button disabled={room.TrangThai !== 'Trong'} className={`px-5 py-2.5 font-bold rounded-lg transition text-sm shadow-md ${room.TrangThai === 'Trong' ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-200' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>{room.TrangThai === 'Trong' ? 'Đặt ngay' : 'Hết phòng'}</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 text-center py-10 text-gray-500">
                                    Không tìm thấy phòng nào phù hợp.
                                </div>
                            )}
                        </div>

                        {/* --- THANH PHÂN TRANG (PAGINATION) --- */}
                        {pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                {[...Array(pagination.totalPages)].map((_, index) => {
                                    const pageNum = index + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`w-10 h-10 rounded-lg font-bold transition ${pagination.page === pageNum
                                                    ? "bg-teal-600 text-white shadow-md shadow-teal-200"
                                                    : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomList;