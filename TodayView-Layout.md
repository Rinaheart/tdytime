# TodayView Layout Specification (v0.7.0)

Tài liệu này mô tả cấu trúc layout của component `TodayView` thông qua các wireframe ASCII cho 5 kịch bản hiển thị chính.

## 1. Cấu trúc Header Chung (Sticky)
Mọi trạng thái đều dùng chung Header phong cách Apple v2.

```text
+-------------------------------------------------------------+
| [Thứ] (ví dụ: THỨ 2)                          [HH:mm]       |
| [DD]/[MM]                                     (08:30)       |
| [YYYY] (ví dụ: 2026)                                        |
+-------------------------------------------------------------+
| (Dòng kẻ mờ ngăn cách)                                      |
+-------------------------------------------------------------+
```

---

## 2. Các kịch bản hiển thị (Scenarios)

### S1: HAS_SESSIONS (Có buổi giảng hôm nay)
Ưu tiên hiển thị danh sách các buổi giảng sắp xếp theo trạng thái: **ĐANG DẠY > CHƯA DẠY > HOÀN THÀNH**.

```text
[HEADER]

Chào buổi sáng, [Tên GV].
[ Hôm nay có X buổi giảng (Y tiết). ]

+-------------------------------------------------------------+
| [Giờ Bắt đầu] | [Tên Môn Học]           [Loại] | [Phòng]    |
| [Giờ Kết thúc]| [Lớp] · ([Nhóm])               | [Phòng]    |
|               | Tiết [X-Y] | [ĐANG GIẢNG DẠY]  |            |
+-------------------------------------------------------------+
| [Giờ Bắt đầu] | [Tên Môn Học]           [Loại] | [Phòng]    |
| [Giờ Kết thúc]| [Lớp] · ([Nhóm])               | [Phòng]    |
|               | Tiết [X-Y] | [CHƯA ĐẾN GIỜ]    |            |
+-------------------------------------------------------------+

(Line Separator)
> LỊCH GIẢNG TIẾP THEO
+-------------------------------------------------------------+
| [Thứ], [DD/MM/YYYY]                  [N Buổi]               |
| [Tên môn học...]                                            |
| [Giờ] [Lớp] ([Nhóm]) · [Phòng]                            > |
+-------------------------------------------------------------+
```

### S2: NO_SESSIONS (Học kỳ đang diễn ra nhưng trống lịch hôm nay)
Hiển thị trạng thái nghỉ ngơi và gợi ý lịch dạy tiếp theo.

```text
[HEADER]

Chào buổi chiều, [Tên GV].

      ( Icon Coffee )
      Hôm nay không có buổi giảng nào.
      [ Lịch tuần ]   [ Học kỳ ]

+-------------------------------------------------------------+
| > LỊCH GIẢNG TIẾP THEO                                      |
| [Thứ], [DD/MM/YYYY] --- [N Buổi giảng]                      |
+-------------------------------------------------------------+
| [Tên môn học 1]                                             |
| [Giờ]  [Lớp] ([Nhóm]) · [Phòng]                             |
+-------------------------------------------------------------+
| [Tên môn học 2]                                             |
| [Giờ]  [Lớp] ([Nhóm]) · [Phòng]                             |
+-------------------------------------------------------------+
| [        XEM CHI TIẾT >        ]                            |
+-------------------------------------------------------------+
```

### S3: BEFORE_SEMESTER (Trước ngày bắt đầu học kỳ)
Thông báo ngày khai giảng và hiển thị lịch dạy đầu tiên của học kỳ.

```text
[HEADER]

Chào buổi sáng, [Tên GV].

      Học kỳ chưa bắt đầu!
      Học kỳ sẽ bắt đầu từ ngày [DD/MM/YYYY].

+-------------------------------------------------------------+
| > LỊCH GIẢNG ĐẦU KỲ                                         |
| [Thứ], [DD/MM/YYYY] --- [N Buổi giảng]                      |
+-------------------------------------------------------------+
| [Tên môn học 1]                                             |
| [Giờ]  [Lớp] ([Nhóm]) · [Phòng]                             |
+-------------------------------------------------------------+
| [        XEM CHI TIẾT >        ]                            |
+-------------------------------------------------------------+
```

### S4: AFTER_SEMESTER (Sau ngày kết thúc học kỳ)

```text
[HEADER]

Chào buổi tối, [Tên GV].

      Học kỳ đã kết thúc!
      Ngày kết thúc học kỳ: [DD/MM/YYYY].
```

### S5: NO_DATA (Chưa nạp tệp lịch)

```text
[HEADER]

      Chưa có dữ liệu lịch giảng.
      Vui lòng tải lên lịch giảng học kỳ để xem chi tiết.
```

---

## 3. Quy chuẩn UI Components

### Session Card (Mobile Optimized)
- **Cột Trái (72px):** Giờ bắt đầu/kết thúc (Font size lớn/đậm).
- **Cột Giữa (Flex-1):** Tên môn, Lớp/Nhóm, Badge loại hình (LT/TH), Trạng thái giảng dạy.
- **Cột Phải (60px):** Số phòng (Nền xám nhạt/bo góc).

### Next Teaching Section
- **Compact (Trong S1):** Dạng thẻ đơn giản, click để nhảy sang tab Tuần.
- **Full (Trong S2, S3):** Hiển thị danh sách tất cả các buổi trong ngày đó kèm nút bấm "Xem chi tiết".
