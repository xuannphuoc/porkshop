import { BarChart3, Boxes, Check, ClipboardList, ShoppingCart } from "lucide-react";
import type { Order, Product } from "../../features/products/types/products";
import { formatCurrency, formatWeight } from "../../utils/format";

interface AdminOverviewProps {
  products: Product[];
  orders: Order[];
}

export default function AdminOverview({ products, orders }: AdminOverviewProps) {
  let totalRevenue = 0;
  let pendingOrders = 0;

  for (const order of orders) {
    if (order.status !== "cancelled") {
      totalRevenue = totalRevenue + order.total;
    }
    if (order.status === "pending") {
      pendingOrders = pendingOrders + 1;
    }
  }

  const lowStockProducts = products.filter(function (product) {
    return product.stockKg < 5;
  });

  const statistics = [
    { title: "Sản phẩm", value: String(products.length), subtitle: "Sản phẩm đang quản lý", Icon: Boxes },
    { title: "Đơn hàng", value: String(orders.length), subtitle: "Đơn hàng mô phỏng", Icon: ShoppingCart },
    { title: "Chờ xác nhận", value: String(pendingOrders), subtitle: "Cần xử lý", Icon: ClipboardList },
    { title: "Doanh thu demo", value: formatCurrency(totalRevenue), subtitle: "Không tính đơn đã hủy", Icon: BarChart3 },
  ];

  return (
    <section className="mt-8">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map(function (statistic) {
          const StatisticIcon = statistic.Icon;
          return (
            <div key={statistic.title} className="rounded-[20px] border border-[#e6ece6] bg-white p-6">
              <div className="flex items-center justify-between text-xs font-bold text-[#829489]">
                <span>{statistic.title}</span>
                <StatisticIcon size={19} className="text-[#5f9170]" />
              </div>
              <p className="mt-4 text-2xl font-extrabold text-forest">{statistic.value}</p>
              <p className="mt-2 text-xs text-[#9aa89e]">{statistic.subtitle}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-[20px] border border-[#e6ece6] bg-white p-6">
        <h2 className="text-lg font-extrabold text-forest">Cảnh báo tồn kho</h2>
        <p className="mt-2 text-xs text-[#859589]">Những sản phẩm còn dưới 5 kg</p>
        {lowStockProducts.length === 0 ? (
          <p className="mt-5 flex items-center gap-2 text-sm text-[#548468]">
            <Check size={17} /> Tất cả sản phẩm đều có tồn kho tốt.
          </p>
        ) : (
          <div className="mt-5 space-y-3">
            {lowStockProducts.map(function (product) {
              return (
                <div key={product.id} className="flex items-center justify-between rounded-xl bg-[#fff8f1] p-4 text-sm">
                  <span className="font-bold text-forest">{product.name}</span>
                  <span className="font-extrabold text-[#be7458]">{formatWeight(product.stockKg)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
