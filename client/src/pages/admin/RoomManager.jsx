import { useState, useEffect } from 'react';
import {
    Building2, DoorOpen, Users, TrendingUp,
    Search, Plus, Edit, Trash2, Loader2
} from 'lucide-react';
import roomApi from '../../api/roomApi';

const RoomManager = () => {
    // State lưu trữ dữ liệu
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user')); // Lấy tên user để chào

    // State cho thống kê (Tính toán từ dữ liệu phòng)
    const [stats, setStats] = useState({
        totalRooms: 0,
        occupiedRooms: 0,
        emptyRooms: 0
    });

    // Fetch dữ liệu từ API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await roomApi.getAll();
                setRooms(data);

                // Tính toán thống kê đơn giản
                const total = data.length;
                const occupied = data.filter(r => r.TrangThai !== 'Trong').length;

                setStats({
                    totalRooms: total,
                    occupiedRooms: occupied,
                    emptyRooms: total - occupied
                });

            } catch (error) {
                console.error("Lỗi tải danh sách phòng:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Hàm format tiền tệ
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // Hàm xử lý xóa
    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc muốn xóa phòng này?')) {
            console.log("Xóa phòng ID:", id);
            // TODO: Gọi API xóa thật ở đây
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64 text-teal-600">
            <Loader2 className="animate-spin" size={40} />
        </div>
    );

    return (
        <div>
            {/* 3. BẢNG DANH SÁCH PHÒNG */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                {/* --- ĐÃ XÓA MENU TAB THỪA Ở ĐÂY --- */}

                {/* Thanh công cụ */}
                <div className="p-6 flex flex-col md:flex-row justify-between items-center bg-gray-50/50 gap-4 border-b border-gray-100">
                    <div className="flex gap-4 w-full md:w-2/3">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm phòng..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                            />
                        </div>
                        <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500">
                            <option>Tất cả trạng thái</option>
                            <option>Còn trống</option>
                            <option>Đã đặt</option>
                        </select>
                    </div>

                    <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-md shadow-teal-200 w-full md:w-auto justify-center">
                        <Plus size={20} /> Thêm phòng
                    </button>
                </div>

                {/* Bảng Dữ liệu */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-700 text-sm font-semibold border-b border-gray-100">
                                <th className="px-6 py-4">Mã số</th>
                                <th className="px-6 py-4">Tên phòng</th>
                                <th className="px-6 py-4">Loại</th>
                                <th className="px-6 py-4">Giá/đêm</th>
                                <th className="px-6 py-4">Sức chứa</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rooms.length > 0 ? (
                                rooms.map((room) => (
                                    <tr key={room.MaPhong} className="hover:bg-gray-50 transition group">
                                        <td className="px-6 py-4 font-mono text-gray-600 text-start">{room.MaPhong}</td>
                                        <td className="px-6 py-4 text-gray-800 font-medium">{room.TenPhong}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium border border-gray-200">
                                                {room.TenLoai}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-teal-600">{formatPrice(room.GiaTheoNgay)}</td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">{room.SucChua} người</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${room.TrangThai === 'Trong'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${room.TrangThai === 'Trong' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {room.TrangThai === 'Trong' ? 'Còn trống' : 'Đã đặt'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 border border-gray-200 rounded-lg text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition" title="Sửa">
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(room.MaPhong)}
                                                    className="p-2 border border-gray-200 rounded-lg text-red-500 hover:bg-red-50 hover:border-red-200 transition"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-8 text-gray-500">
                                        Không có dữ liệu phòng nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs text-gray-400">Hiển thị {rooms.length} kết quả</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50" disabled>Trước</button>
                        <button className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50" disabled>Sau</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomManager;