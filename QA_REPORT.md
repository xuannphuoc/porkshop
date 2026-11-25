# Pork Shop — QA / Refactor Report (25/11/2026)

## Tổng quan

Bản rà soát dựa trên bộ mã nguồn Pork Shop đã tạo ở cuộc trò chuyện. Mục tiêu: giảm code trùng lặp, sửa các trường hợp ngoại lệ khi mua hàng, và thêm test logic độc lập.

### Kết quả kiểm tra thực hiện trong môi trường hiện tại

| Hạng mục | Kết quả | Mức xác minh |
| --- | --- | --- |
| `node scripts/validate-data.mjs` | PASS — 12 sản phẩm, ID duy nhất | Đã chạy |
| `node --experimental-strip-types --test tests/*.test.mjs` | PASS — 22/22 test | Đã chạy |
| `node scripts/check-imports.mjs` | PASS — các relative imports hợp lệ | Đã chạy |
| TypeScript/TSX syntax parse | PASS — 29 file (kiểm tra syntax bằng TS transpiler) | Đã chạy, không thay thế type-check |
| `npm install` | BLOCKED — npm registry không phản hồi | Chưa hoàn tất |
| `npm run lint` | Chưa chạy được do không cài dependencies | Chưa xác minh |
| `npm run build` | Chưa chạy được do không cài dependencies | Chưa xác minh |
| Browser / responsive / checkout end-to-end | Không thể chạy vì app chưa build được trong môi trường này | Chưa xác minh |
| GitHub push | HTTP 403 — Resource not accessible by integration | Chưa upload |

**Không coi kiểm thử logic là bằng chứng toàn bộ tính năng UI đã chạy đúng.** Sau khi có npm dependencies, chạy checklist bên dưới trên máy thật.

## Refactor đã thực hiện

- **`CartItemRow`**: gộp phần render sản phẩm và hành động xóa/sửa từ Cart Drawer và Cart Page.
- **`QuantityControl`**: dùng chung tăng/giảm khối lượng giữa trang chi tiết, Cart Drawer và Cart Page.
- **`OrderTotals`**: dùng chung bảng giá tạm tính, phí vận chuyển và tổng cộng cho Cart Drawer/Cart Page.
- **`AdminPage`**: tách `AdminOverview`, `AdminProducts`, `AdminOrders` theo từng chức năng; giữ phần chuyển tab ở component cha.
- **`productFilters.ts`**: chuyển tìm kiếm tiếng Việt không dấu, lọc danh mục, sắp xếp khỏi component UI sang hàm có thể kiểm thử.
- **`orderValidation.ts`**: tập trung quy tắc kiểm tra form checkout.
- **`shopLogic.ts`**: tập trung quy tắc bước nhảy 0,5 kg, kiểm tra tồn kho, khôi phục localStorage hợp lệ, và tính kho sau đặt hàng.
- **`ProductImage`**: thay đổi URL hình ảnh có thể tải lại sau khi URL trước đó bị lỗi.

## Bug/rủi ro đã sửa

1. Mua ngay không mở giỏ khi `addToCart()` báo lỗi.
2. Chặn kg âm/0/không chia hết cho 0,5, `NaN`, `Infinity`, hoặc lớn hơn tồn kho.
3. Chặn đặt hàng nếu sản phẩm đã bị xóa hoặc tồn kho vừa bị giảm.
4. Khôi phục cart/order/product từ `localStorage` với kiểm tra cấu trúc; fallback về JSON nếu dữ liệu sản phẩm sai.
5. JSON sản phẩm được kiểm tra cấu trúc thay vì tin `as Product[]` một cách mù quáng.
6. Trang chủ và trang chi tiết hiển thị lỗi tải dữ liệu thay vì gây hiểu lầm là không có sản phẩm.
7. Trạng thái kg của trang chi tiết được reset khi đổi `productId`.
9. Khi Admin giảm tồn kho thấp hơn giỏ hiện có, nút giảm kg đưa về số lượng hợp lệ thay vì bị kẹt.
8. Trường `stockKg` trong admin chỉ chấp nhận bội số 0,5 kg.

## Checklist cần chạy trong trình duyệt sau `npm install`

- [ ] Home: banner, danh mục, sản phẩm nổi bật và đường dẫn hoạt động.
- [ ] Product Listing: tìm kiếm không dấu, lọc danh mục, sắp xếp giá, empty state, lỗi tải JSON.
- [ ] Product Detail: ID hợp lệ và không hợp lệ, ảnh bị lỗi, thay đổi ID thì reset số lượng.
- [ ] Giỏ hàng: thêm 0,5 kg, tăng/giảm, xóa, vượt tồn kho và lưu sau refresh.
- [ ] Mua ngay: lỗi thêm hàng không bật giỏ; thành công thì mở giỏ.
- [ ] Checkout: dữ liệu hợp lệ/không hợp lệ, tạo đơn, giảm tồn kho, ghi đơn vào localStorage.
- [ ] Admin: thêm/sửa/xóa sản phẩm, kiểm tra tồn kho, đổi trạng thái đơn hàng.
- [ ] Reload trang: dữ liệu vẫn đúng; thử xóa localStorage và thử dữ liệu lỗi.
- [ ] Accessibility: keyboard focus, đóng drawer bằng Escape, label form, thông báo lỗi.
- [ ] Responsive: mobile/tablet/desktop, không tràn ngang.
- [ ] `npm run lint` và `npm run build` thành công.

## Giới hạn còn tồn tại

- Không có backend và không có xác thực Admin; toàn bộ dữ liệu đơn hàng là demo, không nhập thông tin cá nhân thật.
- Không có đồng bộ nhiều thiết bị, xử lý race condition ở server hoặc thanh toán thật.
- Trạng thái `cancelled` không tự hoàn kho (đã ghi rõ trong README); nếu cần hoàn kho phải thiết kế quy tắc nghiệp vụ.
- Ảnh bên thứ ba cần Internet, có cơ chế ảnh dự phòng.
- React component UI/E2E chưa được kiểm thử tự động vì môi trường không cài được dependencies.
