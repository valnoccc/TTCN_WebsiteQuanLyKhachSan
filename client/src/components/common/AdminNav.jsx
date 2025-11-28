import { NavLink } from 'react-router-dom';
import { LayoutGrid, List, UserCheck, CalendarDays, BarChart3 } from 'lucide-react';

const AdminNav = () => {
    const navItems = [
        { path: '/admin', label: 'Quản lý phòng', icon: LayoutGrid, end: true },
        { path: '/admin/room-types', label: 'Loại phòng', icon: List },
        { path: '/admin/customers', label: 'Khách hàng', icon: UserCheck },
        { path: '/admin/bookings', label: 'Đặt phòng', icon: CalendarDays },
        { path: '/admin/stats', label: 'Thống kê', icon: BarChart3 },
    ];

    return (
        <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-3">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${isActive
                                    ? "bg-teal-600 text-white shadow-md shadow-teal-200 transform scale-105" // Active: Nền xanh đậm, chữ trắng, bóng đổ
                                    : "text-gray-500 hover:bg-gray-100 hover:text-teal-700" // Inactive: Nền xám khi hover
                                }`
                            }
                        >
                            <item.icon size={18} strokeWidth={2} />
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminNav;