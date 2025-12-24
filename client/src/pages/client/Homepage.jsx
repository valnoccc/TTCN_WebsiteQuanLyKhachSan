import { useState, useEffect } from 'react';
import {
    Calendar, Users, Search, ArrowRight, Star,
    Wifi, Coffee, MapPin, Phone, Mail,
    Waves, Dumbbell, Car, Utensils, CheckCircle2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import roomApi from '../../api/roomApi';

// --- IMPORT SWIPER ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
// Import CSS của Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const HomePage = () => {
    const navigate = useNavigate();
    // State chứa tất cả phòng
    const [rooms, setRooms] = useState([]);

    // --- STATE CHO TÌM KIẾM ---
    const [searchParams, setSearchParams] = useState({
        checkInDate: '',
        checkOutDate: '',
        guestCount: 2
    });
    const [filteredRooms, setFilteredRooms] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');

    // Lấy TẤT CẢ phòng từ Database
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                // Gọi API getAll có thể trả về { data: [...], pagination: ... } hoặc [...] tùy vào backend
                const response = await roomApi.getAll();

                // Kiểm tra cấu trúc dữ liệu trả về để lấy mảng phòng cho đúng
                if (response && response.data && Array.isArray(response.data)) {
                    // Trường hợp Backend trả về dạng phân trang: { data: [...], pagination: ... }
                    setRooms(response.data);
                } else if (Array.isArray(response)) {
                    // Trường hợp Backend trả về mảng trực tiếp: [...]
                    setRooms(response);
                } else {
                    // Dữ liệu không hợp lệ
                    console.error("Dữ liệu phòng không đúng định dạng:", response);
                    setRooms([]);
                }
            } catch (error) {
                console.error("Lỗi tải phòng:", error);
                setRooms([]); // Set về rỗng nếu lỗi để tránh crash
            }
        };
        fetchRooms();
    }, []);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // Xử lý tìm kiếm - chuyển sang trang /rooms với params
    const handleSearch = () => {
        setSearchError('');

        // Validate
        if (!searchParams.checkInDate || !searchParams.checkOutDate) {
            setSearchError('Vui lòng chọn ngày nhận và trả phòng');
            return;
        }

        const checkIn = new Date(searchParams.checkInDate);
        const checkOut = new Date(searchParams.checkOutDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (checkIn < today) {
            setSearchError('Ngày nhận phòng không thể trong quá khứ');
            return;
        }

        if (checkIn >= checkOut) {
            setSearchError('Ngày trả phòng phải sau ngày nhận phòng');
            return;
        }

        // Chuyển sang trang /rooms với query params
        navigate(`/rooms?checkIn=${searchParams.checkInDate}&checkOut=${searchParams.checkOutDate}&guestCount=${searchParams.guestCount}`);
    };

    // Dữ liệu Dịch vụ
    const services = [
        { icon: <Utensils size={32} />, title: "Nhà hàng 5 Sao", desc: "Thưởng thức ẩm thực Á - Âu đa dạng từ đầu bếp hàng đầu.", color: "bg-orange-100 text-orange-600" },
        { icon: <Waves size={32} />, title: "Bể bơi vô cực", desc: "Ngắm hoàng hôn tuyệt đẹp tại bể bơi tràn bờ view biển.", color: "bg-blue-100 text-blue-600" },
        { icon: <Dumbbell size={32} />, title: "Gym & Spa", desc: "Phục hồi năng lượng với liệu trình massage và phòng tập hiện đại.", color: "bg-purple-100 text-purple-600" },
        { icon: <Car size={32} />, title: "Đưa đón sân bay", desc: "Dịch vụ xe sang đưa đón tận nơi, an toàn và tiện lợi.", color: "bg-green-100 text-green-600" },
    ];

    return (
        <div className="font-sans text-gray-800">

            {/* --- 1. HERO BANNER --- */}
            <div className="relative h-[600px] w-full">
                <div
                    className="absolute inset-0 bg-cover bg-center fixed-bg"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80')" }}
                >
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>

                <div className="relative h-full container mx-auto flex flex-col justify-center items-center text-center text-white px-4 pt-10">
                    <span className="uppercase tracking-[0.2em] text-sm mb-4 font-semibold text-teal-300 animate-fade-in">Welcome to Titilus Luxury</span>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight drop-shadow-lg">
                        Thiên Đường Nghỉ Dưỡng <br /> <span className="text-teal-400">Đẳng Cấp Quốc Tế</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-100 max-w-2xl drop-shadow-md">
                        Trải nghiệm sự sang trọng, riêng tư và dịch vụ hoàn hảo tại điểm đến đẹp nhất hành tinh.
                    </p>
                </div>
            </div>

            {/* --- 2. BOOKING BAR --- */}
            <div className="container mx-auto px-4 relative z-20 -mt-24 mb-20">
                <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-4 gap-6 items-end border border-gray-100">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ngày nhận phòng</label>
                        <div className="flex items-center bg-gray-50 p-3 rounded-xl border border-gray-200 hover:border-teal-500 transition group">
                            <Calendar size={20} className="text-gray-400 group-hover:text-teal-600 mr-2 transition" />
                            <input
                                type="date"
                                value={searchParams.checkInDate}
                                onChange={(e) => setSearchParams({ ...searchParams, checkInDate: e.target.value })}
                                className="bg-transparent w-full text-sm font-semibold text-gray-700 outline-none cursor-pointer"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ngày trả phòng</label>
                        <div className="flex items-center bg-gray-50 p-3 rounded-xl border border-gray-200 hover:border-teal-500 transition group">
                            <Calendar size={20} className="text-gray-400 group-hover:text-teal-600 mr-2 transition" />
                            <input
                                type="date"
                                value={searchParams.checkOutDate}
                                onChange={(e) => setSearchParams({ ...searchParams, checkOutDate: e.target.value })}
                                className="bg-transparent w-full text-sm font-semibold text-gray-700 outline-none cursor-pointer"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Số khách</label>
                        <div className="flex items-center bg-gray-50 p-3 rounded-xl border border-gray-200 hover:border-teal-500 transition group">
                            <Users size={20} className="text-gray-400 group-hover:text-teal-600 mr-2 transition" />
                            <select
                                value={searchParams.guestCount}
                                onChange={(e) => setSearchParams({ ...searchParams, guestCount: parseInt(e.target.value) })}
                                className="bg-transparent w-full text-sm font-semibold text-gray-700 outline-none cursor-pointer"
                            >
                                <option value="1">1 Người</option>
                                <option value="2">2 Người lớn</option>
                                <option value="3">3 Người</option>
                                <option value="4">4 Người lớn</option>
                                <option value="5">5 Người</option>
                                <option value="6">6 Người</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={handleSearch}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl transition duration-300 flex items-center justify-center gap-2 shadow-lg shadow-teal-200 active:scale-95"
                        >
                            <Search size={20} />
                            Tìm Phòng
                        </button>
                    </div>
                </div>
                {/* Hiển thị lỗi nếu có */}
                {searchError && (
                    <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                        {searchError}
                    </div>
                )}
            </div>

            {/* --- 3. ABOUT US --- */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="w-full lg:w-1/2 relative">
                            <div className="grid grid-cols-2 gap-4">
                                <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80" className="rounded-2xl shadow-lg w-full h-64 object-cover transform translate-y-8" alt="Resort 1" />
                                <img src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80" className="rounded-2xl shadow-lg w-full h-64 object-cover" alt="Resort 2" />
                            </div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-full shadow-xl">
                                <div className="bg-teal-600 text-white w-24 h-24 rounded-full flex flex-col items-center justify-center text-center">
                                    <span className="text-2xl font-bold">5</span>
                                    <span className="text-xs uppercase">Sao</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full lg:w-1/2">
                            <span className="text-teal-600 font-bold text-sm uppercase tracking-wider">Về chúng tôi</span>
                            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-6 leading-tight">
                                Không gian nghỉ dưỡng <br /> <span className="text-teal-600">Hòa mình cùng thiên nhiên</span>
                            </h2>
                            <p className="text-gray-500 mb-6 leading-relaxed text-lg">
                                Titilus Luxury tọa lạc tại vị trí đắc địa với tầm nhìn bao quát đại dương. Chúng tôi mang đến sự kết hợp hoàn hảo giữa kiến trúc hiện đại và vẻ đẹp hoang sơ của thiên nhiên.
                            </p>
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="flex items-center gap-2 text-gray-700 font-medium"><CheckCircle2 className="text-teal-500" size={20} /> Bãi biển riêng</div>
                                <div className="flex items-center gap-2 text-gray-700 font-medium"><CheckCircle2 className="text-teal-500" size={20} /> Hỗ trợ 24/7</div>
                                <div className="flex items-center gap-2 text-gray-700 font-medium"><CheckCircle2 className="text-teal-500" size={20} /> Ẩm thực cao cấp</div>
                                <div className="flex items-center gap-2 text-gray-700 font-medium"><CheckCircle2 className="text-teal-500" size={20} /> Spa trị liệu</div>
                            </div>
                            <button className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-bold py-3 px-8 rounded-full transition duration-300">
                                Đọc thêm về chúng tôi
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 4. SERVICES --- */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-teal-600 font-bold text-sm uppercase tracking-wider">Tiện ích & Dịch vụ</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Trải Nghiệm Dịch Vụ Đỉnh Cao</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {services.map((item, index) => (
                            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition duration-300 border border-gray-100 group cursor-pointer">
                                <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300`}>
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-teal-600 transition">{item.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- 5. DANH SÁCH PHÒNG (SLIDER SWIPER) --- */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <span className="text-teal-600 font-bold text-sm uppercase tracking-wider">Khám phá</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Phòng Nghỉ Của Chúng Tôi</h2>
                        </div>
                        <Link to="/rooms" className="hidden md:flex items-center gap-2 text-teal-600 font-bold hover:underline">
                            Xem tất cả <ArrowRight size={20} />
                        </Link>
                    </div>

                    {/* SWIPER CAROUSEL */}
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={30}
                        slidesPerView={1}
                        navigation={true}
                        pagination={{ clickable: true }}
                        autoplay={{ delay: 3000, disableOnInteraction: false }}
                        breakpoints={{
                            640: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                        }}
                        className="pb-12 !px-2"
                    >
                        {/* Kiểm tra mảng rooms có dữ liệu thì mới render */}
                        {Array.isArray(rooms) && rooms.length > 0 ? (
                            rooms.map((room) => (
                                <SwiperSlide key={room.MaPhong}>
                                    <Link to={`/rooms/${room.MaPhong}`} className="group bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition duration-300 block h-full">
                                        <div className="relative h-72 overflow-hidden">
                                            <img
                                                src={room.HinhAnh || "https://via.placeholder.com/400x300"}
                                                alt={room.TenPhong}
                                                className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                                            />
                                            <span className="absolute top-4 left-4 bg-white/90 backdrop-blur text-teal-700 text-xs font-bold px-3 py-1 rounded-full uppercase shadow-sm">
                                                {room.TenLoai}
                                            </span>
                                            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-6 pt-12">
                                                <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{room.TenPhong}</h3>
                                                <div className="flex text-yellow-400">
                                                    <Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-6 flex justify-between items-center">
                                            <div>
                                                <span className="text-sm text-gray-400">Giá chỉ từ</span>
                                                <p className="text-xl font-bold text-teal-600">{formatPrice(room.GiaTheoNgay)}</p>
                                            </div>
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 group-hover:bg-teal-600 group-hover:text-white transition">
                                                <ArrowRight size={20} />
                                            </div>
                                        </div>
                                    </Link>
                                </SwiperSlide>
                            ))
                        ) : (
                            <div className="text-center py-10 w-full text-gray-500">
                                Không có phòng nào để hiển thị hoặc đang tải...
                            </div>
                        )}
                    </Swiper>

                    <div className="mt-8 text-center md:hidden">
                        <Link to="/rooms" className="inline-flex items-center gap-2 text-teal-600 font-bold hover:underline">
                            Xem tất cả <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* --- 6. VỊ TRÍ & LIÊN HỆ --- */}
            <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
                {/* Pattern nền mờ nhẹ */}
                <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col lg:flex-row gap-12 items-stretch"> {/* Sửa items-center thành items-stretch để 2 cột cao bằng nhau */}

                        {/* Cột Thông tin (Trái) */}
                        <div className="w-full lg:w-1/2 space-y-8 flex flex-col justify-center">
                            <div>
                                <span className="text-teal-400 font-bold text-sm uppercase tracking-widest mb-2 block">Liên hệ với chúng tôi</span>
                                <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                                    Đến Và Trải Nghiệm <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">Kỳ Nghỉ Trong Mơ</span>
                                </h2>
                                <p className="text-slate-400 mt-6 text-lg leading-relaxed">
                                    Tọa lạc tại vị trí vàng bên bờ biển Mỹ Khê, Titilus Luxury là điểm khởi đầu hoàn hảo cho hành trình khám phá Đà Nẵng của bạn.
                                </p>
                            </div>

                            <div className="space-y-6 bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                                <div className="flex items-start gap-5 group">
                                    <div className="w-12 h-12 bg-teal-900/50 rounded-xl flex items-center justify-center text-teal-400 shrink-0 group-hover:bg-teal-600 group-hover:text-white transition duration-300">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-white group-hover:text-teal-400 transition">Địa chỉ</h4>
                                        <p className="text-slate-400 mt-1">180 Cao Lỗ, Phường 4, Quận 8, TP. Hồ Chí Minh</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-5 group">
                                    <div className="w-12 h-12 bg-teal-900/50 rounded-xl flex items-center justify-center text-teal-400 shrink-0 group-hover:bg-teal-600 group-hover:text-white transition duration-300">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-white group-hover:text-teal-400 transition">Hotline & Zalo</h4>
                                        <p className="text-slate-400 mt-1">+84 905 123 456 (Hỗ trợ 24/7)</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-5 group">
                                    <div className="w-12 h-12 bg-teal-900/50 rounded-xl flex items-center justify-center text-teal-400 shrink-0 group-hover:bg-teal-600 group-hover:text-white transition duration-300">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-white group-hover:text-teal-400 transition">Email</h4>
                                        <p className="text-slate-400 mt-1">booking@titilus.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cột Bản đồ (Phải)*/}
                        <div className="w-full lg:w-1/2 min-h-[400px]">
                            <div className="relative w-full h-full min-h-[400px] rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-700 group">
                                {/* Google Maps Iframe chính xác cho 180 Cao Lỗ */}
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.9543420446194!2d106.67525717479207!3d10.738002459901775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f62a90e5dbd%3A0x674d5126513db295!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBDw7RuZyBuZ2jhu4cgU8OgaSBHw7Ju!5e0!3m2!1svi!2s!4v1764401408856!5m2!1svi!2s"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0, minHeight: '400px' }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    className="grayscale group-hover:grayscale-0 transition duration-700 w-full h-full"
                                ></iframe>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

        </div>
    );
};

export default HomePage;