# Milo — Mã nguồn v5 đã được chấp nhận

## Chạy trên máy

1. Giải nén toàn bộ thư mục, cài Node.js 20 trở lên nếu máy chưa có.
2. Mở Terminal/PowerShell trong thư mục chứa `package.json`.
3. Chạy `npm start` (không cần `npm install`).
4. Mở **http://localhost:8080** trong Chrome hoặc Edge, bật camera và cho phép truy cập.

Trên Windows có thể nhấp đúp `START_MILO.bat`. Giữ cửa sổ Terminal mở khi chơi.
Không mở `dist/index.html` trực tiếp bằng file:// vì module JavaScript và camera cần máy chủ web.
Muốn đổi cổng: PowerShell chạy `$env:PORT=8090; npm start`.
Khi đưa lên hosting, dùng HTTPS và phục vụ toàn bộ thư mục `dist/`.

## Các tương tác

- Bế pet / lấy bánh / lấy bóng: chụm ngón cái và trỏ; mở tay để thả.
- Xoa đầu: mở tay và vuốt trên đầu pet.
- Ngồi / đứng: hạ / nâng một bàn tay mở.
- Xoay: ngón trỏ vẽ một vòng tròn.
- Chỉ đường: hướng từ khớp giữa đến đầu ngón trỏ tạo tia và vòng đích; giữ đích trên sàn 1,1 giây.
- Ngủ: nắm tay trên đệm 1,2 giây; Milo tới đệm rồi ngủ và hồi 1% năng lượng/giây, tối đa 100%.
- Khen: giơ ngón cái; Milo nhảy vui.
- Hai tay: giơ cả hai vào nửa trên khung camera để bắt đầu; sau đó nâng/hạ từng tay, Milo làm theo. Vẫy hai tay để chào.
- Chuột và các nút thao tác vẫn dùng được khi chưa bật camera.

## Mã nguồn

| Tệp | Vai trò |
|---|---|
| `dist/app.js` | Cảnh 3D, pet, hành vi, camera và điều phối tương tác |
| `dist/hand-input.js` | Đặc trưng bàn tay, chụm ngón, hướng chỉ, nâng/hạ và vẫy hai tay |
| `dist/gestures.js` | Nhận lệnh theo chuyển động, thời gian giữ và ưu tiên |
| `dist/pet-care.js` | Hồi năng lượng khi ngủ |
| `dist/fallback.js` | Đồ họa Canvas khi WebGL không khả dụng |
| `dist/index.html`, `dist/style.css` | Giao diện và hướng dẫn |
| `dist/vendor/` | Three.js, MediaPipe, WASM và model nhận diện tay |
| `tests/` | Kiểm tra mô phỏng cử chỉ và logic chăm sóc |
| `server.mjs` | Máy chủ local không cần thư viện ngoài |

Chạy kiểm tra: `npm test`.
Đây là JavaScript module thuần; `dist/` cũng chính là mã nguồn có thể sửa trực tiếp, không cần build.
Pet được dựng bằng hình học trong mã, không có model GLB riêng. Dữ liệu chăm sóc lưu trong localStorage.
Camera được xử lý trên thiết bị; không cần API key. Font Google là tùy chọn, mất mạng sẽ dùng font hệ thống.
Mã bên thứ ba thuộc giấy phép của các dự án tương ứng; xem DEVELOPER_NOTES.md và phần header của thư viện.

Đã kiểm tra mô phỏng; độ nhạy webcam và WebGL thực tế phụ thuộc thiết bị.
