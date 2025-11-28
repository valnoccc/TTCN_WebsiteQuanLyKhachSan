import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronDown, History, Settings, LayoutDashboard } from 'lucide-react';

const ProfileDropdown = ({ isLight = false }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const user = JSON.parse(localStorage.getItem('user')) || {};
    const isAdmin = user.role === 'Admin';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/homepage');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- CẤU HÌNH MÀU SẮC (LOGIC MỚI) ---
    // Sử dụng class 'group' để xử lý hover cho các phần tử con

    return (
        <div className="relative" ref={dropdownRef}>
            {/* --- NÚT BẤM (TRIGGER) --- */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group flex items-center gap-3 p-1.5 pr-4 rounded-full transition-all duration-300 border focus:outline-none ${isLight
                    ? "border-transparent hover:bg-white hover:shadow-lg hover:scale-105" // Hover trên nền xanh: Nền trắng, đổ bóng, phóng to nhẹ
                    : "border-transparent hover:bg-gray-100 hover:border-gray-200"        // Hover trên nền trắng: Nền xám
                    }`}
            >
                {/* Avatar: Đảo màu khi hover */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold shadow-sm transition-colors duration-300 ${isLight
                    ? "bg-white text-teal-600 group-hover:bg-teal-600 group-hover:text-white" // Bình thường: Trắng/Xanh -> Hover: Xanh/Trắng
                    : (isAdmin ? 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white' : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white')
                    }`}>
                    {user.fullname ? user.fullname.charAt(0).toUpperCase() : 'U'}
                </div>

                {/* Thông tin User */}
                <div className="text-right hidden md:block">
                    <p className={`text-sm font-bold leading-none max-w-[120px] truncate transition-colors duration-300 ${isLight
                        ? "text-white group-hover:text-teal-700" // Chữ chuyển từ Trắng -> Xanh đậm
                        : "text-gray-700"
                        }`}>
                        {user.fullname}
                    </p>
                    <p className={`text-xs mt-1 transition-colors duration-300 ${isLight
                        ? "text-teal-100 group-hover:text-teal-500" // Chữ phụ chuyển từ Xanh nhạt -> Xanh vừa
                        : "text-gray-500"
                        }`}>
                        {isAdmin ? 'Quản trị viên' : 'Khách hàng'}
                    </p>
                </div>

                {/* Mũi tên */}
                <ChevronDown size={16} className={`transition-all duration-300 ${isOpen ? 'rotate-180' : ''} ${isLight
                    ? "text-teal-100 group-hover:text-teal-600"
                    : "text-gray-400"
                    }`} />
            </button>

            {/* --- MENU DROPDOWN (Giữ nguyên) --- */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl ring-1 ring-black ring-opacity-5 py-2 origin-top-right animate-fade-in z-50 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 md:hidden">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.fullname}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{isAdmin ? 'Quản trị viên' : 'Khách hàng'}</p>
                    </div>

                    <div className="py-2">
                        <Link
                            to="/profile"
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center px-5 py-3 text-sm font-medium transition ${isAdmin ? 'text-gray-700 hover:bg-teal-50 hover:text-teal-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}`}
                        >
                            <User size={18} className="mr-3 opacity-70" /> Thông tin cá nhân
                        </Link>

                        {isAdmin ? (
                            <Link to="/admin" onClick={() => setIsOpen(false)} className="flex items-center px-5 py-3 text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition">
                                <LayoutDashboard size={18} className="mr-3 opacity-70" /> Dashboard
                            </Link>
                        ) : (
                            <Link to="/my-booking" onClick={() => setIsOpen(false)} className="flex items-center px-5 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition">
                                <History size={18} className="mr-3 opacity-70" /> Lịch sử đặt phòng
                            </Link>
                        )}
                    </div>

                    <div className="border-t border-gray-100"></div>

                    <button onClick={handleLogout} className="w-full flex items-center px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition text-left">
                        <LogOut size={18} className="mr-3 opacity-70" /> Đăng xuất
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;