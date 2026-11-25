import { useState } from "react";
import { BarChart3, Boxes, ClipboardList } from "lucide-react";
import { useShop } from "../context/ShopContext";
import AdminOverview from "./admin/AdminOverview";
import AdminProducts from "./admin/AdminProducts";
import AdminOrders from "./admin/AdminOrders";

type AdminTab = "overview" | "products" | "orders";

const tabs = [
  { value: "overview" as AdminTab, label: "Tổng quan", Icon: BarChart3 },
  { value: "products" as AdminTab, label: "Sản phẩm", Icon: Boxes },
  { value: "orders" as AdminTab, label: "Đơn hàng", Icon: ClipboardList },
];

export default function AdminPage() {
  const { products, orders } = useShop();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  return (
    <main className="min-h-[650px] bg-[#f6f8f3]">
      <div className="container-wide py-12">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">BACK OFFICE · DEMO</p>
            <h1 className="section-title mt-3">Quản lý cửa hàng</h1>
            <p className="mt-3 text-sm text-[#84968a]">Khu vực quản trị dành riêng cho tài khoản Admin. Mọi thay đổi được kiểm tra quyền tại API.</p>
          </div>
          <span className="rounded-full bg-[#fff0e1] px-4 py-2 text-xs font-extrabold text-[#ab7145]">Dữ liệu trên máy chủ</span>
        </div>
        <nav aria-label="Điều hướng quản trị" className="mt-9 flex flex-wrap gap-2 border-b border-[#e2e9df] pb-4">
          {tabs.map(function (tab) {
            const TabIcon = tab.Icon;
            const active = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={function () { setActiveTab(tab.value); }}
                className={"flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-extrabold transition " +
                  (active ? "bg-forest text-white" : "bg-white text-[#6f8574] hover:bg-[#eaf3e9]")}
              >
                <TabIcon size={17} /> {tab.label}
              </button>
            );
          })}
        </nav>
        {activeTab === "overview" && <AdminOverview products={products} orders={orders} />}
        {activeTab === "products" && <AdminProducts />}
        {activeTab === "orders" && <AdminOrders />}
      </div>
    </main>
  );
}
