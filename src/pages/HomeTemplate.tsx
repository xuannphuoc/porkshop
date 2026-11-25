import type { FormEvent } from "react";
import { useState } from "react";
import { Leaf, MapPin, Menu, Phone, Search, ShieldCheck, ShoppingBag, Truck, X } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { useShop } from "../context/ShopContext";
import CartDrawer from "../components/CartDrawer";
import { useAuth } from "../auth/AuthContext";
import { LogIn, LogOut, UserRound, LayoutDashboard } from "lucide-react";

export default function HomeTemplate() {
  const { cartCount, setCartOpen, notification, dismissNotification } = useShop();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  async function handleLogout() {
    try { await logout(); navigate("/"); } catch { window.alert("Không thể đăng xuất. Vui lòng thử lại."); }
    setMobileMenuOpen(false);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate("/products?search=" + encodeURIComponent(searchText.trim()));
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#fffdf9] text-text">
      <div className="bg-forest px-4 py-2.5 text-center text-[11px] font-semibold tracking-wide text-white sm:text-xs">
        <span className="mr-2 inline-block">✦</span> Miễn phí giao hàng cho đơn từ 350.000đ <span className="mx-3 text-white/40">•</span> Tươi ngon mỗi ngày
      </div>
      <header className="sticky top-0 z-40 border-b border-[#edf0e9] bg-white/95 backdrop-blur-xl">
        <div className="container-wide flex h-[78px] items-center justify-between gap-5">
          <Link to="/" aria-label="XT Meat - Trang chủ" className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-forest text-white"><Leaf size={24} strokeWidth={2.1} /></div>
            <div><p className="text-[22px] font-extrabold leading-[1.1] tracking-[-.06em] text-forest">XT Meat</p><p className="mt-1 text-[8px] font-bold tracking-[.22em] text-[#9aaa9f]">TƯƠI NGON MỖI NGÀY</p></div>
          </Link>
          <nav className="hidden items-center gap-8 lg:flex">
            <NavLink to="/" end className={({ isActive }) => isActive ? "text-sm font-bold text-forest" : "text-sm font-semibold text-[#7b8e82] hover:text-forest"}>Trang chủ</NavLink>
            <NavLink to="/products" className={({ isActive }) => isActive ? "text-sm font-bold text-forest" : "text-sm font-semibold text-[#7b8e82] hover:text-forest"}>Sản phẩm</NavLink>
            <Link to="/#ve-chung-toi" className="text-sm font-semibold text-[#7b8e82] hover:text-forest">Về chúng tôi</Link>
            {user !== null && <Link to="/my-orders" className="text-sm font-semibold text-[#7b8e82] hover:text-forest">Đơn hàng của tôi</Link>}
            {user?.role === "admin" && <Link to="/admin" className="text-sm font-semibold text-[#7b8e82] hover:text-forest">Quản trị</Link>}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <form onSubmit={handleSearch} className="hidden items-center rounded-full border border-[#e6ece6] bg-[#f7faf5] px-3 py-2 xl:flex">
              <Search size={17} className="text-[#83988b]"/><input value={searchText} onChange={function (event) { setSearchText(event.target.value); }} className="w-36 border-0 bg-transparent px-2 text-xs outline-none placeholder:text-[#9aaa9f]" placeholder="Tìm thịt ngon..." aria-label="Tìm kiếm sản phẩm" />
            </form>
            <button type="button" onClick={function () { setCartOpen(true); }} className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#e5ece4] text-forest hover:bg-[#eff6ee]" aria-label="Mở giỏ hàng"><ShoppingBag size={21} /><span className="absolute -right-1 -top-1 flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-orange px-1 text-[10px] font-extrabold text-white">{cartCount}</span></button>
            {user === null ? (
              <Link to="/login" className="btn-main hidden !rounded-full !px-5 !py-3 sm:inline-flex"><LogIn size={16}/> Đăng nhập</Link>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <span className="max-w-[120px] truncate text-xs font-semibold text-forest" title={user.fullName}><UserRound size={16} className="mr-1 inline"/>{user.fullName}</span>
                <button type="button" onClick={function () { void handleLogout(); }} className="rounded-full border border-[#e5ece4] p-2.5 text-forest" aria-label="Đăng xuất" title="Đăng xuất"><LogOut size={16}/></button>
              </div>
            )}
            <button type="button" aria-label="Mở menu" onClick={function () { setMobileMenuOpen(!mobileMenuOpen); }} className="ml-1 rounded-full border border-[#e5ece4] p-2.5 lg:hidden">{mobileMenuOpen ? <X size={21}/> : <Menu size={21}/>}</button>
          </div>
        </div>
        {mobileMenuOpen && <nav className="flex flex-col gap-1 border-t border-[#edf1eb] bg-white px-6 py-4 lg:hidden">
          <Link to="/" onClick={function () { setMobileMenuOpen(false); }} className="rounded-lg p-3 text-sm font-bold hover:bg-[#f4f8f1]">Trang chủ</Link>
          <Link to="/products" onClick={function () { setMobileMenuOpen(false); }} className="rounded-lg p-3 text-sm font-bold hover:bg-[#f4f8f1]">Sản phẩm</Link>
          <Link to="/cart" onClick={function () { setMobileMenuOpen(false); }} className="rounded-lg p-3 text-sm font-bold hover:bg-[#f4f8f1]">Giỏ hàng</Link>
          {user !== null && <Link to="/my-orders" onClick={function () { setMobileMenuOpen(false); }} className="rounded-lg p-3 text-sm font-bold hover:bg-[#f4f8f1]">Đơn hàng của tôi</Link>}
          {user?.role === "admin" && <Link to="/admin" onClick={function () { setMobileMenuOpen(false); }} className="rounded-lg p-3 text-sm font-bold hover:bg-[#f4f8f1]"><LayoutDashboard size={17} className="mr-2 inline"/>Quản trị</Link>}
          {user === null ? <><Link to="/login" onClick={function () { setMobileMenuOpen(false); }} className="rounded-lg p-3 text-sm font-bold hover:bg-[#f4f8f1]">Đăng nhập</Link><Link to="/register" onClick={function () { setMobileMenuOpen(false); }} className="rounded-lg p-3 text-sm font-bold hover:bg-[#f4f8f1]">Tạo tài khoản</Link></> : <button type="button" onClick={function () { void handleLogout(); }} className="rounded-lg p-3 text-left text-sm font-bold hover:bg-[#f4f8f1]">Đăng xuất ({user.fullName})</button>}
          <form onSubmit={handleSearch} className="flex gap-2 p-2"><input className="field" placeholder="Tìm sản phẩm..." value={searchText} onChange={function (event) { setSearchText(event.target.value); }} /><button className="btn-main" type="submit"><Search size={18}/></button></form>
        </nav>}
      </header>
      <Outlet />
      <footer className="mt-20 bg-[#113b31] text-white">
        <div className="container-wide grid gap-11 py-14 md:grid-cols-4">
          <div className="md:col-span-2"><div className="flex items-center gap-2"><div className="rounded-xl bg-white/10 p-2"><Leaf size={24}/></div><span className="text-2xl font-extrabold tracking-tight">XT Meat</span></div><p className="mt-5 max-w-sm text-sm leading-8 text-[#c8dacf]">Mang thịt heo tươi sạch, được chọn lựa cẩn thận đến căn bếp của mỗi gia đình. Mỗi bữa ăn ngon bắt đầu từ sự an tâm.</p><div className="mt-5 flex items-center gap-2 text-xs text-[#aecbb8]"><ShieldCheck size={16}/> Website demo — không xử lý thanh toán thật</div></div>
          <div><h3 className="mb-5 text-sm font-extrabold">Khám phá</h3><div className="flex flex-col gap-4 text-sm text-[#bbd0c2]"><Link to="/products">Tất cả sản phẩm</Link><Link to="/products?category=thit-tuoi">Thịt tươi</Link><Link to="/products?category=suon">Sườn & xương</Link><Link to="/cart">Giỏ hàng</Link></div></div>
          <div><h3 className="mb-5 text-sm font-extrabold">Liên hệ</h3><div className="space-y-4 text-sm text-[#bbd0c2]"><p className="flex items-center gap-3"><MapPin size={17}/> TP. Hồ Chí Minh, Việt Nam</p><p className="flex items-center gap-3"><Phone size={17}/> Demo: chưa có hotline</p><p className="flex items-center gap-3"><Truck size={17}/> Giao hàng mô phỏng</p></div></div>
        </div>
        <div className="border-t border-white/10"><div className="container-wide flex flex-col justify-between gap-2 py-5 text-xs text-[#9abbab] sm:flex-row"><span>© 2026 XT Meat · Demo ReactJS + TypeScript</span><span>Thiết kế để học lập trình Frontend · Ảnh minh họa Unsplash</span></div></div>
      </footer>
      <CartDrawer />
      {notification !== null && (
        <div role="status" className="fixed bottom-6 right-5 z-[100] flex max-w-sm items-start gap-3 rounded-xl border border-[#d9e9dc] bg-white p-4 shadow-2xl">
          <div className="rounded-full bg-[#ebf5ed] p-2 text-forest"><ShieldCheck size={16}/></div>
          <p className="flex-1 text-sm font-semibold leading-6 text-forest">{notification.message}</p>
          <button type="button" aria-label="Đóng thông báo" onClick={dismissNotification} className="text-[#91a095]"><X size={17}/></button>
        </div>
      )}
    </div>
  );
}
