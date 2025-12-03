# HƯỚNG DẪN PHÁT TRIỂN & TRẢ LỜI CÂU HỎI ĐỒ ÁN
> **Dành cho người mới bắt đầu - "Code như chơi Lego"**

Chào bạn! Đừng lo lắng nếu bạn chưa rành về React hay Vite. Tài liệu này được viết riêng để giúp bạn hiểu, chỉnh sửa và tự tin trình bày đồ án này.

---

## 1. Hiểu Về Dự Án (Giải thích đơn giản)

Hãy tưởng tượng dự án này như một **Nhà Hàng**:

1.  **Frontend (Giao diện - React)**: Là **Khu vực bàn ăn & Menu**.
    *   Khách hàng (User) nhìn thấy và tương tác ở đây.
    *   Được xây bằng **React** (giống như các khối Lego để lắp ghép giao diện).
    *   Chạy bằng **Vite** (giống như một chiếc xe đua F1 giúp vận chuyển món ăn cực nhanh).

2.  **Backend (Xử lý - Node.js)**: Là **Nhà Bếp**.
    *   Nhận order từ Frontend.
    *   Chế biến món ăn (tính toán lịch trình, hỏi AI).
    *   Trả món ăn (kết quả) lại cho Frontend.

3.  **Database (Dữ liệu - Prisma)**: Là **Kho Nguyên Liệu**.
    *   Lưu trữ thông tin địa điểm, tài khoản admin, lịch sử chat.

---

## 2. Cấu Trúc Thư Mục (Cần nhớ gì?)

Bạn chỉ cần quan tâm 2 thư mục chính:

*   📂 **Frontend/src/**: Nơi chứa code giao diện.
    *   `pages/`: Các trang chính (Trang chủ, Lịch trình, Chat).
    *   `features/`: Các tính năng nhỏ (Form, Bản đồ, Chatbot).
    *   `components/`: Các khối Lego dùng chung (Header, Footer).
*   📂 **Backend/src/**: Nơi chứa code xử lý.
    *   `services/`: Nơi chứa logic thông minh (AI, thuật toán).

---

## 3. "Bí Kíp" Chỉnh Sửa Nhanh (Recipes)

### 🟢 Muốn thay đổi chữ trên web?
Ví dụ: Đổi "Lập Kế Hoạch" thành "Bắt Đầu Ngay".

1.  Dùng tính năng **Search** trong VS Code (Ctrl + Shift + F).
2.  Gõ từ khóa "Lập Kế Hoạch".
3.  Nó sẽ chỉ ra file nào chứa chữ đó (thường là trong `Frontend/src/...`).
4.  Sửa lại và lưu (Ctrl + S). Web sẽ tự cập nhật ngay lập tức!

### 🟢 Muốn đổi màu sắc?
Dự án dùng **Tailwind CSS** (viết tắt màu ngay trong class).

*   Tìm đoạn code có `className="..."`.
*   Thấy `bg-blue-500` (nền xanh mức 500)?
*   Đổi thành `bg-red-500` (đỏ), `bg-green-500` (xanh lá), `bg-yellow-500` (vàng).
*   Thấy `text-white` (chữ trắng)? Đổi thành `text-black` (chữ đen).

### 🟢 Muốn thêm một nút mới trên Menu?
Giả sử giáo viên hỏi: *"Em thêm cho thầy nút 'Liên Hệ' vào menu xem nào?"*

1.  Mở file: `Frontend/src/components/Header.jsx`.
2.  Tìm đoạn code chứa các `Link` (Trang chủ, Lịch trình...).
3.  Copy một dòng `Link` có sẵn và sửa lại:
    ```jsx
    <Link to="/contact" className="text-gray-600 hover:text-blue-600 font-medium">
      Liên Hệ
    </Link>
    ```
4.  Lưu file. Nút mới sẽ hiện ra ngay lập tức!

### 🟢 Muốn thay đổi câu chào của Chatbot?
1.  Mở file: `Backend/src/services/chatbot.service.js`.
2.  Tìm dòng chứa câu chào mặc định (thường ở đầu hoặc trong hàm xử lý).
3.  Sửa lại thành: *"Xin chào! Mình là trợ lý du lịch Đà Nẵng siêu cấp đây!"*
4.  Lưu file. Chatbot sẽ đổi giọng ngay.

---

## 4. Câu Hỏi Giáo Viên Thường Hỏi & Cách Trả Lời

**Q: Tại sao dùng React và Vite?**
**A:**
*   **React**: Giúp chia nhỏ giao diện thành các component (như Header, Footer) để dễ quản lý và tái sử dụng. Nó cũng giúp web mượt mà như app điện thoại (SPA - Single Page Application).
*   **Vite**: Là công cụ build thế hệ mới, giúp khởi động dự án cực nhanh, tiết kiệm thời gian code.

**Q: Thuật toán gợi ý lịch trình hoạt động thế nào?**
**A:** Dạ, tụi em dùng kết hợp 2 bước ạ:
1.  **Lọc & Chọn (Greedy)**: Đầu tiên lọc các địa điểm theo sở thích và ngân sách của khách.
2.  **Sắp xếp (TSP - Bài toán người du lịch)**: Sau khi chọn được địa điểm, thuật toán sẽ sắp xếp thứ tự đi sao cho quãng đường di chuyển là ngắn nhất (Dùng giải thuật Nearest Neighbor - Điểm gần nhất).

**Q: Chatbot của em có học được không?**
**A:** Dạ hiện tại nó dùng kỹ thuật **RAG (Retrieval-Augmented Generation)**.
*   Nó không "tự học" theo kiểu training model lớn (tốn kém).
*   Thay vào đó, nó "tra cứu" trong cơ sở dữ liệu (Knowledge Base) mà tụi em cung cấp.
*   Nếu tìm thấy thông tin, nó sẽ trả lời chính xác. Nếu không, nó sẽ dùng trí thông minh của Google Gemini để trả lời dựa trên ngữ cảnh.
*   Em có thể dạy nó thêm bằng cách thêm dữ liệu vào Knowledge Base ạ.

**Q: Làm sao để triển khai (deploy) lên mạng?**
**A:**
*   Frontend em sẽ build ra file tĩnh (`npm run build`) và đưa lên host (như Vercel/Netlify).
*   Backend em chạy trên server Node.js (dùng PM2 để quản lý).
*   Database em sẽ dùng PostgreSQL trên cloud (như Supabase/Neon).

---

## 5. Phân Tích Sâu & Quy Trình Dữ Liệu (Dành cho câu hỏi khó)

Phần này giúp bạn trả lời những câu hỏi "xoáy" về hệ thống.

### 5.1 Giải Thích Thuật Toán (Có ví dụ giải tay)

Giáo viên có thể hỏi: *"Em hãy chạy tay thuật toán gợi ý lịch trình xem nào?"*

**Bài toán:** Bạn có 500k, muốn đi chơi từ 8h-12h.
**Danh sách địa điểm:**
*   A: Vé 100k, chơi 1h (Điểm ưu tiên: 10)
*   B: Vé 300k, chơi 2h (Điểm ưu tiên: 8)
*   C: Vé 50k, chơi 1h (Điểm ưu tiên: 9)

**Bước 1: Lọc & Chọn (Greedy Algorithm - Tham lam)**
*   *Nguyên lý:* Chọn cái tốt nhất, rẻ nhất trước cho đến khi hết tiền/thời gian.
*   *Chạy tay:*
    1.  Xếp theo điểm ưu tiên/giá: C (Rẻ, điểm cao) -> A -> B.
    2.  Chọn C: Tốn 50k, còn 450k. Thời gian còn 3h.
    3.  Chọn A: Tốn 100k, còn 350k. Thời gian còn 2h.
    4.  Chọn B: Tốn 300k, còn 50k. Thời gian còn 0h.
    -> **Kết quả chọn:** A, B, C.

**Bước 2: Sắp xếp lộ trình (TSP - Nearest Neighbor)**
*   *Nguyên lý:* Đứng ở đâu thì đi đến điểm gần nhất tiếp theo.
*   *Giả sử khoảng cách:*
    *   Khách sạn -> A: 2km
    *   Khách sạn -> B: 5km
    *   Khách sạn -> C: 10km
    *   A -> B: 1km
*   *Chạy tay:*
    1.  Đang ở Khách sạn. Điểm gần nhất là A (2km). -> **Đi A trước**.
    2.  Đang ở A. Điểm chưa đi còn lại là B, C.
    3.  A -> B (1km), A -> C (8km). -> **Đi B tiếp theo**.
    4.  Cuối cùng đi C.
    -> **Lộ trình tối ưu:** Khách sạn -> A -> B -> C.

### 5.2 Luồng Dữ Liệu (Data Flow) - Từ Database ra Màn hình

Giáo viên hỏi: *"Khi bấm nút 'Tìm kiếm', dữ liệu chạy như thế nào?"*

Hãy vẽ sơ đồ này trong đầu hoặc trên bảng:

1.  **Frontend (React)**: Người dùng bấm nút -> Gửi gói tin `JSON` (ngày, tiền, sở thích) qua mạng.
    *   `POST /api/itinerary/generate`
2.  **Backend (Controller)**: Nhận gói tin -> Kiểm tra xem có thiếu ngày tháng không (Validate).
3.  **Backend (Service)**:
    *   Gọi `Prisma` để lấy tất cả địa điểm từ Database (`SELECT * FROM Location`).
    *   Chạy thuật toán (như bước 5.1) để tạo ra danh sách `days`.
4.  **Backend (Response)**: Đóng gói kết quả `days` thành JSON -> Gửi trả lại.
5.  **Frontend**: Nhận JSON -> Lưu vào `LocalStorage` -> Vẽ lên bản đồ.

---

## 6. Hướng Dẫn Thêm Tính Năng Lớn (Full-Stack)

Giả sử bạn muốn thêm tính năng: **"Đánh giá địa điểm (Review)"**. Đây là quy trình chuẩn:

**Bước 1: Sửa Database (Backend/prisma/schema.prisma)**
Thêm bảng `Review` liên kết với `Location`:
```prisma
model Review {
  id        String   @id @default(uuid())
  content   String
  rating    Int
  location  Location @relation(fields: [locationId], references: [id])
  locationId String
}
```
Sau đó chạy lệnh: `npx prisma migrate dev --name add_review`

**Bước 2: Tạo API (Backend)**
*   Tạo file `routes/review.routes.js`: Định nghĩa đường dẫn `POST /api/reviews`.
*   Tạo file `controllers/review.controller.js`: Nhận dữ liệu từ Frontend.
*   Tạo file `services/review.service.js`: Gọi `prisma.review.create(...)` để lưu vào DB.

**Bước 3: Làm Giao Diện (Frontend)**
*   Tạo component `ReviewForm.jsx`: Có ô nhập text và chọn sao.
*   Khi bấm nút "Gửi", gọi hàm `fetch('/api/reviews', ...)` để gửi về Backend.

---

## 7. Các Lệnh Cần Nhớ

*   **Chạy dự án**:
    *   Backend: `npm run dev` (Cổng 3000)
    *   Frontend: `npm run dev` (Cổng 5173)

*   **Cài thư viện mới**: `npm install <tên-thư-viện>`

---

**Lời khuyên cuối cùng:**
Hãy tự tin! Bạn đã có một sản phẩm chạy tốt. Giáo viên đánh giá cao sự hiểu biết về **luồng đi của dữ liệu** (Data Flow) hơn là việc bạn nhớ từng dòng code. Hãy dùng file `ARCHITECTURE.md` để minh họa khi trả lời.

Chúc bạn bảo vệ đồ án thành công! 🚀
