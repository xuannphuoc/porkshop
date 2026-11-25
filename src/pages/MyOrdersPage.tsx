import { Link } from "react-router";
import { useShop } from "../context/ShopContext";
import { formatCurrency } from "../utils/format";

export default function MyOrdersPage() {
  const { orders } = useShop();
  return (
    <main className="container-wide min-h-[500px] py-14">
      <p className="eyebrow">TÀI KHOẢN</p>
      <h1 className="section-title mt-3">Đơn hàng của tôi</h1>
      <p className="mt-3 text-sm text-[#819185]">Chỉ hiển thị các đơn hàng thuộc tài khoản của bạn.</p>
      {orders.length === 0 && <p className="mt-10 rounded-xl bg-white p-6">Bạn chưa có đơn hàng nào. <Link className="font-bold text-forest underline" to="/products">Xem sản phẩm</Link></p>}
      <div className="mt-8 grid gap-4">
        {orders.map(function (order) {
          return (
            <article key={order.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#e1e9df] bg-white p-6">
              <div><p className="font-extrabold text-forest">{order.id}</p><p className="mt-2 text-xs text-[#809286]">{new Date(order.createdAt).toLocaleString("vi-VN")}</p><p className="mt-2 text-sm">{order.items.length} mặt hàng · {formatCurrency(order.total)}</p></div>
              <Link className="btn-outline" to={"/order-success/" + order.id}>Xem và in đơn</Link>
            </article>
          );
        })}
      </div>
    </main>
  );
}
