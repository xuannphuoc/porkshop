import { useState } from "react";
import { ArrowLeft, Check, ShieldCheck, ShoppingBag, Star, Truck } from "lucide-react";
import { Link, useParams } from "react-router";
import ProductImage from "../../../components/ProductImage";
import QuantityControl from "../../../components/QuantityControl";
import { useShop } from "../../../context/ShopContext";
import { formatCurrency, formatWeight } from "../../../utils/format";
import ProductCard from "../components/ProductCard";

export default function ProductDetailPage() {
  const parameters = useParams();
  const productId = parameters.productId;
  // Dùng key để reset state chọn kg khi người dùng chuyển sang sản phẩm khác.
  return <ProductDetailContent key={productId} productId={productId} />;
}

interface ProductDetailContentProps {
  productId: string | undefined;
}

function ProductDetailContent({ productId }: ProductDetailContentProps) {
  const { products, productsLoading, productsError, addToCart, setCartOpen } = useShop();
  const [quantityKg, setQuantityKg] = useState(0.5);

  const product = products.find(function (currentProduct) {
    return currentProduct.id === productId;
  });

  if (productsLoading === true) {
    return <main className="container-wide py-24 text-center">Đang tải sản phẩm...</main>;
  }
  if (productsError !== "") {
    return <main className="container-wide py-24 text-center" role="alert">{productsError}</main>;
  }
  if (product === undefined) {
    return <main className="container-wide py-24 text-center"><h1 className="text-3xl font-extrabold text-forest">Không tìm thấy sản phẩm</h1><p className="mt-3 text-sm text-[#87998b]">Sản phẩm bạn tìm kiếm không tồn tại hoặc đã được gỡ bỏ.</p><Link to="/products" className="btn-main mt-7">Xem tất cả sản phẩm</Link></main>;
  }

  const isAvailable = product.stockKg >= 0.5;
  const relatedProducts = products.filter(function (relatedProduct) {
    return relatedProduct.id !== product.id && relatedProduct.category === product.category;
  }).slice(0, 4);

  function addSelectedQuantity() {
    if (product !== undefined) {
      addToCart(product.id, quantityKg);
    }
  }
  function buyNow() {
    if (product !== undefined) {
      const addedSuccessfully = addToCart(product.id, quantityKg);
      if (addedSuccessfully === true) {
        setCartOpen(true);
      }
    }
  }

  return <main className="container-wide py-9 sm:py-12">
    <div className="mb-8 flex flex-wrap items-center gap-2 text-xs text-[#86988c]"><Link to="/">Trang chủ</Link><span>/</span><Link to="/products">Sản phẩm</Link><span>/</span><span className="font-bold text-forest">{product.name}</span></div>
    <div className="grid items-start gap-9 lg:grid-cols-2 lg:gap-14">
      <div className="overflow-hidden rounded-[26px] border border-[#e8ece5] bg-[#f5f0e9]"><ProductImage key={product.id} source={product.image} alt={product.name} className="aspect-[1.03] w-full"/></div>
      <div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#eaf4e9] px-3 py-1.5 text-[11px] font-extrabold text-[#337351]">THỊT TƯƠI CHỌN LỌC</span>{product.badge !== undefined && <span className="rounded-full bg-[#fff1e7] px-3 py-1.5 text-[11px] font-extrabold text-[#ba7a50]">{product.badge}</span>}</div><h1 className="mt-5 text-4xl font-extrabold leading-tight text-forest sm:text-5xl">{product.name}</h1><p className="mt-4 flex items-center gap-2 text-sm text-[#7a8e80]"><Star size={15} className="text-[#c18a53]" fill="currentColor"/><strong className="text-forest">{product.rating.toFixed(1)}</strong><span>· Chất lượng chọn lọc</span></p><div className="mt-7 border-b border-[#e8eee8] pb-6"><span className="text-3xl font-extrabold text-forest">{formatCurrency(product.pricePerKg)}</span><span className="ml-2 text-sm text-[#8ba093]">/ kg</span></div>
      <p className="mt-6 text-sm leading-8 text-[#73877a]">{product.description}</p><p className="mt-4 flex items-center gap-2 text-sm font-bold"><span className={"inline-block h-2.5 w-2.5 rounded-full " + (isAvailable ? "bg-[#5ba675]" : "bg-[#dc8071]")}></span>{isAvailable ? "Còn hàng" : "Tạm hết hàng"}<span className="ml-1 font-normal text-[#879a8d]">· {formatWeight(product.stockKg)} trong kho</span></p>
      <div className="mt-8">
        <p className="mb-3 text-xs font-extrabold uppercase tracking-wide text-forest">Chọn khối lượng</p>
        <div className="flex flex-wrap items-center gap-3">
          <QuantityControl quantityKg={quantityKg} maximumQuantityKg={product.stockKg} onQuantityChange={setQuantityKg} productName={product.name} />
          <span className="text-xs text-[#8da093]">Mỗi lần tăng 0,5 kg</span>
        </div>
      </div>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row"><button type="button" disabled={!isAvailable || quantityKg > product.stockKg} onClick={addSelectedQuantity} className="btn-main flex-1"><ShoppingBag size={18}/> Thêm vào giỏ</button><button type="button" disabled={!isAvailable || quantityKg > product.stockKg} onClick={buyNow} className="btn-outline flex-1">Mua ngay</button></div><p className="mt-3 text-xs text-[#94a69b]">Tạm tính: <strong className="text-forest">{formatCurrency(product.pricePerKg * quantityKg)}</strong></p>
      <div className="mt-9 grid gap-3 rounded-[18px] bg-[#f6f8f2] p-5 sm:grid-cols-2"><p className="flex items-center gap-3 text-xs font-bold text-forest"><Truck size={20} className="text-[#6f9679]"/> Giao hàng nhanh chóng</p><p className="flex items-center gap-3 text-xs font-bold text-forest"><ShieldCheck size={20} className="text-[#6f9679]"/> Nguồn gốc rõ ràng</p><p className="flex items-center gap-3 text-xs font-bold text-forest"><Check size={20} className="text-[#6f9679]"/> Đóng gói cẩn thận</p><p className="flex items-center gap-3 text-xs font-bold text-forest"><Check size={20} className="text-[#6f9679]"/> Bảo quản lạnh phù hợp</p></div>
      <p className="mt-5 text-xs leading-7 text-[#9aa79e]">Nguồn gốc: {product.origin}. Hình ảnh minh họa cho dự án học tập.</p>
      </div>
    </div>
    {relatedProducts.length > 0 && <section className="mt-20"><div className="mb-7 flex items-center justify-between gap-4"><div><p className="eyebrow">KHÁM PHÁ THÊM</p><h2 className="section-title mt-3">Có thể bạn sẽ thích</h2></div><Link to="/products" className="flex items-center gap-2 text-sm font-bold text-forest"><ArrowLeft size={16}/> Xem tất cả</Link></div><div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">{relatedProducts.map(function (relatedProduct) { return <ProductCard key={relatedProduct.id} product={relatedProduct}/>; })}</div></section>}
  </main>;
}
