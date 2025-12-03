import { useState, useEffect } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { Menu, X, Home, List, User, History, LogOut, LayoutDashboard } from 'lucide-react';
import ProfileDropdown from '../common/ProfileDropdown';

const Header = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'Admin';
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [window.location.pathname]);

    // CSS Class cho Link Desktop (Nền xanh -> Chữ trắng)
    const getNavLinkClass = ({ isActive }) =>
        `px-4 py-2 rounded-full text-sm font-bold transition duration-200 uppercase tracking-wide ${isActive
            ? "bg-white text-emerald-600 shadow-md"  // Active: Nền trắng, Chữ xanh
            : "text-white hover:bg-white/20"         // Normal: Chữ trắng, Hover nền mờ
        }`;

    const MobileLink = ({ to, icon, children }) => (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition duration-200 ${isActive
                    ? "bg-emerald-50 text-emerald-700 font-bold border-l-4 border-emerald-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-emerald-600"
                }`
            }
        >
            {icon} {children}
        </NavLink>
    );

    return (
        <header className="bg-emerald-500 shadow-md sticky top-0 z-50 font-sans border-b border-emerald-600">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between relative z-50">

                {/* 1. LOGO */}
                <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2 tracking-tighter hover:opacity-90 transition">
                    Titilus Luxury
                </Link>

                {/* 2. DESKTOP NAV */}
                <nav className="hidden md:flex space-x-2">
                    <NavLink to="/" className={getNavLinkClass}>
                        Trang chủ
                    </NavLink>
                    <NavLink to="/rooms" className={getNavLinkClass}>
                        Danh sách phòng
                    </NavLink>
                </nav>

                {/* 3. DESKTOP USER ACTIONS */}
                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <ProfileDropdown isLight={true} />
                    ) : (
                        <div className="flex gap-3">
                            <Link to="/login" className="px-5 py-2 text-white font-semibold hover:bg-white/20 rounded-full transition text-sm">
                                Đăng nhập
                            </Link>
                            <Link to="/register" className="px-5 py-2 bg-white text-emerald-600 font-bold rounded-full hover:bg-emerald-50 shadow-md transition text-sm">
                                Đăng ký
                            </Link>
                        </div>
                    )}
                </div>

                {/* 4. MOBILE MENU TOGGLE */}
                <button
                    className="md:hidden p-2 text-white hover:bg-white/20 rounded-lg transition focus:outline-none"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* --- 5. MOBILE MENU DRAWER --- */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            <div
                className={`fixed top-16 left-0 w-full bg-white shadow-xl z-40 md:hidden transition-all duration-300 ease-in-out overflow-y-auto max-h-[calc(100vh-4rem)] rounded-b-2xl ${isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5 pointer-events-none"
                    }`}
            >
                <div className="p-4 space-y-2 pb-8">
                    <MobileLink to="/" icon={<Home size={18} />}>Trang chủ</MobileLink>
                    <MobileLink to="/rooms" icon={<List size={18} />}>Danh sách phòng</MobileLink>

                    <div className="border-t border-gray-100 my-3 pt-3">
                        {user ? (
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${isAdmin ? 'bg-gradient-to-br from-teal-500 to-emerald-600' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {user.fullname ? user.fullname.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">{isAdmin ? 'Quản trị viên' : 'Khách hàng'}</p>
                                        <p className="font-bold text-gray-800 truncate max-w-[200px]">{user.fullname}</p>
                                    </div>
                                </div>

                                <Link to="/profile" className="flex items-center gap-3 py-2.5 text-gray-600 hover:text-emerald-600 text-sm font-medium transition">
                                    <User size={18} /> Thông tin cá nhân
                                </Link>

                                {isAdmin ? (
                                    <Link to="/admin" className="flex items-center gap-3 py-2.5 text-gray-600 hover:text-emerald-600 text-sm font-medium transition">
                                        <LayoutDashboard size={18} /> Dashboard Quản trị
                                    </Link>
                                ) : (
                                    <Link to="/my-booking" className="flex items-center gap-3 py-2.5 text-gray-600 hover:text-emerald-600 text-sm font-medium transition">
                                        <History size={18} /> Lịch sử đặt phòng
                                    </Link>
                                )}

                                <button
                                    onClick={() => {
                                        localStorage.removeItem('token');
                                        localStorage.removeItem('user');
                                        navigate('/login');
                                    }}
                                    className="flex items-center gap-3 w-full text-left py-2.5 text-red-600 hover:text-red-700 text-sm font-medium mt-1 transition"
                                >
                                    <LogOut size={18} /> Đăng xuất
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <Link to="/login" className="flex justify-center py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition">Đăng nhập</Link>
                                <Link to="/register" className="flex justify-center py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 shadow-lg transition">Đăng ký</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;