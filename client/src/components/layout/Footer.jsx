import { Facebook, Instagram, Twitter, Youtube, ArrowRight, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-black text-white pt-20 pb-10 border-t border-slate-800 font-sans">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* CỘT 1: THƯƠNG HIỆU & SOCIAL */}
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
                            <span className="text-teal-500">Titilus</span> Luxury
                        </h2>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Nơi hội tụ những giá trị nghỉ dưỡng đỉnh cao. Chúng tôi cam kết mang đến cho bạn những trải nghiệm không thể nào quên.
                        </p>
                        {/* Social Icons */}
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-gray-400 hover:bg-teal-600 hover:text-white transition duration-300">
                                <Facebook size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-gray-400 hover:bg-teal-600 hover:text-white transition duration-300">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-gray-400 hover:bg-teal-600 hover:text-white transition duration-300">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-gray-400 hover:bg-teal-600 hover:text-white transition duration-300">
                                <Youtube size={18} />
                            </a>
                        </div>
                    </div>

                    {/* CỘT 2: KHÁM PHÁ */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-white border-b-2 border-teal-600 inline-block pb-1">Khám Phá</h3>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li><Link to="/" className="hover:text-teal-400 transition flex items-center gap-2"><span className="w-1.5 h-1.5 bg-teal-600 rounded-full"></span> Trang chủ</Link></li>
                            <li><Link to="/rooms" className="hover:text-teal-400 transition flex items-center gap-2"><span className="w-1.5 h-1.5 bg-teal-600 rounded-full"></span> Danh sách phòng</Link></li>
                            <li><Link to="/about" className="hover:text-teal-400 transition flex items-center gap-2"><span className="w-1.5 h-1.5 bg-teal-600 rounded-full"></span> Về chúng tôi</Link></li>
                            <li><Link to="/services" className="hover:text-teal-400 transition flex items-center gap-2"><span className="w-1.5 h-1.5 bg-teal-600 rounded-full"></span> Dịch vụ & Tiện ích</Link></li>
                        </ul>
                    </div>

                    {/* CỘT 3: LIÊN HỆ NHANH */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-white border-b-2 border-teal-600 inline-block pb-1">Liên Hệ</h3>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="text-teal-500 mt-0.5 shrink-0" />
                                <span>180 Cao Lỗ, Phường 4, Quận 8, TP. Hồ Chí Minh</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={18} className="text-teal-500 shrink-0" />
                                <span>+84 905 123 456</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="text-teal-500 shrink-0" />
                                <span>booking@titilus.com</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;