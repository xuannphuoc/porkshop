# Lành Meat — Pork Shop (React + TypeScript)

Demo website bán thịt heo bằng **Vite, ReactJS, TypeScript, Tailwind CSS v4, Flowbite React** và dữ liệu **JSON**. Thiết kế responsive, nội dung tiếng Việt và phù hợp để luyện một quy trình dự án Frontend thực tế.

> **LƯU Ý:** Đây là website DEMO, không phải cửa hàng thật. Giá/tồn kho/đơn hàng là dữ liệu giả lập. Không có đăng nhập bảo mật, cổng thanh toán, xử lý giao hàng hoặc backend. Không sử dụng dữ liệu cá nhân thật khi kiểm thử.

## Chức năng

- **Trang chủ:** banner giới thiệu, danh mục sản phẩm, sản phẩm nổi bật, thông tin cửa hàng.
- **Danh sách sản phẩm:** tải từ `public/data/products.json`, tìm kiếm không dấu, lọc danh mục, sắp xếp theo giá/tên/nổi bật, empty/loading/error states.
- **Chi tiết sản phẩm:** `/products/:productId`, chọn trọng lượng (bước 0,5 kg), tính tiền theo kg, kiểm tra tồn kho.
- **Giỏ hàng:** ngăn kéo nhanh, thêm/xóa/sửa số lượng, lưu trong `localStorage`, phí vận chuyển mô phỏng 25.000đ hoặc miễn phí từ 350.000đ.
- **Checkout demo:** form thông tin người nhận, kiểm tra đầu vào cơ bản, tạo mã đơn hàng, hiển thị hóa đơn mô phỏng, không gửi bất kỳ thanh toán nào.
- **Admin demo:** bảng tổng quan, quản lý sản phẩm (thêm/sửa/xóa) và cập nhật trạng thái đơn hàng. Không xác thực, không sử dụng ngoài môi trường học tập.
- **Responsive:** hỗ trợ desktop/tablet/mobile, menu điện thoại và trạng thái hiển thị khi ảnh không tải được.

## Công nghệ sử dụng

| Công nghệ | Lý do |
| --- | --- |
| Vite | Dev server nhanh và build ứng dụng. |
| React + TypeScript | Component, props, state và an toàn kiểu dữ liệu. |
| Tailwind CSS 4 | Styling responsive theo utility classes. |
| Flowbite React | Dùng `TextInput` và `Select` ở Product Listing, luyện UI component library. |
| React Router | Nested routes, route configuration dạng mảng, `Outlet`, URL params. |
| Lucide React | Bộ icon giao diện nhất quán. |
| JSON + `fetch()` | Giả lập nguồn dữ liệu API, chưa cần backend. |
| React Context + localStorage | Lưu giỏ hàng, đơn hàng và sản phẩm chỉnh sửa trong cùng trình duyệt. |

## Yêu cầu môi trường

- Node.js tương thích Vite 8 (Node 20.19+ hoặc 22.12+).
- npm.

## Chạy ứng dụng

```bash
npm install
npm run dev
```

Mở địa chỉ được Vite in trong terminal, thường là <http://localhost:5173>.

```bash
npm run validate:data  # Kiểm tra products.json
npm run test           # Unit tests logic bằng Node.js (Node 22+)
npm run check:imports  # Kiểm tra file import nội bộ
npm run lint           # ESLint
npm run build          # Kiểm tra TypeScript và build production
npm run preview        # Xem thử bản production build
```

## Các trang

| URL | Nội dung |
| --- | --- |
| `/` | Trang chủ |
| `/products` | Danh sách sản phẩm |
| `/products/P001` | Chi tiết sản phẩm theo ID |
| `/cart` | Giỏ hàng |
| `/checkout` | Thanh toán mô phỏng |
| `/order-success/:orderId` | Xác nhận đơn hàng |
| `/admin` | Quản trị demo, không có auth |

## Cấu trúc thư mục

```text
public/data/products.json
src/
  components/                  # ProductImage, CartDrawer, CartItemRow, QuantityControl, OrderTotals
  context/                     # ShopContext, ShopProvider
  features/products/
    components/ProductCard.tsx
    pages/ProductListPage.tsx
    pages/ProductDetailPage.tsx
    services/productServices.ts
    services/productFilters.ts
    types/products.ts
  pages/                       # Home, Cart, Checkout, Admin, layouts
    admin/                     # AdminOverview, AdminProducts, AdminOrders
  routes/index.tsx             # Mảng RouteConfig, renderRoutes()
  utils/format.ts              # Định dạng VND/kg, tính phí giao hàng
  utils/shopLogic.ts           # Rules cho kg, giỏ hàng, tồn kho, localStorage
  utils/orderValidation.ts     # Kiểm tra thông tin nhận hàng
scripts/validate-data.mjs
tests/                         # 22 unit tests (Node built-in test runner)
```

## Kiểm thử và refactor

Đợt review 25/11/2026: **22/22 logic tests đạt**; tách UI giỏ hàng, điều khiển kg, tổng tiền và ba màn hình Admin thành các component tái sử dụng. Nâng cấp kiểm tra dữ liệu localStorage và tồn kho. Xem báo cáo đầy đủ tại [`QA_REPORT.md`](QA_REPORT.md).

**Chú ý:** Chưa thể kiểm tra E2E và chạy `npm run build`/`npm run lint` trong môi trường tạo gói do không tải được dependencies từ npm registry. Các bước đó phải được chạy trên máy đã cài dependencies trước khi merge PR.

## Lưu trữ và giới hạn

- File JSON là dữ liệu gốc, chỉ đọc bằng GET. Thêm/sửa/xóa sản phẩm trong Admin được lưu riêng vào `localStorage` ở máy đang dùng, không ghi ngược vào JSON và không đồng bộ giữa các thiết bị.
- Giỏ hàng, đơn hàng đều lưu localStorage và chỉ hiển thị trên thiết bị/trình duyệt tạo dữ liệu. Xóa storage sẽ mất dữ liệu demo.
- Không có API/backend, không có cơ chế đăng nhập hoặc phân quyền, không có bảo vệ chống sửa dữ liệu trong DevTools.
- Không gửi email, thu tiền hay xác nhận vận chuyển thật. Phần thanh toán chuyển khoản chỉ hiển thị lựa chọn mô phỏng.
- Trạng thái tồn kho giảm khi đặt hàng trên trình duyệt; thay đổi trạng thái đơn hàng không hoàn tồn kho.
- Ảnh sản phẩm tải từ Unsplash khi có Internet; nếu không tải được sẽ hiển thị placeholder.

## Ghi nhận nguồn ảnh

Ảnh minh họa được tải từ Unsplash, sử dụng theo [Unsplash License](https://unsplash.com/license). Một số ảnh sản phẩm chỉ mang tính minh họa, có thể không trùng chính xác phần thịt được gắn nhãn. Nguồn ảnh: [Lee Milo](https://unsplash.com/photos/thinly-sliced-raw-pork-belly-with-fat-marbling-6SX9oJPXM-o), [heejin chang](https://unsplash.com/photos/sliced-meat-lot-4sb6zSB15y4), [Nick Guenov](https://unsplash.com/photos/various-cuts-of-raw-meat-displayed-at-a-butcher-shop-5tLrSdaHXlE), [Kelvin Zyteng](https://unsplash.com/photos/butcher-shop-with-raw-meat-displayed-and-worker-wFv9YHJGHi4), [tommao wang](https://unsplash.com/photos/raw-pork-belly-on-a-grill-with-garlic-V8YOTfBKP_8).

## Kiểm tra thủ công trước khi merge

1. `/products`: tìm tên sản phẩm có dấu/không dấu, đổi danh mục và sắp xếp.
2. `/products/P001`: chọn trọng lượng, thêm vào giỏ.
3. `/cart`: cộng/trừ 0,5 kg, vượt quá tồn kho được báo lỗi.
4. `/checkout`: thử số điện thoại sai, địa chỉ thiếu, sau đó đặt hàng demo hợp lệ.
5. `/order-success/:orderId`: kiểm tra đơn hàng vừa tạo và in hóa đơn.
6. `/admin`: cập nhật tồn kho, thêm sản phẩm mới, chỉnh trạng thái đơn hàng.
7. Refresh trang, dữ liệu demo trên cùng trình duyệt vẫn tồn tại.
8. Kiểm tra responsive và bàn phím, không có lỗi Console.

## Tiếp tục phát triển

Gợi ý các bước tiếp theo khi thêm backend thật: authentication/authorization, kiểm tra tồn kho ở server, transaction khi đặt đơn, lưu dữ liệu vào database, kiểm thử Vitest/React Testing Library, CI và audit accessibility.

## Đưa lên GitHub

Xem hướng dẫn an toàn trong [`PUBLISH_TO_GITHUB.md`](PUBLISH_TO_GITHUB.md). Không force-push lên nhánh `main`.


## GitHub repository đích

Dự án này được chuẩn bị để đóng góp vào [xuannphuoc/porkshop](https://github.com/xuannphuoc/porkshop) thông qua branch `feature/porkshop-qa-refactor-20261125`. Xem `PUBLISH_TO_GITHUB.md` trước khi push. GitHub Connector trong ChatGPT chưa được cấp quyền ghi nên branch chưa được tạo từ ChatGPT.
