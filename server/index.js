// server/index.js
const express = require('express');
const cors = require('cors');
const db = require('./config/db');

// --- QUAN TRỌNG: Import route ---
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const roomTypeRoutes = require('./routes/roomTypeRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- QUAN TRỌNG: Đăng ký route ---
// Dòng này nghĩa là: Ghép "/api/auth" vào trước các đường dẫn trong authRoutes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/room-types', roomTypeRoutes);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Backend đang chạy tại cổng ${PORT}...`);
});