// File: client/src/layouts/UserLayout.jsx
import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const UserLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Header chung cho khách */}
            <Header />

            {/* Phần thân co giãn */}
            <main className="flex-grow container mx-auto px-4 py-8">
                <Outlet />
            </main>

            {/* Footer chung */}
            <Footer />
        </div>
    );
};

export default UserLayout;