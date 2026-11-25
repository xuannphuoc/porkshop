import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, ArrowRight, CreditCard, LockKeyhole, MapPin, ShoppingBag, Truck } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useShop } from "../context/ShopContext";
import type { CustomerInformation } from "../features/products/types/products";
import { calculateLineTotal, formatCurrency, formatWeight } from "../utils/format";
import { validateCustomerInformation } from "../utils/orderValidation";

const initialCustomer: CustomerInformation = {
  fullName: "", phone: "", email: "", address: "", district: "", note: "", paymentMethod: "cod",
};

export default function CheckoutPage() {
  const { cartDetails, subtotal, shipping, placeOrder } = useShop();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<CustomerInformation>(initialCustomer);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateCustomer(fieldName: keyof CustomerInformation, value: string) {
    setCustomer(function (previousCustomer) {
      return { ...previousCustomer, [fieldName]: value };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const validationError = validateCustomerInformation(customer);
    if (validationError !== null) {
      setFormError(validationError);
      return;
    }

    setSubmitting(true);
    const result = await placeOrder(customer);
    setSubmitting(false);
    if (result.success === false) {
      setFormError(result.message);
      return;
    }
    navigate("/order-success/" + result.orderId);
  }

  if (cartDetails.length === 0) {
    return <main className="container-wide py-24 text-center"><ShoppingBag size={40} className="mx-auto text-[#839b89]"/><h1 className="mt-5 text-3xl font-extrabold">Bạn chưa có sản phẩm nào</h1><p className="mt-2 text-sm text-[#839589]">Hãy thêm sản phẩm vào giỏ trước khi thanh toán.</p><Link className="btn-main mt-6" to="/products">Xem sản phẩm</Link></main>;
  }

  return <main className="container-wide py-12"><Link className="inline-flex items-center gap-2 text-xs font-bold text-[#819587] hover:text-forest" to="/cart"><ArrowLeft size={15}/> Quay lại giỏ hàng</Link><p className="eyebrow mt-6">THÔNG TIN THANH TOÁN</p><h1 className="section-title mt-3">Hoàn tất đơn hàng</h1><p className="mt-3 text-sm text-[#84978a]">Điền thông tin để tạo đơn hàng mô phỏng. Không có giao dịch thật nào được thực hiện.</p>
    <form onSubmit={handleSubmit} className="mt-9 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_370px]" noValidate>
      <div className="space-y-6"><section className="rounded-[20px] border border-[#e8eee7] bg-white p-6 sm:p-8"><h2 className="flex items-center gap-3 text-lg font-extrabold text-forest"><MapPin size={21}/> Thông tin nhận hàng</h2><div className="mt-7 grid gap-5 sm:grid-cols-2"><label className="block text-xs font-bold text-[#61776b]">Họ và tên <span className="text-[#c57258]">*</span><input className="field mt-2" value={customer.fullName} onChange={function (event) { updateCustomer("fullName", event.target.value); }} placeholder="Nguyễn Văn A" autoComplete="name" /></label><label className="block text-xs font-bold text-[#61776b]">Số điện thoại <span className="text-[#c57258]">*</span><input className="field mt-2" value={customer.phone} onChange={function (event) { updateCustomer("phone", event.target.value); }} placeholder="0901234567" inputMode="tel" autoComplete="tel" /></label><label className="block text-xs font-bold text-[#61776b] sm:col-span-2">Email (không bắt buộc)<input className="field mt-2" type="email" value={customer.email} onChange={function (event) { updateCustomer("email", event.target.value); }} placeholder="example@email.com" autoComplete="email" /></label><label className="block text-xs font-bold text-[#61776b]">Quận / Huyện <span className="text-[#c57258]">*</span><input className="field mt-2" value={customer.district} onChange={function (event) { updateCustomer("district", event.target.value); }} placeholder="TP. Thủ Đức" /></label><label className="block text-xs font-bold text-[#61776b]">Địa chỉ cụ thể <span className="text-[#c57258]">*</span><input className="field mt-2" value={customer.address} onChange={function (event) { updateCustomer("address", event.target.value); }} placeholder="Số nhà, tên đường" autoComplete="street-address" /></label><label className="block text-xs font-bold text-[#61776b] sm:col-span-2">Ghi chú giao hàng<textarea rows={3} className="field mt-2" value={customer.note} onChange={function (event) { updateCustomer("note", event.target.value); }} placeholder="Ví dụ: giao sau 17h..." /></label></div></section>
      <section className="rounded-[20px] border border-[#e8eee7] bg-white p-6 sm:p-8"><h2 className="flex items-center gap-3 text-lg font-extrabold text-forest"><CreditCard size={21}/> Phương thức thanh toán</h2><div className="mt-5 space-y-3"><label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#dfe8dd] p-4"><input type="radio" checked={customer.paymentMethod === "cod"} onChange={function () { updateCustomer("paymentMethod", "cod"); }} className="accent-[#153f34]" /><div><p className="text-sm font-bold text-forest">Thanh toán khi nhận hàng (COD)</p><p className="mt-1 text-xs text-[#859689]">Chỉ mô phỏng, không giao nhận thực tế.</p></div></label><label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#dfe8dd] p-4"><input type="radio" checked={customer.paymentMethod === "transfer"} onChange={function () { updateCustomer("paymentMethod", "transfer"); }} className="accent-[#153f34]" /><div><p className="text-sm font-bold text-forest">Chuyển khoản (mô phỏng)</p><p className="mt-1 text-xs text-[#859689]">Không có tài khoản ngân hàng hay yêu cầu chuyển tiền.</p></div></label></div></section>
      </div>
      <aside className="rounded-[20px] border border-[#e8eee7] bg-white p-6 soft-shadow lg:sticky lg:top-[105px]"><h2 className="text-lg font-extrabold text-forest">Đơn hàng của bạn</h2><div className="mt-5 space-y-4 border-y border-[#edf1eb] py-5">{cartDetails.map(function (item) { return <div key={item.product.id} className="flex justify-between gap-3 text-xs"><div><p className="font-bold text-forest">{item.product.name}</p><p className="mt-1 text-[#8ca096]">{formatWeight(item.quantityKg)}</p></div><strong className="whitespace-nowrap text-forest">{formatCurrency(calculateLineTotal(item.product.pricePerKg, item.quantityKg))}</strong></div>; })}</div><div className="mt-5 space-y-3 text-sm text-[#829286]"><div className="flex justify-between"><span>Tạm tính</span><span>{formatCurrency(subtotal)}</span></div><div className="flex justify-between"><span>Vận chuyển</span><span>{shipping === 0 ? "Miễn phí" : formatCurrency(shipping)}</span></div></div><div className="mt-5 flex justify-between border-t border-[#edf1eb] pt-5 text-lg font-extrabold text-forest"><span>Tổng cộng</span><span>{formatCurrency(subtotal + shipping)}</span></div>{formError !== "" && <p role="alert" className="mt-5 rounded-xl bg-[#fff0eb] p-3 text-xs font-bold leading-6 text-[#b45b43]">{formError}</p>}<button type="submit" disabled={submitting} className="btn-main mt-6 w-full disabled:opacity-50">{submitting ? "Đang đặt hàng..." : "Xác nhận đặt hàng"} <ArrowRight size={17}/></button><p className="mt-4 flex items-start gap-2 text-xs leading-6 text-[#94a498]"><LockKeyhole className="mt-1 shrink-0" size={14}/> Đơn hàng được lưu trên máy chủ XT Meat và gắn với tài khoản đăng nhập.</p><p className="mt-3 flex items-center gap-2 text-xs text-[#94a498]"><Truck size={14}/> Không kết nối cổng thanh toán thật.</p></aside>
    </form>
  </main>;
}
