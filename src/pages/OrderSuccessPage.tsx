import { useEffect, useState } from "react";
import { CheckCircle2, Printer, ShoppingBag } from "lucide-react";
import { Link, useParams } from "react-router";
import type { Order } from "../features/products/types/products";
import { requestApi } from "../utils/api";
import InvoiceDocument from "../components/InvoiceDocument";

export default function OrderSuccessPage() {
  const parameters = useParams();
  const orderId = parameters.orderId;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(function () {
    let requestIsActive = true;
    async function loadOrder() {
      try {
        if (!orderId) throw new Error("Không có mã đơn hàng.");
        const result = await requestApi<{ order: Order }>("/api/orders/" + encodeURIComponent(orderId));
        if (requestIsActive) setOrder(result.order);
      } catch (error) {
        if (requestIsActive) setErrorMessage(error instanceof Error ? error.message : "Không thể tải đơn hàng.");
      } finally {
        if (requestIsActive) setIsLoading(false);
      }
    }
    void loadOrder();
    return function () { requestIsActive = false; };
  }, [orderId]);

  if (isLoading) return <main className="container-wide py-24 text-center">Đang tải đơn hàng...</main>;
  if (order === null) return <main className="container-wide py-24 text-center"><h1 className="section-title">Không thể xem đơn hàng</h1><p role="alert" className="mt-4 text-[#c47962]">{errorMessage}</p><Link to="/my-orders" className="btn-main mt-7">Đơn hàng của tôi</Link></main>;

  return (
    <main className="container-wide max-w-[940px] py-14">
      <div className="no-print mb-9 text-center">
        <CheckCircle2 className="mx-auto text-[#3b8b57]" size={54}/>
        <p className="eyebrow mt-5">ĐẶT HÀNG THÀNH CÔNG</p>
        <h1 className="mt-3 text-3xl font-extrabold text-forest">Cảm ơn bạn đã lựa chọn XT Meat!</h1>
        <p className="mt-3 text-sm text-[#7a8d80]">Thông tin đã được lưu trên máy chủ, bạn có thể xem lại và in đơn hàng sau khi đăng nhập.</p>
      </div>
      <InvoiceDocument order={order}/>
      <div className="no-print mt-8 flex flex-wrap justify-center gap-3">
        <Link className="btn-main" to="/products"><ShoppingBag size={17}/> Tiếp tục mua sắm</Link>
        <button className="btn-outline" type="button" onClick={function () { window.print(); }}><Printer size={17}/> In đơn hàng</button>
        <Link className="btn-outline" to="/my-orders">Đơn hàng của tôi</Link>
      </div>
    </main>
  );
}
