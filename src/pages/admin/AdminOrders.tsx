import { useShop } from "../../context/ShopContext";
import type { OrderStatus } from "../../features/products/types/products";
import { formatCurrency, formatWeight } from "../../utils/format";

const statuses: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "delivered", label: "Đã giao" },
  { value: "cancelled", label: "Đã hủy" },
];

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useShop();

  function changeStatus(orderId: string, status: OrderStatus) {
    void updateOrderStatus(orderId, status);
  }

  return (
    <section className="mt-8 rounded-[20px] border border-[#e6ece6] bg-white p-5 sm:p-7">
      <h2 className="text-xl font-extrabold text-forest">Đơn hàng đã tạo</h2>
      <p className="mt-2 text-xs text-[#8b9b8d]">Thay đổi trạng thái đơn hàng để mô phỏng quy trình xử lý.</p>
      {orders.length === 0 ? (
        <p className="py-16 text-center text-sm text-[#8d9e92]">Chưa có đơn hàng nào. Hãy thử mua hàng tại website.</p>
      ) : (
        <div className="mt-6 space-y-5">
          {orders.map(function (order) {
            return (
              <article key={order.id} className="rounded-xl border border-[#e6ece6] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-extrabold text-forest">{order.id}</p>
                    <p className="mt-1 text-xs text-[#8b9a8c]">{new Date(order.createdAt).toLocaleString("vi-VN")}</p>
                    <p className="mt-2 text-xs text-[#6c8170]">{order.customer.fullName} · {order.customer.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-forest">{formatCurrency(order.total)}</p>
                  </div>
                </div>
                <div className="mt-4 border-t border-[#eef1eb] pt-4">
                  <p className="text-xs leading-7 text-[#788979]">
                    {order.items.map(function (item) {
                      return item.productName + " (" + formatWeight(item.quantityKg) + ")";
                    }).join(" · ")}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-[#9aaa9c]">{order.customer.address}, {order.customer.district}</span>
                    <select
                      aria-label={"Trạng thái đơn hàng " + order.id}
                      className="field !w-auto !py-2 text-xs"
                      value={order.status}
                      onChange={function (event) {
                        changeStatus(order.id, event.target.value as OrderStatus);
                      }}
                    >
                      {statuses.map(function (status) {
                        return <option key={status.value} value={status.value}>{status.label}</option>;
                      })}
                    </select>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
