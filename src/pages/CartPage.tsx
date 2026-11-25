import { ArrowRight, ShoppingBag, Truck } from "lucide-react";
import { Link } from "react-router";
import { useShop } from "../context/ShopContext";
import CartItemRow from "../components/CartItemRow";
import OrderTotals from "../components/OrderTotals";

export default function CartPage() {
  const { cartDetails, subtotal, shipping } = useShop();

  if (cartDetails.length === 0) {
    return (
      <main className="container-wide flex min-h-[500px] flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-[#edf5eb] p-8 text-forest"><ShoppingBag size={43} /></div>
        <h1 className="mt-6 text-3xl font-extrabold text-forest">Giỏ hàng đang trống</h1>
        <p className="mt-3 text-sm text-[#829488]">Chọn những phần thịt tươi ngon trước khi đặt hàng nhé.</p>
        <Link className="btn-main mt-7" to="/products">Tiếp tục mua sắm <ArrowRight size={18} /></Link>
      </main>
    );
  }

  return (
    <main className="container-wide py-12">
      <p className="eyebrow">GIỎ HÀNG CỦA BẠN</p>
      <h1 className="section-title mt-3">Chuẩn bị bữa ăn ngon</h1>
      <p className="mt-3 text-sm text-[#829488]">Kiểm tra sản phẩm và khối lượng trước khi thanh toán.</p>
      <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_350px]">
        <div className="overflow-hidden rounded-[20px] border border-[#e6ece6] bg-white">
          <div className="border-b border-[#e9eee8] px-6 py-5 text-sm font-extrabold text-forest">Sản phẩm ({cartDetails.length})</div>
          {cartDetails.map(function (item) {
            return <CartItemRow key={item.product.id} item={item} />;
          })}
        </div>
        <aside className="rounded-[20px] border border-[#e6ece6] bg-white p-6 soft-shadow">
          <h2 className="mb-6 text-xl font-extrabold text-forest">Tóm tắt đơn hàng</h2>
          <OrderTotals subtotal={subtotal} shipping={shipping} />
          <p className="mt-5 flex items-center gap-2 rounded-xl bg-[#f0f6ee] p-4 text-xs font-bold text-forest">
            <Truck size={18} />
            {shipping === 0 ? "Bạn đã được miễn phí giao hàng!" : "Đơn từ 350.000đ được miễn phí vận chuyển"}
          </p>
          <Link to="/checkout" className="btn-main mt-6 w-full">Tiếp tục thanh toán <ArrowRight size={18} /></Link>
          <Link to="/products" className="mt-4 block text-center text-xs font-bold text-[#718674] hover:underline">← Tiếp tục mua sắm</Link>
        </aside>
      </div>
    </main>
  );
}
