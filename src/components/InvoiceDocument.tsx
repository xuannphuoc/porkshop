import type { Order } from "../features/products/types/products";
import { formatCurrency, formatWeight } from "../utils/format";

interface InvoiceDocumentProps { order: Order; }

export default function InvoiceDocument({ order }: InvoiceDocumentProps) {
  return (
    <section className="invoice-document rounded-2xl border border-[#e0e8df] bg-white p-6 text-left sm:p-9" aria-label="Hóa đơn XT Meat">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#dce6dd] pb-6">
        <div>
          <p className="text-2xl font-black tracking-tight text-forest">XT Meat</p>
          <p className="mt-1 text-xs text-[#778b7d]">Cửa hàng thịt heo tươi · Website demo</p>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-extrabold text-forest">PHIẾU XÁC NHẬN ĐƠN HÀNG</h2>
          <p className="mt-2 text-sm font-bold text-forest">#{order.id}</p>
          <p className="mt-1 text-xs text-[#75877a]">Ngày tạo: {new Date(order.createdAt).toLocaleString("vi-VN")}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#879b8c]">Thông tin người nhận</p>
          <p className="mt-2 font-bold text-forest">{order.customer.fullName}</p>
          <p className="mt-1">{order.customer.phone}</p>
          {order.customer.email !== "" && <p className="mt-1">{order.customer.email}</p>}
          <p className="mt-1">{order.customer.address}, {order.customer.district}</p>
        </div>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#879b8c]">Thanh toán</p>
          <p className="mt-2">{order.customer.paymentMethod === "cod" ? "Thanh toán khi nhận hàng (COD)" : "Chuyển khoản (mô phỏng)"}</p>
          <p className="mt-1">Trạng thái: {order.status === "pending" ? "Chờ xác nhận" : order.status === "confirmed" ? "Đã xác nhận" : order.status === "delivered" ? "Đã giao" : "Đã hủy"}</p>
        </div>
      </div>
      <table className="mt-7 w-full border-collapse text-left text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-[#dce6dd] text-[#57705e]">
            <th scope="col" className="py-3 pr-3">Sản phẩm</th>
            <th scope="col" className="py-3 text-right">Khối lượng</th>
            <th scope="col" className="py-3 text-right">Giá/kg</th>
            <th scope="col" className="py-3 text-right">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map(function (item) {
            return (
              <tr key={item.productId} className="border-b border-[#eaf0ea]">
                <td className="py-3 pr-3 font-semibold">{item.productName}</td>
                <td className="py-3 text-right">{formatWeight(item.quantityKg)}</td>
                <td className="py-3 text-right">{formatCurrency(item.pricePerKg)}</td>
                <td className="py-3 text-right font-semibold">{formatCurrency(item.pricePerKg * item.quantityKg)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="ml-auto mt-6 max-w-xs space-y-3 text-sm">
        <div className="flex justify-between gap-4"><span>Tạm tính</span><span>{formatCurrency(order.subtotal)}</span></div>
        <div className="flex justify-between gap-4"><span>Vận chuyển</span><span>{order.shipping === 0 ? "Miễn phí" : formatCurrency(order.shipping)}</span></div>
        <div className="flex justify-between gap-4 border-t border-[#dce6dd] pt-3 text-lg font-extrabold text-forest"><span>Tổng cộng</span><span>{formatCurrency(order.total)}</span></div>
      </div>
      {order.customer.note && <p className="mt-6 text-xs text-[#6a806f]">Ghi chú: {order.customer.note}</p>}
      <p className="mt-9 border-t border-dashed border-[#dce6dd] pt-4 text-xs leading-6 text-[#839689]">XT Meat — Phiếu xác nhận cho mục đích demo, không phải hóa đơn thuế. Không phát sinh thanh toán hoặc giao hàng thực tế.</p>
    </section>
  );
}
