import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Users, Maximize, Bed, BedDouble, X, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import roomApi from '../../api/roomApi';

const RoomList = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [priceFilter, setPriceFilter] = useState({
        min: '',
        max: ''
    });
    const [selectedRoomTypes, setSelectedRoomTypes] = useState([]);
    const [availableRoomTypes, setAvailableRoomTypes] = useState([]);
    const [filteredPage, setFilteredPage] = useState(1); // Trang hiện tại cho kết quả filter
    const ITEMS_PER_PAGE = 6;

    // State cho tìm kiếm
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [searchInfo, setSearchInfo] = useState(null);

    // State cho modal đặt phòng
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');

    // --- STATE PHÂN TRANG ---
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 6,
        totalPages: 1
    });

    // Hàm gọi API - thông thường hoặc tìm kiếm
    const fetchRooms = async (page) => {
        setLoading(true);
        try {
            // Kiểm tra xem có query params không
            const checkInParam = searchParams.get('checkIn');
            const checkOutParam = searchParams.get('checkOut');
            const guestCountParam = searchParams.get('guestCount');

            if (checkInParam && checkOutParam && guestCountParam) {
                // Chế độ tìm kiếm
                const response = await roomApi.getAvailable(checkInParam, checkOutParam, guestCountParam);
                setRooms(response.data || []);
                setIsSearchMode(true);
                setSearchInfo({
                    checkIn: checkInParam,
                    checkOut: checkOutParam,
                    guestCount: guestCountParam
                });
                setPagination({ page: 1, limit: response.data?.length || 0, totalPages: 1 });
            } else {
                // Kiểm tra xem có filter không (giá hoặc loại phòng)
                const hasFilters = priceFilter.min || priceFilter.max || selectedRoomTypes.length > 0;

                // Nếu có filter, load tất cả phòng, không thì phân trang bình thường
                const limit = hasFilters ? 1000 : 6;
                const response = await roomApi.getAll({ page: hasFilters ? 1 : page, limit: limit });

                if (response.data) {
                    setRooms(response.data);
                    if (hasFilters) {
                        // Khi filter, không có pagination
                        setPagination({ page: 1, limit: response.data.length, totalPages: 1 });
                    } else {
                        // Pagination bình thường
                        setPagination({
                            page: response.pagination.page,
                            limit: response.pagination.limit,
                            totalPages: response.pagination.totalPages
                        });
                    }
                } else {
                    setRooms([]);
                }
                setIsSearchMode(false);
                setSearchInfo(null);
            }

            window.scrollTo(0, 0);
        } catch (error) {
            console.error("Lỗi tải phòng:", error);
            setRooms([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms(1);
    }, [searchParams, priceFilter.min, priceFilter.max, selectedRoomTypes]); // Re-fetch khi URL params hoặc filters thay đổi

    // Fetch all room types from API
    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/room-types');
                const data = await response.json();
                const types = data.map(rt => rt.TenLoai).filter(Boolean);
                setAvailableRoomTypes(types);
            } catch (error) {
                console.error('Error fetching room types:', error);
            }
        };
        fetchRoomTypes();
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages && !isSearchMode) {
            fetchRooms(newPage);
        }
    };

    // Xóa bộ lọc tìm kiếm
    const handleClearSearch = () => {
        navigate('/rooms');
    };

    // State cho bộ lọc sidebar
    const [filterInputs, setFilterInputs] = useState({
        checkIn: searchParams.get('checkIn') || '',
        checkOut: searchParams.get('checkOut') || '',
        guestCount: searchParams.get('guestCount') || '2'
    });

    // Áp dụng bộ lọc
    const handleApplyFilter = () => {
        if (filterInputs.checkIn && filterInputs.checkOut) {
            navigate(`/rooms?checkIn=${filterInputs.checkIn}&checkOut=${filterInputs.checkOut}&guestCount=${filterInputs.guestCount}`);
        }
    };

    // Toggle room type selection
    const handleRoomTypeToggle = (type) => {
        setSelectedRoomTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    // Reset filtered page when filters change
    useEffect(() => {
        setFilteredPage(1);
    }, [priceFilter.min, priceFilter.max, selectedRoomTypes]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // Mở modal đặt phòng
    const handleBookNowClick = (room) => {
        setSelectedRoom(room);
        setCheckIn('');
        setCheckOut('');
        setShowBookingModal(true);
    };

    // Xác nhận đặt phòng
    const handleConfirmBooking = () => {
        // Kiểm tra validation
        if (!checkIn || !checkOut) {
            alert("Vui lòng chọn ngày nhận và trả phòng!");
            return;
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (checkInDate < today) {
            alert("Ngày nhận phòng không được trong quá khứ!");
            return;
        }

        if (checkOutDate <= checkInDate) {
            alert("Ngày trả phòng phải sau ngày nhận phòng!");
            return;
        }

        // Tính số đêm
        const days = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        const totalPrice = selectedRoom.GiaTheoNgay * days;

        // Chuyển hướng sang trang BookingForm với state
        navigate('/booking', {
            state: {
                room: selectedRoom,
                checkIn: checkIn,
                checkOut: checkOut,
                days: days,
                totalPrice: totalPrice
            }
        });
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
                    <h1 className="text-2xl font-bold text-gray-800">
                        {isSearchMode ? 'Kết quả tìm kiếm' : 'Danh Sách Phòng'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isSearchMode
                            ? `Tìm thấy ${rooms.length} phòng phù hợp`
                            : `Trang ${pagination.page} / ${pagination.totalPages}`
                        }
                    </p>
                </div>

                {/* Banner tìm kiếm */}
                {isSearchMode && searchInfo && (
                    <div className="mb-6 bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                            <Calendar className="text-teal-600" size={20} />
                            <div className="flex gap-4">
                                <span className="text-gray-700">
                                    <strong>Nhận:</strong> {new Date(searchInfo.checkIn).toLocaleDateString('vi-VN')}
                                </span>
                                <span className="text-gray-700">
                                    <strong>Trả:</strong> {new Date(searchInfo.checkOut).toLocaleDateString('vi-VN')}
                                </span>
                                <span className="text-gray-700">
                                    <strong>Khách:</strong> {searchInfo.guestCount} người
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handleClearSearch}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition font-semibold"
                        >
                            <X size={16} />
                            Xóa bộ lọc
                        </button>
                    </div>
                )}

                {/* Thanh tìm kiếm ngang */}
                <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Ngày nhận phòng</label>
                            <input
                                type="date"
                                value={filterInputs.checkIn}
                                onChange={(e) => setFilterInputs({ ...filterInputs, checkIn: e.target.value })}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Ngày trả phòng</label>
                            <input
                                type="date"
                                value={filterInputs.checkOut}
                                onChange={(e) => setFilterInputs({ ...filterInputs, checkOut: e.target.value })}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Số khách</label>
                            <select
                                value={filterInputs.guestCount}
                                onChange={(e) => setFilterInputs({ ...filterInputs, guestCount: e.target.value })}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm"
                            >
                                <option value="1">1 Người</option>
                                <option value="2">2 Người</option>
                                <option value="3">3 Người</option>
                                <option value="4">4 Người</option>
                                <option value="5">5 Người</option>
                                <option value="6">6+ Người</option>
                            </select>
                        </div>
                        <div>
                            <button
                                onClick={handleApplyFilter}
                                disabled={!filterInputs.checkIn || !filterInputs.checkOut}
                                className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
                            >
                                <Search size={18} />
                                Tìm kiếm
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* --- SIDEBAR BỘ LỌC --- */}
                    <div className="w-full lg:w-1/4">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                    <Filter size={18} /> Bộ Lọc
                                </h3>
                                <button
                                    onClick={handleClearSearch}
                                    className="text-teal-600 text-sm flex items-center gap-1 hover:underline"
                                >
                                    <X size={14} /> Xóa
                                </button>
                            </div>

                            {/* 1. Khoảng Giá */}
                            <div className="mb-6 pb-6 border-b border-gray-100">
                                <h4 className="font-semibold mb-4 text-gray-700 text-sm uppercase tracking-wide">Khoảng Giá</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1.5">Giá từ</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={priceFilter.min}
                                            onChange={(e) => setPriceFilter({ ...priceFilter, min: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1.5">Giá đến</label>
                                        <input
                                            type="number"
                                            placeholder="5000000"
                                            value={priceFilter.max}
                                            onChange={(e) => setPriceFilter({ ...priceFilter, max: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 2. Hạng Phòng */}
                            <div className="mb-4">
                                <h4 className="font-semibold mb-4 text-gray-700 text-sm uppercase tracking-wide">Hạng Phòng</h4>
                                <div className="space-y-3">
                                    {availableRoomTypes.length > 0 ? (
                                        availableRoomTypes.map((type) => (
                                            <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRoomTypes.includes(type)}
                                                    onChange={() => handleRoomTypeToggle(type)}
                                                    className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 transition"
                                                />
                                                <span className="text-gray-600 group-hover:text-teal-600 transition">{type}</span>
                                            </label>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-400">Đang tải...</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- DANH SÁCH PHÒNG --- */}
                    <div className="w-full lg:w-3/4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                            {(() => {
                                // Lọc phòng theo giá và loại phòng
                                let filteredRooms = rooms;

                                // Lọc theo giá
                                if (priceFilter.min || priceFilter.max) {
                                    filteredRooms = filteredRooms.filter(room => {
                                        const price = room.GiaTheoNgay;
                                        const min = priceFilter.min ? parseInt(priceFilter.min) : 0;
                                        const max = priceFilter.max ? parseInt(priceFilter.max) : Infinity;
                                        return price >= min && price <= max;
                                    });
                                }

                                // Lọc theo loại phòng
                                if (selectedRoomTypes.length > 0) {
                                    filteredRooms = filteredRooms.filter(room =>
                                        selectedRoomTypes.includes(room.TenLoai)
                                    );
                                }

                                // Client-side pagination cho kết quả filter
                                const totalFilteredPages = Math.ceil(filteredRooms.length / ITEMS_PER_PAGE);
                                const startIndex = (filteredPage - 1) * ITEMS_PER_PAGE;
                                const endIndex = startIndex + ITEMS_PER_PAGE;
                                const paginatedRooms = filteredRooms.slice(startIndex, endIndex);

                                return paginatedRooms.length > 0 ? (
                                    paginatedRooms.map((room) => (
                                        <div key={room.MaPhong} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition duration-300 group flex flex-col h-full">
                                            {/* Hình ảnh */}
                                            <div className="relative h-60 overflow-hidden">
                                                <img
                                                    src={room.HinhAnh || "https://via.placeholder.com/400x300?text=No+Image"}
                                                    alt={room.TenPhong}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                                />

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
                                                    <div>
                                                        <span className="text-2xl font-bold text-teal-600 block">{formatPrice(room.GiaTheoNgay)}</span>
                                                        <span className="text-xs text-gray-400 font-medium">/đêm</span>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <Link to={`/rooms/${room.MaPhong}`} className="px-5 py-2.5 border-2 border-teal-600 text-teal-600 font-bold rounded-lg hover:bg-teal-50 transition text-sm">Chi tiết</Link>
                                                        <button
                                                            onClick={() => handleBookNowClick(room)}
                                                            className="px-5 py-2.5 font-bold rounded-lg transition text-sm shadow-md bg-teal-600 text-white hover:bg-teal-700 shadow-teal-200"
                                                        >
                                                            Đặt ngay
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 text-center py-10 text-gray-500">
                                        Không tìm thấy phòng nào phù hợp.
                                    </div>
                                )
                            })()}
                        </div>

                        {/* --- THANH PHÂN TRANG --- */}
                        {(() => {
                            const hasFilters = priceFilter.min || priceFilter.max || selectedRoomTypes.length > 0;

                            if (hasFilters) {
                                // Pagination cho kết quả filter
                                let filteredRooms = rooms;

                                if (priceFilter.min || priceFilter.max) {
                                    filteredRooms = filteredRooms.filter(room => {
                                        const price = room.GiaTheoNgay;
                                        const min = priceFilter.min ? parseInt(priceFilter.min) : 0;
                                        const max = priceFilter.max ? parseInt(priceFilter.max) : Infinity;
                                        return price >= min && price <= max;
                                    });
                                }

                                if (selectedRoomTypes.length > 0) {
                                    filteredRooms = filteredRooms.filter(room => selectedRoomTypes.includes(room.TenLoai));
                                }

                                const totalPages = Math.ceil(filteredRooms.length / ITEMS_PER_PAGE);

                                return totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-2">
                                        <button
                                            onClick={() => setFilteredPage(prev => Math.max(1, prev - 1))}
                                            disabled={filteredPage === 1}
                                            className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>

                                        {[...Array(totalPages)].map((_, index) => {
                                            const pageNum = index + 1;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setFilteredPage(pageNum)}
                                                    className={`w-10 h-10 rounded-lg font-bold transition ${filteredPage === pageNum
                                                        ? "bg-teal-600 text-white shadow-md shadow-teal-200"
                                                        : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}

                                        <button
                                            onClick={() => setFilteredPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={filteredPage === totalPages}
                                            className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                );
                            } else {
                                // Pagination bình thường (không filter)
                                return !isSearchMode && pagination.totalPages > 1 && (
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
                                );
                            }
                        })()}
                    </div>
                </div>
            </div>

            {/* --- MODAL CHỌN NGÀY ĐẶT PHÒNG --- */}
            {showBookingModal && selectedRoom && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowBookingModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{selectedRoom.TenPhong}</h2>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className="text-sm text-gray-400 line-through">{formatPrice(selectedRoom.GiaTheoNgay * 1.2)}</span>
                                        <span className="text-2xl font-bold text-teal-600">{formatPrice(selectedRoom.GiaTheoNgay)}</span>
                                        <span className="text-sm text-gray-500">/đêm</span>
                                    </div>
                                    <span className="inline-flex items-center gap-1 mt-2 bg-green-50 text-green-600 text-xs font-bold px-2 py-1 rounded-full">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span> Còn trống
                                    </span>
                                </div>
                                <button
                                    onClick={() => setShowBookingModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            {/* Ngày nhận phòng */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                    Nhận phòng
                                </label>
                                <input
                                    type="date"
                                    value={checkIn}
                                    onChange={(e) => setCheckIn(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition text-gray-700 font-medium"
                                />
                            </div>

                            {/* Ngày trả phòng */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                    Trả phòng
                                </label>
                                <input
                                    type="date"
                                    value={checkOut}
                                    onChange={(e) => setCheckOut(e.target.value)}
                                    min={checkIn || new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition text-gray-700 font-medium"
                                />
                            </div>

                            {/* Sức chứa */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                    Sức chứa tối đa
                                </label>
                                <div className="flex items-center gap-2 text-teal-600">
                                    <Users size={20} />
                                    <span className="text-lg font-bold">{selectedRoom.SucChua} Người lớn</span>
                                </div>
                            </div>

                            {/* Thông báo */}
                            {!checkIn || !checkOut ? (
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                                    <Calendar className="text-blue-500 mt-0.5" size={20} />
                                    <p className="text-sm text-blue-700">
                                        Vui lòng chọn ngày nhận & trả phòng để xem giá.
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-teal-50 border border-teal-100 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600">Số đêm:</span>
                                        <span className="text-sm font-bold text-gray-800">
                                            {Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))} đêm
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Tổng tiền:</span>
                                        <span className="text-lg font-bold text-teal-600">
                                            {formatPrice(selectedRoom.GiaTheoNgay * Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)))}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100">
                            <button
                                onClick={handleConfirmBooking}
                                disabled={!checkIn || !checkOut}
                                className="w-full py-4 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-lg disabled:shadow-none"
                            >
                                Đặt Phòng Ngay
                            </button>
                            <p className="text-xs text-center text-gray-400 mt-3">
                                * Các chi phí phát sinh sẽ được thanh toán tại quầy khi trả phòng.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomList;