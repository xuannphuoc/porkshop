import { useState } from "react";
import type { FormEvent } from "react";
import { LockKeyhole, LogIn, UserPlus } from "lucide-react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../auth/AuthContext";

interface AuthPageProps { mode: "login" | "register"; }

export default function AuthPage({ mode }: AuthPageProps) {
  const { user, loading, login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParameters] = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const requestedPath = searchParameters.get("returnTo") || "/";
  let returnTo = "/";
  if (requestedPath.startsWith("/") && !requestedPath.startsWith("//") && !requestedPath.includes("\\")) {
    returnTo = requestedPath;
  }
  if (loading === true) {
    return <main className="container-wide py-24 text-center">Đang kiểm tra tài khoản...</main>;
  }
  if (user !== null) {
    return <Navigate to={user.role === "admin" ? "/admin" : returnTo} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    if (mode === "register") {
      if (fullName.trim().length < 2) { setErrorMessage("Vui lòng nhập tên của bạn."); return; }
      if (password.length < 10) { setErrorMessage("Mật khẩu cần ít nhất 10 ký tự."); return; }
      if (password !== confirmPassword) { setErrorMessage("Hai mật khẩu không khớp."); return; }
    }
    setSubmitting(true);
    try {
      let loggedInUser;
      if (mode === "register") {
        loggedInUser = await register(fullName, email, password);
      } else {
        loggedInUser = await login(email, password);
      }
      navigate(loggedInUser.role === "admin" ? "/admin" : returnTo, { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể xác thực tài khoản.");
    } finally {
      setSubmitting(false);
    }
  }

  const isRegistration = mode === "register";
  return (
    <main className="container-wide flex min-h-[620px] items-center justify-center py-16">
      <section className="w-full max-w-md rounded-[26px] border border-[#e2eae0] bg-white p-7 shadow-[0_20px_60px_rgba(22,64,44,.07)] sm:p-10">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ecf4eb] text-forest">
          {isRegistration ? <UserPlus size={27} /> : <LogIn size={27} />}
        </div>
        <p className="eyebrow">XT MEAT · TÀI KHOẢN</p>
        <h1 className="mt-3 text-3xl font-extrabold text-forest">{isRegistration ? "Tạo tài khoản" : "Đăng nhập"}</h1>
        <p className="mt-3 text-sm leading-7 text-[#819587]">{isRegistration ? "Đăng ký tài khoản khách hàng để đặt mua và xem lại đơn hàng." : "Đăng nhập để mua hàng và xem đơn của bạn. Quản trị viên sẽ có trang riêng."}</p>
        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          {isRegistration && <label className="block text-sm font-semibold text-forest">Họ và tên<input className="field mt-2" value={fullName} onChange={function (event) { setFullName(event.target.value); }} autoComplete="name" required maxLength={100}/></label>}
          <label className="block text-sm font-semibold text-forest">Email<input className="field mt-2" type="email" value={email} onChange={function (event) { setEmail(event.target.value); }} autoComplete="email" required maxLength={254} /></label>
          <label className="block text-sm font-semibold text-forest">Mật khẩu<input className="field mt-2" type="password" value={password} onChange={function (event) { setPassword(event.target.value); }} autoComplete={isRegistration ? "new-password" : "current-password"} minLength={isRegistration ? 10 : undefined} required /></label>
          {isRegistration && <label className="block text-sm font-semibold text-forest">Nhập lại mật khẩu<input className="field mt-2" type="password" value={confirmPassword} onChange={function (event) { setConfirmPassword(event.target.value); }} autoComplete="new-password" required /></label>}
          {errorMessage !== "" && <p role="alert" className="rounded-xl bg-[#fff0eb] p-3 text-sm font-semibold text-[#b45b43]">{errorMessage}</p>}
          <button type="submit" disabled={submitting} className="btn-main w-full justify-center disabled:opacity-60">{submitting ? "Đang xử lý..." : isRegistration ? "Đăng ký" : "Đăng nhập"}</button>
        </form>
        <div className="mt-6 flex items-start gap-2 text-xs leading-6 text-[#809186]"><LockKeyhole size={17} className="shrink-0"/>Mật khẩu được lưu dạng hash trên máy chủ. Phiên đăng nhập sử dụng cookie HttpOnly.</div>
        <p className="mt-7 text-center text-sm text-[#748779]">{isRegistration ? "Đã có tài khoản?" : "Chưa có tài khoản?"} <Link className="font-bold text-forest underline" to={(isRegistration ? "/login" : "/register") + "?returnTo=" + encodeURIComponent(returnTo)}>{isRegistration ? "Đăng nhập" : "Đăng ký"}</Link></p>
      </section>
    </main>
  );
}
