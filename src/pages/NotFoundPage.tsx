import { ArrowLeft, SearchX } from "lucide-react";
import { Link } from "react-router";

export default function NotFoundPage() {
  return <main className="container-wide flex min-h-[460px] flex-col items-center justify-center py-20 text-center"><div className="rounded-full bg-[#edf5ec] p-7 text-forest"><SearchX size={42}/></div><p className="eyebrow mt-7">LẠC ĐƯỜNG RỒI?</p><h1 className="mt-3 text-4xl font-extrabold text-forest">Không tìm thấy trang</h1><p className="mt-3 text-sm text-[#829588]">Đường dẫn này chưa tồn tại trong XT Meat.</p><Link to="/" className="btn-main mt-7"><ArrowLeft size={17}/> Về trang chủ</Link></main>;
}
