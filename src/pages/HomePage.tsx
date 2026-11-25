import { ArrowRight, Check, Clock3, HeartHandshake, Leaf, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Link } from "react-router";
import ProductCard from "../features/products/components/ProductCard";
import ProductImage from "../components/ProductImage";
import { useShop } from "../context/ShopContext";

const heroImage = "https://images.unsplash.com/photo-1768203635745-80a591558549?auto=format&fit=crop&w=1600&q=85";
const storyImage = "https://images.unsplash.com/photo-1758346972662-faa97bbb289d?auto=format&fit=crop&w=1400&q=85";

const categories = [
  { name: "Thịt heo tươi", subtitle: "Bữa cơm thân thương", path: "/products?category=thit-tuoi", emoji: "🥩", background: "#f6ede3" },
  { name: "Sườn & xương", subtitle: "Ngon ngọt tự nhiên", path: "/products?category=suon", emoji: "🍖", background: "#f3eddf" },
  { name: "Nội tạng", subtitle: "Tươi sạch mỗi ngày", path: "/products?category=noi-tang", emoji: "🍲", background: "#eff1e4" },
  { name: "Thịt chế biến", subtitle: "Tiện lợi, đậm vị", path: "/products?category=che-bien", emoji: "🍢", background: "#f7ece9" },
];

export default function HomePage() {
  const { products, productsLoading, productsError } = useShop();
  const featuredProducts = products.filter(function (product) {
    return product.featured === true;
  }).slice(0, 4);

  return (
    <>
      <section className="overflow-hidden bg-[#f8f5ec]">
        <div className="container-wide grid min-h-[600px] items-center gap-10 py-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-14 lg:py-[72px]">
          <div className="relative z-10 max-w-[560px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#dbe6d8] bg-white px-4 py-2 text-[11px] font-bold tracking-[.08em] text-forest"><span className="h-2 w-2 rounded-full bg-[#80ad73]"></span> THỊT TƯƠI CHỌN LỌC MỖI NGÀY</div>
            <h1 className="mt-7 text-[45px] font-extrabold leading-[1.16] tracking-[-.055em] text-forest sm:text-[60px] lg:text-[67px]">Bữa ngon bắt đầu từ <span className="relative text-orange">thịt tươi<span className="absolute -bottom-2 left-0 right-0 h-[6px] rounded-full bg-[#e8b78b]/65"></span></span>.</h1>
            <p className="mt-7 max-w-[460px] text-sm leading-[2] text-[#6f8275] sm:text-base">Chọn lựa kỹ càng từ nguồn thịt chất lượng, giữ trọn độ tươi ngon, để mỗi bữa cơm gia đình luôn tròn vị yêu thương.</p>
            <div className="mt-9 flex flex-wrap gap-3"><Link to="/products" className="btn-main !px-7 !py-4">Khám phá sản phẩm <ArrowRight size={18}/></Link><Link to="/#ve-chung-toi" className="btn-outline !border-[#d2ddd1] !bg-transparent !px-6 !py-4">Câu chuyện của XT Meat</Link></div>
            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs font-bold text-[#587666]"><span className="flex items-center gap-2"><Check className="text-[#5e9872]" size={16}/> Chọn thịt mỗi ngày</span><span className="flex items-center gap-2"><Check className="text-[#5e9872]" size={16}/> Đóng gói cẩn thận</span></div>
          </div>
          <div className="relative mx-auto w-full max-w-[650px] lg:ml-auto">
            <div className="absolute -left-9 -top-7 h-36 w-36 rounded-full border border-[#d5dfcc] opacity-80"></div>
            <div className="absolute -bottom-9 -right-7 h-52 w-52 rounded-full border border-[#cbdac7] opacity-80"></div>
            <div className="relative overflow-hidden rounded-[32px] border-[9px] border-white shadow-[0_28px_75px_rgba(56,69,48,.15)]"><ProductImage source={heroImage} alt="Thịt heo tươi được chọn lựa" className="aspect-[1.12] w-full lg:aspect-[1.06]"/></div>
            <div className="absolute -bottom-6 -left-4 flex max-w-[260px] items-center gap-3 rounded-[18px] bg-white px-5 py-4 shadow-xl sm:-left-10"><div className="rounded-full bg-[#edf5ed] p-3 text-forest"><Leaf size={22}/></div><div><p className="text-sm font-extrabold text-forest">Tươi lành mỗi bữa</p><p className="mt-1 text-[11px] text-[#819188]">Nguyên liệu cho bữa ăn ngon</p></div></div>
            <div className="absolute -right-3 -top-5 rounded-2xl bg-forest px-5 py-4 text-white shadow-xl sm:-right-5"><p className="text-2xl font-extrabold">100%</p><p className="text-[10px] font-semibold text-[#d2e3d6]">Chọn lọc kỹ</p></div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#f0f1e9] bg-white"><div className="container-wide grid gap-5 py-8 sm:grid-cols-3 sm:gap-8">
        {[{ Icon: Truck, title: "Giao hàng nhanh", subtitle: "Mô phỏng giao nội thành" },{ Icon: ShieldCheck, title: "Nguồn gốc rõ ràng", subtitle: "Thông tin sản phẩm minh bạch" },{ Icon: HeartHandshake, title: "Chọn lựa tận tâm", subtitle: "Tươi ngon trong từng bữa ăn" }].map(function (item) {
          return <div key={item.title} className="flex items-center gap-3 sm:justify-center"><div className="rounded-full bg-[#eff5eb] p-3 text-forest"><item.Icon size={21} strokeWidth={1.7}/></div><div><p className="text-sm font-extrabold text-forest">{item.title}</p><p className="mt-1 text-xs text-[#94a498]">{item.subtitle}</p></div></div>;
        })}
      </div></section>

      <section className="container-wide py-20">
        <div className="mb-9 text-center"><p className="eyebrow">DANH MỤC SẢN PHẨM</p><h2 className="section-title mt-3">Hôm nay nhà mình ăn gì?</h2><p className="mt-3 text-sm text-[#84988c]">Lựa chọn nguyên liệu tươi ngon cho món ăn yêu thích của bạn</p></div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">{categories.map(function (category) {
          return <Link key={category.name} to={category.path} className="group flex min-h-[188px] flex-col items-center justify-center rounded-[20px] border border-[#eceee8] p-5 text-center transition hover:-translate-y-1 hover:shadow-lg" style={{ backgroundColor: category.background }}><div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/80 text-4xl shadow-sm transition group-hover:scale-110">{category.emoji}</div><h3 className="text-sm font-extrabold text-forest sm:text-base">{category.name}</h3><p className="mt-1 text-xs text-[#8a998a]">{category.subtitle}</p><ArrowRight size={16} className="mt-4 text-[#9bab9c] transition group-hover:translate-x-1 group-hover:text-forest" /></Link>;
        })}</div>
      </section>

      <section className="bg-[#f6f7f0] py-20"><div className="container-wide">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">ĐƯỢC YÊU THÍCH NHẤT</p><h2 className="section-title mt-3">Món ngon được chọn nhiều</h2><p className="mt-3 text-sm text-[#829589]">Những phần thịt tươi ngon được yêu thích tại XT Meat</p></div><Link to="/products" className="inline-flex items-center gap-2 text-sm font-extrabold text-forest underline decoration-[#98b69a] underline-offset-8 hover:text-[#36815e]">Xem tất cả sản phẩm <ArrowRight size={17}/></Link></div>
        {productsLoading && <p className="py-20 text-center text-[#829589]">Đang tải sản phẩm...</p>}
        {!productsLoading && productsError !== "" && <p role="alert" className="py-12 text-center text-red-600">{productsError}</p>}
        {!productsLoading && productsError === "" && featuredProducts.length === 0 && <p className="py-12 text-center text-[#829589]">Hiện chưa có sản phẩm nổi bật.</p>}
        {!productsLoading && productsError === "" && featuredProducts.length > 0 && <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">{featuredProducts.map(function (product) { return <ProductCard key={product.id} product={product}/>; })}</div>}
      </div></section>

      <section id="ve-chung-toi" className="container-wide grid items-center gap-12 py-20 lg:grid-cols-2 lg:gap-20">
        <div className="relative"><ProductImage source={storyImage} alt="Quầy thịt tươi được chăm chút" className="aspect-[1.24] w-full rounded-[28px]"/><div className="absolute -bottom-6 right-6 rounded-2xl bg-[#f7f4e8] px-6 py-5 shadow-lg"><div className="flex items-center gap-2 text-forest"><Sparkles size={20}/><span className="font-extrabold">Chất lượng từ sự tận tâm</span></div><p className="mt-1 text-xs text-[#7d8b7d]">Mỗi ngày, một lựa chọn tươi lành.</p></div></div>
        <div><p className="eyebrow">CÂU CHUYỆN CỦA XT MEAT</p><h2 className="section-title mt-4">Từ gian bếp nhỏ đến những bữa ăn <span className="text-orange">tròn vị.</span></h2><p className="mt-6 text-sm leading-8 text-[#73877a]">Chúng tôi tin rằng một bữa cơm ngon không cần cầu kỳ. Chỉ cần nguyên liệu tươi, được chọn lựa kỹ càng và sự chăm chút của người nấu.</p><div className="mt-7 space-y-4">{[{ Icon: Leaf, title: "Tươi ngon mỗi ngày", body: "Sản phẩm được trình bày với thông tin giá và tồn kho rõ ràng." },{ Icon: Clock3, title: "Dễ chọn, dễ mua", body: "Chọn trọng lượng theo kg và đặt hàng chỉ trong vài bước." },{ Icon: ShieldCheck, title: "Minh bạch trong từng trải nghiệm", body: "Toàn bộ quy trình mua hàng là bản demo để học ReactJS." }].map(function (benefit) { return <div key={benefit.title} className="flex gap-4"><div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf5ed] text-forest"><benefit.Icon size={19}/></div><div><h3 className="text-sm font-extrabold text-forest">{benefit.title}</h3><p className="mt-1 text-xs leading-7 text-[#809287]">{benefit.body}</p></div></div>; })}</div></div>
      </section>

      <section className="container-wide pb-4"><div className="relative overflow-hidden rounded-[30px] bg-forest px-7 py-12 text-white sm:px-16 sm:py-16"><div className="absolute -right-20 -top-28 h-80 w-80 rounded-full border-[35px] border-white/5"></div><div className="absolute -bottom-32 right-20 h-80 w-80 rounded-full border-[40px] border-white/5"></div><div className="relative max-w-[640px]"><p className="text-xs font-extrabold tracking-[.18em] text-[#c2d7c5]">BỮA ĂN XT MEAT, NIỀM VUI TRỌN VẸN</p><h2 className="mt-4 text-3xl font-extrabold leading-[1.35] tracking-tight sm:text-5xl">Thêm chút tươi ngon vào căn bếp của bạn.</h2><p className="mt-4 text-sm leading-8 text-[#c1d2c5]">Đặt thịt tươi một cách đơn giản, rõ ràng và tiện lợi.</p><Link to="/products" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-4 text-sm font-extrabold text-forest transition hover:bg-[#e6f1e4]">Bắt đầu mua sắm <ArrowRight size={18}/></Link></div></div></section>
    </>
  );
}
