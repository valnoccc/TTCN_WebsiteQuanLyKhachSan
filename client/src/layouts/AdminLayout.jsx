import { useState, useRef, useEffect } from 'react';
import { Outlet, Navigate, useNavigate, Link } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import ProfileDropdown from '../components/common/ProfileDropdown';
import AdminNav from '../components/common/AdminNav';

const AdminLayout = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'Admin') return <Navigate to="/homepage" replace />;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-gray-900">

            {/* HEADER (Giữ nguyên) */}
            <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
                <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div>
                            <h1 className="text-lg font-bold text-gray-800 leading-tight hidden sm:block">Xin chào, <span className="text-teal-600">{user.fullname}</span></h1>
                        </div>
                    </div>
                    <ProfileDropdown />
                </div>
            </header>

            {/* --- 2. THÊM NAV MENU VÀO ĐÂY --- */}
            <AdminNav />

            {/* MAIN CONTENT */}
            <main className="container mx-auto px-4 sm:px-6 pb-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;