import { ArrowRight, ShoppingBag, X } from "lucide-react";
import { Link } from "react-router";
import { useEffect } from "react";
import { useShop } from "../context/ShopContext";
import CartItemRow from "./CartItemRow";
import OrderTotals from "./OrderTotals";

export default function CartDrawer() {
  const { cartOpen, setCartOpen, cartDetails, subtotal, shipping } = useShop();

  useEffect(function () {
    if (cartOpen === false) {
      return;
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setCartOpen(false);
      }
    }
    window.addEventListener("keydown", handleEscape);
    return function () {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [cartOpen, setCartOpen]);

  if (cartOpen === false) {
    return null;
  }

  function closeCart() {
    setCartOpen(false);
  }

  return (
    <div className="fixed inset-0 z-[80] flex justify-end" role="dialog" aria-modal="true" aria-label="Giỏ hàng">
      <button className="absolute inset-0 bg-[#122f25]/50" type="button" aria-label="Đóng giỏ hàng" onClick={closeCart} />
      <aside className="relative flex h-full w-full max-w-[460px] flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#ebeee9] px-6 py-6">
          <div>
            <p className="eyebrow">GIỎ HÀNG CỦA BẠN</p>
            <h2 className="mt-1 text-2xl font-extrabold text-forest">Món ngon đã chọn</h2>
          </div>
          <button type="button" aria-label="Đóng giỏ hàng" onClick={closeCart} className="rounded-full border border-[#dde7de] p-2 hover:bg-[#f4f6f1]"><X size={20} /></button>
        </div>
        {cartDetails.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="mb-5 rounded-full bg-[#eff5ef] p-7 text-forest"><ShoppingBag size={39} strokeWidth={1.4} /></div>
            <h3 className="text-xl font-extrabold">Giỏ hàng đang trống</h3>
            <p className="mt-2 text-sm leading-7 text-[#819287]">Thêm vài món thịt tươi để chuẩn bị một bữa ăn thật ngon nhé!</p>
            <Link to="/products" onClick={closeCart} className="btn-main mt-6">Khám phá sản phẩm <ArrowRight size={16} /></Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-3">
              {cartDetails.map(function (item) {
                return <CartItemRow key={item.product.id} item={item} compact={true} onNavigate={closeCart} />;
              })}
            </div>
            <div className="border-t border-[#e9eee9] bg-[#fcfdfb] px-6 py-6">
              <p className="mb-5 rounded-xl bg-[#eaf4ed] px-4 py-3 text-center text-xs font-semibold text-forest">Đơn từ 350.000đ được miễn phí vận chuyển</p>
              <OrderTotals subtotal={subtotal} shipping={shipping} />
              <Link to="/checkout" onClick={closeCart} className="btn-main mt-5 w-full">Tiến hành thanh toán <ArrowRight size={17} /></Link>
              <Link to="/cart" onClick={closeCart} className="mt-3 block text-center text-xs font-bold text-[#76897b] underline underline-offset-4">Xem giỏ hàng đầy đủ</Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
