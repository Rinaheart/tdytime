# Architecture Overview — TdyTime

TdyTime được thiết kế với triết lý **"Performance as a Feature"**. Kiến trúc tập trung vào trải nghiệm người dùng tức thì, khả năng hoạt động ngoại tuyến mạnh mẽ và tối ưu hóa tài nguyên phần cứng.

---

## 🚀 PWA & Service Worker (Offline-First)

TdyTime áp dụng chiến lược **Offline-First** thực thụ giúp ứng dụng hoạt động như một App Native.

### 1. Chiến lược CacheFirst cho Navigation
- **Cơ chế:** Thay vì sử dụng `NetworkFirst` (gây trễ khi chờ mạng), TdyTime sử dụng `CacheFirst` cho yêu cầu điều hướng (`index.html`).
- **Lợi ích:** Mở app gần như tức thì (~100ms) từ lần thứ 2 trở đi. Shell của ứng dụng luôn sẵn sàng trong Service Worker cache.
- **Dự phòng (Fallback):** Nếu không có trong cache (lần đầu), nó sẽ được tải từ mạng và tự động lưu vào precache.

### 2. Vòng đời cập nhật (Update Lifecycle)
- **Background Check:** Service Worker tự động kiểm tra phiên bản mới trong nền khi người dùng mở app.
- **SkipWaiting (User-controlled):** TdyTime **không** tự động reload trang khi có bản mới để tránh làm mất dữ liệu người dùng.
- **PWA Update Handler:** Một thông báo (Toast) sẽ hiện ra khi có bản mới. Chỉ khi người dùng nhấn "Cập nhật", Service Worker mới kích hoạt `SKIP_WAITING` và chuyển sang phiên bản mới.

---

## 📦 Chiến lược Bundle & Caching

Quy trình Build của TdyTime được tối ưu hóa để tận dụng tối đa HTTP/2 và cơ chế bộ nhớ đệm của trình duyệt.

### 1. Phân mảnh Bundle (Granular Splitting)
Sử dụng `vite.config.ts` với `manualChunks` để chia nhỏ mã nguồn thành các module độc lập:
- **`vendor-react`**: Chứa React Core (React, ReactDOM, Scheduler). File này ít thay đổi, giúp lưu cache lâu dài.
- **`vendor-i18n`**: Cô lập các file ngôn ngữ và thư viện dịch thuật.
- **`vendor-router`**: Chứa logic định tuyến.
- **`vendor-monitoring`**: Các thư viện giám sát (Analytics) được tách riêng để có thể trì hoãn tải.

### 2. Module Preloading
Vite tự động inject `<link rel="modulepreload">` cho các chunk thiết yếu. Điều này giúp trình duyệt bắt đầu tải các module phụ ngay khi đang parse module chính, loại bỏ hiện tượng waterfall (tải tuần tự).

### 3. Immortal Assets (Vercel)
Cấu hình `vercel.json` áp dụng chính sách `Cache-Control: immutable` cho các file assets có hash trong tên. Một khi đã tải, trình duyệt sẽ không bao giờ yêu cầu lại file đó cho đến khi có phiên bản mới với hash mới.

---

## ⚡ Tối ưu hóa đường dẫn tới hạn (Critical Path)

### 1. Critical CSS Inline
Các CSS nền tảng (Box-sizing, Font-family, Dark-mode shell) được nhúng trực tiếp (inline) vào `index.html`. Điều này giúp khung xương của app hiển thị ngay khi HTML vừa tải xong, trước khi file CSS lớn (`index.css`) được nạp.

### 2. Async Font Loading
Google Fonts được tải thông qua pattern `preload` + `onload`. 
- **Trước:** Trình duyệt dừng render để tải font (Render-blocking).
- **Sau:** App hiển thị bằng font hệ thống trước, sau đó hoán đổi (swap) sang Google Fonts khi quá trình tải hoàn tất, giúp FCP nhanh hơn 30-50%.

### 3. Deferred Monitoring Scripts
Các script nặng như `@vercel/analytics` và `@vercel/speed-insights` được trì hoãn tải thông qua `requestIdleCallback`. Chúng chỉ được thực thi khi trình duyệt ở trạng thái rảnh rỗi, đảm bảo không tranh chấp tài nguyên với luồng render chính của người dùng.
