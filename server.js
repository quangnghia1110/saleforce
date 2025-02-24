const express = require('express');
const path = require('path');
const app = express();

// Phục vụ các file tĩnh từ thư mục hiện tại
app.use(express.static(__dirname));

// Route mặc định trả về index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Lấy port từ biến môi trường hoặc sử dụng port 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 