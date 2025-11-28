import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Hàm style cho link: Nếu đang Active thì màu xanh, không thì màu xám
    const getLinkClass = ({ isActive }) =>
        `block py-2.5 px-4 rounded transition duration-200 ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
        }`;

    return (
        <div className="bg-gray-900 w-64 min-h-screen flex flex-col text-white transition-all duration-300">
            {/* Logo / Brand */}
            <div className="h-16 flex items-center justify-center border-b border-gray-800">
                <h1 className="text-xl font-bold uppercase tracking-wider">Admin Panel</h1>
            </div>

            {/* Menu Links */}
            <nav className="flex-1 px-2 py-4 space-y-2">
                <NavLink to="/admin" end className={getLinkClass}>
                    📊 Dashboard
                </NavLink>

                <NavLink to="/admin/rooms" className={getLinkClass}>
                    hotel Phòng & Loại Phòng
                </NavLink>

                <NavLink to="/admin/bookings" className={getLinkClass}>
                    📅 Quản lý Đặt Phòng
                </NavLink>

                <NavLink to="/admin/users" className={getLinkClass}>
                    👥 Quản lý Người dùng
                </NavLink>
            </nav>

            {/* User Info & Logout */}
            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
                        {user?.fullname?.charAt(0) || 'A'}
                    </div>
                    <span className="text-sm font-medium">{user?.fullname}</span>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm transition"
                >
                    Đăng Xuất
                </button>
            </div>
        </div>
    );
};

export default Sidebar;