import type { ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router";
import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading === true) {
    return <main className="container-wide py-24 text-center">Đang kiểm tra tài khoản...</main>;
  }
  if (user === null) {
    return <Navigate to={"/login?returnTo=" + encodeURIComponent(location.pathname)} replace />;
  }
  if (requireAdmin === true && user.role !== "admin") {
    return (
      <main className="container-wide py-24 text-center">
        <h1 className="section-title">Bạn không có quyền quản trị</h1>
        <p className="mt-4 text-sm text-[#7d8f83]">Tài khoản khách hàng không thể truy cập khu vực Admin.</p>
        <Link to="/" className="btn-main mt-7">Về trang chủ</Link>
      </main>
    );
  }
  return <>{children}</>;
}
