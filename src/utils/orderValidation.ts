import type { CustomerInformation } from "../features/products/types/products";

export function validateCustomerInformation(customer: CustomerInformation): string | null {
  if (customer.fullName.trim().length < 2) {
    return "Vui lòng nhập họ và tên hợp lệ.";
  }

  const phoneNumber = customer.phone.trim();
  if (/^0[0-9]{9}$/.test(phoneNumber) === false) {
    return "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.";
  }

  const email = customer.email.trim();
  if (email !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) === false) {
    return "Địa chỉ email chưa đúng định dạng.";
  }

  if (customer.district.trim() === "" || customer.address.trim().length < 5) {
    return "Vui lòng nhập khu vực và địa chỉ nhận hàng.";
  }

  if (customer.paymentMethod !== "cod" && customer.paymentMethod !== "transfer") {
    return "Phương thức thanh toán không hợp lệ.";
  }

  return null;
}
