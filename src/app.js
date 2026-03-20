const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const inventoryRoutes = require('./routes/inventoryRoutes');

// Khởi tạo biến môi trường
dotenv.config();

// Kết nối Database
connectDB();

const app = express();

// Middleware xử lý JSON body
app.use(express.json());

// Sử dụng Routes
app.use('/api', inventoryRoutes);

// Xử lý Route không tồn tại (404)
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Đường dẫn API không tồn tại' });
});

// Khởi chạy server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});