import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout'

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import HomePage from './pages/client/Homepage';
import RoomManager from './pages/admin/RoomManager';
import Profile from './pages/client/Profile';
import RoomList from './pages/client/RoomList';
import RoomDetail from './pages/client/RoomDetail';
import CustomerManager from './pages/admin/CustomerManager';
import RoomTypeManager from './pages/admin/RoomTypeManager';
import BookingManager from './pages/admin/bookingManager';
import BookingForm from './pages/client/BookingForm';
import BookingSuccess from './pages/client/BookingSuccess';
import BookingDetail from './pages/admin/BookingDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="booking-success" element={<BookingSuccess />} />

        {/* Route Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<RoomManager />} />
          <Route path="room-types" element={<RoomTypeManager />} />
          <Route path="customers" element={<CustomerManager />} />
          <Route path="bookings" element={<BookingManager />} />
          <Route path="bookings/:id" element={<BookingDetail />} />
        </Route>

        {/* Route User */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<HomePage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="rooms" element={<RoomList />} />
          <Route path="rooms/:id" element={<RoomDetail />} />
          <Route path="booking" element={<BookingForm />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;