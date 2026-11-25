import { ArrowUpRight, Plus, Star } from "lucide-react";
import { Link } from "react-router";
import ProductImage from "../../../components/ProductImage";
import { useShop } from "../../../context/ShopContext";
import { formatCurrency } from "../../../utils/format";
import type { Product } from "../types/products";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useShop();
  const isAvailable = product.stockKg >= 0.5;

  function handleAddToCart() {
    addToCart(product.id, 0.5);
  }

  return (
    <article className="card-lift group min-w-0 overflow-hidden rounded-[19px] border border-[#e8eee7] bg-white">
      <div className="relative overflow-hidden bg-[#f2eee7]">
        <Link to={"/products/" + product.id} aria-label={"Xem chi tiết " + product.name}>
          <ProductImage source={product.image} alt={product.name} className="aspect-[1.15] w-full transition-transform duration-500 group-hover:scale-105" />
        </Link>
        {product.badge !== undefined && (
          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-extrabold text-forest shadow-sm">
            {product.badge}
          </span>
        )}
        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50">
            <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-[#9c5a46] shadow-sm">Tạm hết hàng</span>
          </div>
        )}
      </div>
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold tracking-wide text-[#819287]">THỊT HEO TƯƠI</span>
          <span className="flex items-center gap-1 text-xs font-bold text-[#bd8756]"><Star size={12} fill="currentColor" />{product.rating.toFixed(1)}</span>
        </div>
        <Link to={"/products/" + product.id} className="mt-2 flex items-start justify-between gap-2 text-[16px] font-extrabold text-forest hover:text-[#2d7355]">
          <span>{product.name}</span><ArrowUpRight size={16} className="mt-1 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>
        <p className="mt-1 line-clamp-2 min-h-[39px] text-[12px] leading-[1.7] text-[#819287]">{product.description}</p>
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#eef0eb] pt-4">
          <div>
            <span className="text-base font-extrabold text-forest">{formatCurrency(product.pricePerKg)}</span>
            <span className="ml-1 text-xs text-[#89978e]">/kg</span>
          </div>
          <button type="button" onClick={handleAddToCart} disabled={!isAvailable} aria-label={"Thêm " + product.name + " vào giỏ"} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-white transition hover:bg-[#2e6d55] disabled:cursor-not-allowed disabled:bg-[#cad4cc]">
            <Plus size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
