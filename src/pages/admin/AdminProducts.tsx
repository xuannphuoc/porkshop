import { useState } from "react";
import type { FormEvent } from "react";
import { Edit3, Plus, Save, Trash2, X } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import type { Product, ProductCategory } from "../../features/products/types/products";
import { formatCurrency, formatWeight } from "../../utils/format";

const emptyProduct: Product = {
  id: "", name: "", category: "thit-tuoi", pricePerKg: 0, stockKg: 0,
  description: "", image: "", origin: "Trang trại liên kết tại Việt Nam", featured: false, rating: 4.8,
};

export default function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useShop();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product>(emptyProduct);
  const [editingExistingProduct, setEditingExistingProduct] = useState(false);
  const [formError, setFormError] = useState("");

  function openCreateProduct() {
    setEditingExistingProduct(false);
    setEditingProduct({ ...emptyProduct });
    setFormError("");
    setFormOpen(true);
  }

  function openEditProduct(product: Product) {
    setEditingExistingProduct(true);
    setEditingProduct({ ...product });
    setFormError("");
    setFormOpen(true);
  }

  function updateProductField(fieldName: keyof Product, value: string | number | boolean) {
    setEditingProduct(function (previousProduct) {
      return { ...previousProduct, [fieldName]: value };
    });
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const productId = editingProduct.id.trim().toUpperCase();

    if (productId === "" || editingProduct.name.trim() === "") {
      setFormError("Vui lòng nhập mã và tên sản phẩm.");
      return;
    }
    if (Number.isFinite(editingProduct.pricePerKg) === false || editingProduct.pricePerKg <= 0) {
      setFormError("Giá sản phẩm phải lớn hơn 0.");
      return;
    }
    if (Number.isFinite(editingProduct.stockKg) === false || editingProduct.stockKg < 0 ||
        Math.round(editingProduct.stockKg * 2) !== editingProduct.stockKg * 2) {
      setFormError("Tồn kho phải là số không âm và chia hết cho 0,5 kg.");
      return;
    }
    const productToSave = { ...editingProduct, id: productId, name: editingProduct.name.trim() };
    if (editingExistingProduct === true) {
      const updated = await updateProduct(productToSave);
      if (updated) setFormOpen(false);
      else setFormError("Không thể cập nhật sản phẩm. Kiểm tra thông báo trên màn hình.");
    } else {
      const created = await addProduct(productToSave);
      if (created === true) {
        setFormOpen(false);
      } else {
        setFormError("Mã sản phẩm đã tồn tại. Vui lòng chọn mã khác.");
      }
    }
  }

  async function confirmDelete(product: Product) {
    const confirmed = window.confirm("Bạn có chắc muốn xóa " + product.name + " khỏi bản demo?");
    if (confirmed === true) {
      await deleteProduct(product.id);
    }
  }

  return (
    <section className="mt-8 rounded-[20px] border border-[#e6ece6] bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-forest">Danh sách sản phẩm</h2>
          <p className="mt-1 text-xs text-[#899a8d]">Thêm, sửa, xóa và cập nhật tồn kho trong bản demo.</p>
        </div>
        <button type="button" className="btn-main" onClick={openCreateProduct}><Plus size={17} /> Thêm sản phẩm</button>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#eaf0e8] text-xs font-bold text-[#8b9c90]">
              <th className="py-4">Mã</th><th>Sản phẩm</th><th>Đơn giá /kg</th><th>Tồn kho</th><th className="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map(function (product) {
              return (
                <tr key={product.id} className="border-b border-[#f0f2ee] last:border-b-0">
                  <td className="py-4 text-xs font-bold text-[#8e9e94]">{product.id}</td>
                  <td className="py-4 font-bold text-forest">{product.name}</td>
                  <td>{formatCurrency(product.pricePerKg)}</td>
                  <td><span className={product.stockKg < 5 ? "font-bold text-[#c07355]" : "text-[#648b71]"}>{formatWeight(product.stockKg)}</span></td>
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" aria-label={"Sửa " + product.name} onClick={function () { openEditProduct(product); }} className="rounded-lg border border-[#e3eae0] p-2 text-forest hover:bg-[#f0f6ef]"><Edit3 size={16} /></button>
                      <button type="button" aria-label={"Xóa " + product.name} onClick={function () { void confirmDelete(product); }} className="rounded-lg border border-[#f2e4df] p-2 text-[#c47962] hover:bg-[#fff0eb]"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {formOpen === true && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#173a2e]/60 px-3 py-6" role="dialog" aria-modal="true" aria-label={editingExistingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}>
          <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-[22px] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-forest">{editingExistingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
              <button type="button" aria-label="Đóng" className="rounded-full border border-[#e2eae3] p-2" onClick={function () { setFormOpen(false); }}><X size={20} /></button>
            </div>
            <form onSubmit={saveProduct} className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-bold text-[#64796c]">Mã sản phẩm
                <input className="field mt-2" disabled={editingExistingProduct} value={editingProduct.id} onChange={function (event) { updateProductField("id", event.target.value); }} placeholder="P013" />
              </label>
              <label className="text-xs font-bold text-[#64796c]">Tên sản phẩm
                <input className="field mt-2" value={editingProduct.name} onChange={function (event) { updateProductField("name", event.target.value); }} placeholder="Thịt heo..." />
              </label>
              <label className="text-xs font-bold text-[#64796c]">Danh mục
                <select className="field mt-2" value={editingProduct.category} onChange={function (event) { updateProductField("category", event.target.value as ProductCategory); }}>
                  <option value="thit-tuoi">Thịt tươi</option><option value="suon">Sườn & xương</option><option value="noi-tang">Nội tạng</option><option value="che-bien">Chế biến</option>
                </select>
              </label>
              <label className="text-xs font-bold text-[#64796c]">Giá /kg (VND)
                <input className="field mt-2" type="number" min="1" value={editingProduct.pricePerKg} onChange={function (event) { updateProductField("pricePerKg", Number(event.target.value)); }} />
              </label>
              <label className="text-xs font-bold text-[#64796c]">Tồn kho (kg)
                <input className="field mt-2" type="number" min="0" step="0.5" value={editingProduct.stockKg} onChange={function (event) { updateProductField("stockKg", Number(event.target.value)); }} />
              </label>
              <label className="text-xs font-bold text-[#64796c]">URL ảnh sản phẩm
                <input className="field mt-2" value={editingProduct.image} onChange={function (event) { updateProductField("image", event.target.value); }} placeholder="https://..." />
              </label>
              <label className="text-xs font-bold text-[#64796c] sm:col-span-2">Mô tả sản phẩm
                <textarea className="field mt-2" rows={3} value={editingProduct.description} onChange={function (event) { updateProductField("description", event.target.value); }} />
              </label>
              <label className="flex items-center gap-3 text-xs font-bold text-[#64796c] sm:col-span-2">
                <input type="checkbox" checked={editingProduct.featured} onChange={function (event) { updateProductField("featured", event.target.checked); }} className="accent-[#153f34]" /> Sản phẩm nổi bật trên trang chủ
              </label>
              {formError !== "" && <p role="alert" className="rounded-xl bg-[#fff0e9] p-3 text-xs font-bold text-[#b45b43] sm:col-span-2">{formError}</p>}
              <div className="flex justify-end gap-3 sm:col-span-2">
                <button type="button" className="btn-outline" onClick={function () { setFormOpen(false); }}>Hủy</button>
                <button type="submit" className="btn-main"><Save size={17} /> Lưu sản phẩm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
