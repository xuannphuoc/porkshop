import { useMemo } from "react";
import { ArrowRight, Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { Select, TextInput } from "flowbite-react";
import { useShop } from "../../../context/ShopContext";
import ProductCard from "../components/ProductCard";
import { filterAndSortProducts } from "../services/productFilters";

const categories = [
  { label: "Tất cả", value: "all" },
  { label: "Thịt tươi", value: "thit-tuoi" },
  { label: "Sườn & xương", value: "suon" },
  { label: "Nội tạng", value: "noi-tang" },
  { label: "Thịt chế biến", value: "che-bien" },
];

export default function ProductListPage() {
  const { products, productsLoading, productsError } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "all";
  const searchText = searchParams.get("search") || "";
  const sortValue = searchParams.get("sort") || "featured";

  function updateParameter(parameterName: string, parameterValue: string) {
    const newParameters = new URLSearchParams(searchParams);
    if (parameterValue === "" || parameterValue === "all" || parameterValue === "featured") {
      newParameters.delete(parameterName);
    } else {
      newParameters.set(parameterName, parameterValue);
    }
    setSearchParams(newParameters);
  }

  const filteredProducts = useMemo(function () {
    return filterAndSortProducts(products, selectedCategory, searchText, sortValue);
  }, [products, selectedCategory, searchText, sortValue]);

  return (
    <main>
      <div className="border-b border-[#e9eee8] bg-[#f8f7f0]"><div className="container-wide py-12 sm:py-16"><p className="eyebrow">TƯƠI NGON MỖI NGÀY</p><h1 className="section-title mt-3">Thực phẩm tươi, bữa cơm lành.</h1><p className="mt-3 max-w-xl text-sm leading-7 text-[#809184]">Khám phá những phần thịt heo tươi ngon, được chọn lựa cẩn thận cho gia đình bạn.</p><div className="mt-6 flex items-center gap-2 text-xs text-[#829387]"><Link to="/" className="hover:text-forest">Trang chủ</Link><ArrowRight size={13}/><span className="font-bold text-forest">Sản phẩm</span></div></div></div>
      <div className="container-wide py-12">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold text-[#8fa198]">GÓC CHỢ CỦA XT MEAT</p><h2 className="mt-2 text-2xl font-extrabold text-forest">Tất cả sản phẩm</h2></div><div className="flex items-center gap-2 text-xs text-[#7d8d83]"><Filter size={16}/>{filteredProducts.length} sản phẩm</div></div>
        <div className="grid gap-8 lg:grid-cols-[235px_minmax(0,1fr)]">
          <aside className="self-start rounded-[20px] border border-[#e8eee8] bg-white p-5 lg:sticky lg:top-[105px]"><div className="mb-5 flex items-center gap-2 border-b border-[#ecf0e9] pb-4 text-sm font-extrabold text-forest"><SlidersHorizontal size={19}/> Bộ lọc</div><h3 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-[#91a196]">Danh mục</h3><div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">{categories.map(function (category) { const active = selectedCategory === category.value; return <button type="button" key={category.value} onClick={function () { updateParameter("category", category.value); }} className={"rounded-xl px-3 py-2.5 text-left text-xs font-bold transition " + (active ? "bg-forest text-white" : "text-[#697e70] hover:bg-[#f0f5ef]")}>{category.label}</button>; })}</div><div className="mt-6 rounded-[15px] bg-[#edf6ed] p-4"><p className="text-xs font-extrabold text-forest">🌿 Mẹo nhỏ</p><p className="mt-2 text-xs leading-6 text-[#748979]">Đặt từ 350.000đ để được miễn phí giao hàng trong bản demo.</p></div></aside>
          <div>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row"><div className="relative min-w-0 flex-1"><Search size={17} className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#8aa092]"/><TextInput aria-label="Tìm kiếm sản phẩm" value={searchText} onChange={function (event) { updateParameter("search", event.target.value); }} placeholder="Tìm tên món thịt bạn cần..." className="w-full [&_input]:!rounded-xl [&_input]:!border-[#e4eae4] [&_input]:!bg-white [&_input]:!py-3 [&_input]:!pl-11" /></div><div className="w-full sm:w-52"><Select aria-label="Sắp xếp sản phẩm" value={sortValue} onChange={function (event) { updateParameter("sort", event.target.value); }} className="[&_select]:!rounded-xl [&_select]:!border-[#e4eae4] [&_select]:!bg-white [&_select]:!py-3"><option value="featured">Nổi bật</option><option value="price-asc">Giá thấp đến cao</option><option value="price-desc">Giá cao đến thấp</option><option value="name">Tên A–Z</option></Select></div></div>
            {productsLoading && <div className="py-24 text-center text-sm text-[#7d8f80]">Đang tải sản phẩm...</div>}
            {!productsLoading && productsError !== "" && <div role="alert" className="rounded-xl bg-[#fff1ec] p-6 text-sm text-[#a95335]">{productsError}</div>}
            {!productsLoading && productsError === "" && filteredProducts.length === 0 && <div className="flex flex-col items-center rounded-[20px] border border-dashed border-[#d8e5d8] bg-[#fbfcf8] p-16 text-center"><Search size={32} className="text-[#90a695]"/><h3 className="mt-4 text-lg font-extrabold text-forest">Chưa tìm thấy sản phẩm</h3><p className="mt-2 text-sm text-[#849487]">Thử thay từ khóa hoặc chọn một danh mục khác.</p><button type="button" className="btn-main mt-5" onClick={function () { setSearchParams({}); }}>Xóa bộ lọc <X size={15}/></button></div>}
            {!productsLoading && productsError === "" && filteredProducts.length > 0 && <div className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-3">{filteredProducts.map(function (product) { return <ProductCard key={product.id} product={product}/>; })}</div>}
          </div>
        </div>
      </div>
    </main>
  );
}
