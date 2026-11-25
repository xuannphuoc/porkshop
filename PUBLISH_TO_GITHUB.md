# Đưa Pork Shop lên GitHub

Repository hiện tại: <https://github.com/xuannphuoc/porkshop>

**Tình trạng:** Mã nguồn đã được chuẩn bị. Repository này đã được xác minh có tồn tại, nhưng thao tác tạo branch bằng GitHub Connector vẫn bị GitHub từ chối (HTTP 403: Resource not accessible by integration). Chưa có commit/branch mới nào được tạo trên GitHub bởi ChatGPT.

## Cách an toàn trên Windows

Đây là repo mới mà bạn đã xác nhận. Script chỉ tạo branch mới, không ghi đè `main`.

1. Giải nén `porkshop-github-ready-2026-11-25.zip`.
2. Mở PowerShell trong thư mục `pork-shop` vừa giải nén.
3. Kiểm tra trước nội dung file `publish-to-github.ps1`, sau đó chạy:

```powershell
powershell -ExecutionPolicy Bypass -File .\publish-to-github.ps1
```

Script sẽ:
- Clone **repository có sẵn** sang một thư mục mới bên cạnh source code đã giải nén.
- Tạo branch `feature/porkshop-qa-refactor-20261125` (không ghi đè `main`).
- Copy source code mới vào clone.
- Chạy `npm install`, `npm run validate:data`, `npm run test`, `npm run check:imports`, `npm run lint`, `npm run build`.
- Chỉ commit & push branch nếu mọi kiểm tra thành công.

Sau khi push, mở GitHub và tạo Pull Request từ branch `feature/porkshop-qa-refactor-20261125` sang `main`. Tự review và merge khi đã xác nhận website chạy đúng.

Nếu branch trên đã tồn tại, sửa tên branch trong script trước khi chạy. Cần đăng nhập GitHub qua Git Credential Manager/GitHub CLI có quyền push vào repo.

## Cách thủ công

```bash
git clone https://github.com/xuannphuoc/porkshop.git
cd porkshop
git switch -c feature/porkshop-qa-refactor-20261125
```

Copy các file từ `pork-shop/` vào thư mục `porkshop/` vừa clone (không copy `node_modules`, `dist` hay `.git`), rồi chạy:

```bash
npm install
npm run validate:data
npm run test
npm run check:imports
npm run lint
npm run build
git add .
git commit -m "refactor: test and improve Pork Shop demo"
git push -u origin feature/porkshop-qa-refactor-20261125
```

Tạo Pull Request trên GitHub sau khi push. Không dùng `git push --force` và không xóa lịch sử `main`.
