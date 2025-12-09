import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // 1. Thêm useNavigate
import {
    Star, MapPin, Users, Maximize, BedDouble,
    Wifi, Wind, Tv, Coffee, CheckCircle2, ArrowLeft, Heart, Share2, CalendarIcon,
    Bath, Utensils, Box, ShieldCheck, Sun
} from 'lucide-react';
import roomApi from '../../api/roomApi';

const RoomDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate(); // 2. Khởi tạo hook điều hướng

    // --- KHAI BÁO STATE ---
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState('');
    const [relatedRooms, setRelatedRooms] = useState([]);

    // State đặt phòng
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [days, setDays] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);

    // --- CÁC USE EFFECT ---

    // 1. Fetch dữ liệu phòng chính
    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchRoomDetail = async () => {
            try {
                setLoading(true);
                const data = await roomApi.get(id);
                setRoom(data);
                if (data.DanhSachAnh && data.DanhSachAnh.length > 0) {
                    setActiveImage(data.DanhSachAnh[0]);
                } else {
                    setActiveImage("https://via.placeholder.com/800x600?text=No+Image");
                }
            } catch (error) {
                console.error("Lỗi:", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchRoomDetail();
    }, [id]);

    // 2. Fetch phòng gợi ý
    useEffect(() => {
        const fetchRelated = async () => {
            try {
                const data = await roomApi.getRelated(id);
                setRelatedRooms(data);
            } catch (error) {
                console.error("Lỗi lấy phòng khác:", error);
            }
        };
        if (id) fetchRelated();
    }, [id]);

    // 3. Tính tiền
    useEffect(() => {
        if (checkIn && checkOut && room) {
            const start = new Date(checkIn);
            const end = new Date(checkOut);
            const timeDiff = end.getTime() - start.getTime();
            const dayCount = Math.ceil(timeDiff / (1000 * 3600 * 24));

            if (dayCount > 0) {
                setDays(dayCount);
                setTotalPrice(room.GiaTheoNgay * dayCount);
            } else {
                setDays(0);
                setTotalPrice(0);
            }
        }
    }, [checkIn, checkOut, room]);

    // --- 3. HÀM XỬ LÝ SỰ KIỆN ĐẶT PHÒNG (MỚI THÊM) ---
    const handleBookNow = () => {
        // Kiểm tra validation lần cuối
        if (!checkIn || !checkOut) {
            alert("Vui lòng chọn ngày nhận và trả phòng!");
            return;
        }
        if (days <= 0) {
            alert("Ngày trả phòng phải sau ngày nhận phòng!");
            return;
        }

        // Chuyển hướng sang trang BookingForm và mang theo dữ liệu (room, giá, ngày)
        navigate('/booking', {
            state: {
                room: room,
                checkIn: checkIn,
                checkOut: checkOut,
                days: days,
                totalPrice: totalPrice
            }
        });
    };

    // --- CÁC HÀM HELPER ---
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const renderAmenities = (tienNghiString) => {
        if (!tienNghiString) return null;
        const amenitiesList = tienNghiString.split(',').map(item => item.trim());

        const iconMap = {
            'Wifi': <Wifi size={20} className="text-teal-500" />,
            'Internet': <Wifi size={20} className="text-teal-500" />,
            'Điều hòa': <Wind size={20} className="text-teal-500" />,
            'Máy lạnh': <Wind size={20} className="text-teal-500" />,
            'Tivi': <Tv size={20} className="text-teal-500" />,
            'Smart TV': <Tv size={20} className="text-teal-500" />,
            'Máy pha cà phê': <Coffee size={20} className="text-teal-500" />,
            'Két sắt': <ShieldCheck size={20} className="text-teal-500" />,
            'Bồn tắm': <Bath size={20} className="text-teal-500" />,
            'Bếp': <Utensils size={20} className="text-teal-500" />,
            'Minibar': <Box size={20} className="text-teal-500" />,
            'Ban công': <Sun size={20} className="text-teal-500" />,
            'Nước nóng': <CheckCircle2 size={20} className="text-teal-500" />
        };

        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                {amenitiesList.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 text-gray-600">
                        {iconMap[item] || <CheckCircle2 size={20} className="text-teal-500" />}
                        <span>{item}</span>
                    </div>
                ))}
            </div>
        );
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
        </div>
    );

    if (!room) return <div className="text-center py-20">Không tìm thấy phòng!</div>;

    return (
        <div className="bg-white font-sans text-gray-800 pb-20">

            {/* HEADER THÔNG TIN */}
            <div className="container mx-auto px-4 pt-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <Link to="/rooms" className="flex items-center text-gray-500 hover:text-teal-600 transition">
                        <ArrowLeft size={18} className="mr-2" /> Quay lại danh sách
                    </Link>
                    <div className="flex gap-4">
                        <button className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition"><Heart size={20} /> Lưu tin</button>
                        <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition"><Share2 size={20} /> Chia sẻ</button>
                    </div>
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{room.TenPhong} - {room.TenLoai}</h1>
                    <div className="flex items-center text-gray-500 text-sm">
                        <MapPin size={16} className="text-teal-600 mr-1" />
                        <span>Khu nghỉ dưỡng Titilus Luxury</span>
                    </div>
                </div>
            </div>

            {/* KHU VỰC CHÍNH: ẢNH & FORM ĐẶT */}
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* === CỘT TRÁI: THƯ VIỆN ẢNH === */}
                    <div className="w-full lg:w-2/3">
                        {/* Ảnh Lớn */}
                        <div className="h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-4 shadow-sm border border-gray-100">
                            <img
                                src={activeImage}
                                alt="Main View"
                                className="w-full h-full object-cover transition-opacity duration-300"
                            />
                        </div>

                        {/* Dải Ảnh Thu Nhỏ */}
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {room.DanhSachAnh && room.DanhSachAnh.map((img, index) => (
                                <div
                                    key={index}
                                    onClick={() => setActiveImage(img)}
                                    className={`relative h-24 w-36 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer transition border-2 ${activeImage === img ? 'border-teal-500 opacity-100' : 'border-transparent opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <img src={img} alt={`Thumbnail ${index}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>

                        {/* Thông tin chi tiết */}
                        <div className="mt-8 pr-4">
                            <div className="flex gap-8 py-6 border-y border-gray-100 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-teal-50 rounded-lg text-teal-600"><Users size={24} /></div>
                                    <div><p className="text-sm text-gray-500">Sức chứa</p><p className="font-bold">{room.SucChua} người</p></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-teal-50 rounded-lg text-teal-600"><Maximize size={24} /></div>
                                    <div><p className="text-sm text-gray-500">Diện tích</p><p className="font-bold">{room.DienTich}m²</p></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-teal-50 rounded-lg text-teal-600"><BedDouble size={24} /></div>
                                    <div><p className="text-sm text-gray-500">Giường</p><p className="font-bold">{room.SucChua > 2 ? '2 Giường đôi' : 'King Size'}</p></div>
                                </div>
                            </div>

                            <div className="mb-10">
                                <h2 className="text-2xl font-bold mb-4 text-gray-900">Mô tả phòng</h2>
                                <p className="text-gray-600 leading-relaxed mb-4 whitespace-pre-line">
                                    {room.MoTa || room.MoTaLoai || "Đang cập nhật mô tả..."}
                                </p>
                            </div>

                            <div className="mb-10">
                                <h2 className="text-2xl font-bold mb-6 text-gray-900">Tiện nghi cao cấp</h2>
                                {renderAmenities(room.TienNghi)}
                            </div>
                        </div>
                    </div>

                    {/* === CỘT PHẢI: FORM ĐẶT PHÒNG === */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-24">

                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <span className="text-gray-400 text-sm line-through block">
                                        {formatPrice(room.GiaTheoNgay * 1.2)}
                                    </span>
                                    <span className="text-3xl font-bold text-teal-600">{formatPrice(room.GiaTheoNgay)}</span>
                                    <span className="text-gray-500 text-sm"> /đêm</span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 focus-within:border-teal-500 transition">
                                        <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Nhận phòng</label>
                                        <input
                                            type="date"
                                            className="w-full bg-transparent text-sm font-semibold outline-none text-gray-700 cursor-pointer"
                                            value={checkIn}
                                            onChange={(e) => setCheckIn(e.target.value)}
                                        />
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 focus-within:border-teal-500 transition">
                                        <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Trả phòng</label>
                                        <input
                                            type="date"
                                            className="w-full bg-transparent text-sm font-semibold outline-none text-gray-700 cursor-pointer"
                                            value={checkOut}
                                            onChange={(e) => setCheckOut(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Sức chứa tối đa</label>
                                    <div className="flex items-center gap-2 text-gray-800 font-bold text-sm py-0.5">
                                        <Users size={16} className="text-teal-600" />
                                        <span>{room.SucChua} Người lớn</span>
                                    </div>
                                </div>
                            </div>

                            {/* Khu vực tính tiền & Nút Đặt phòng */}
                            {days > 0 ? (
                                <div className="animate-fade-in">
                                    <div className="flex justify-between items-center mb-4 text-gray-600 text-sm pb-4 border-b border-gray-100">
                                        <span className="underline">{formatPrice(room.GiaTheoNgay)} x {days} đêm</span>
                                        <span className="font-semibold">{formatPrice(totalPrice)}</span>
                                    </div>

                                    <div className="flex justify-between items-center mb-6 font-bold text-lg text-gray-800">
                                        <span>Thành tiền phòng</span>
                                        <span className="text-teal-700">{formatPrice(totalPrice)}</span>
                                    </div>

                                    {/* --- 4. GẮN SỰ KIỆN onClick VÀO ĐÂY --- */}
                                    <button
                                        onClick={handleBookNow}
                                        className="w-full bg-teal-600 text-white font-bold py-3.5 rounded-xl hover:bg-teal-700 transition shadow-lg shadow-teal-200 active:scale-[0.98]"
                                    >
                                        Đặt Phòng Ngay
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 mb-4">
                                    <CalendarIcon className="mx-auto text-gray-400 mb-2" size={32} />
                                    <p className="text-gray-500 text-sm font-medium">Vui lòng chọn ngày nhận & trả phòng <br /> để xem giá.</p>
                                </div>
                            )}

                            {days <= 0 && (
                                <button disabled className="w-full bg-gray-300 text-gray-500 font-bold py-3.5 rounded-xl cursor-not-allowed">
                                    Đặt Phòng Ngay
                                </button>
                            )}

                            <p className="text-center text-xs text-gray-400 mt-4 italic">
                                * Các chi phí phát sinh sẽ được thanh toán tại quầy khi trả phòng.
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- PHÒNG KHÁC CÓ THỂ BẠN THÍCH --- */}
                <div className="bg-gray-50 py-12 border-t border-gray-100 mt-12 rounded-2xl">
                    <div className="container mx-auto px-4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">Có thể bạn cũng thích</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedRooms.map((item) => (
                                <Link to={`/rooms/${item.MaPhong}`} key={item.MaPhong} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 border border-gray-100 block">
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={item.HinhAnh || "https://via.placeholder.com/400x300"}
                                            alt={item.TenPhong}
                                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                        />
                                        <span className="absolute top-3 left-3 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
                                            {item.TenLoai}
                                        </span>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-bold text-gray-800 mb-2 truncate group-hover:text-teal-600 transition">{item.TenPhong}</h3>
                                        <div className="flex gap-4 text-xs text-gray-500 mb-4">
                                            <span className="flex items-center gap-1"><Users size={14} /> {item.SucChua} người</span>
                                            <span className="flex items-center gap-1"><Maximize size={14} /> {item.DienTich}m²</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-teal-600 text-lg">{formatPrice(item.GiaTheoNgay)}</span>
                                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Xem ngay</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomDetail;