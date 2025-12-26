"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import Swal from "sweetalert2";
import { useLang } from "../../providers";

type ProductStatus = "available" | "stopped";
type ProductCategory = "drinks" | "food" | "other";

type Product = {
  code: string;
  name: string;
  category: ProductCategory;
  costPrice: number; // سعر التكلفة الصافي
  extraAmount: number; // الزيادة
  status: ProductStatus;
  notes: string;
};

type ProductFormState = {
  code: string;
  name: string;
  category: ProductCategory | "";
  costPrice: string;
  extraAmount: string;
  status: ProductStatus;
  notes: string;
};

export default function AdminProductsPage() {
  const { lang } = useLang();

  const t = {
    ar: {
      searchTitle: "بحث في المنتجات",
      searchSub: "فلترة حسب الاسم أو التصنيف أو الحالة",
      name: "اسم المنتج",
      category: "التصنيف",
      status: "الحالة",
      all: "الكل",
      drinks: "مشروبات",
      food: "أطعمة",
      other: "أخرى",
      available: "متاح",
      stopped: "متوقف",
      search: "بحث",
      clear: "مسح",
      listTitle: "قائمة المنتجات",
      listSub:
        "أي تعديل هنا سيظهر فورًا للمستخدمين عند تسجيل أوردرات جديدة",
      code: "الكود",
      price: "السعر (جنيه)", // لم نعد نستخدمه مباشرة، احتفظنا به لو احتجته لاحقاً
      notes: "ملاحظات",
      actions: "إجراءات",
      formTitle: "نموذج منتج (إضافة / تعديل)",
      formSub:
        "فور الحفظ سيتم تحديث المنتج ويظهر للمستخدمين في شاشة الأوردرات",
      save: "حفظ المنتج",
      cancel: "إلغاء",
      confirmDeleteTitle: "حذف المنتج؟",
      confirmDeleteText: "سيتم حذف المنتج ولن يظهر للمستخدمين",
      yesDelete: "نعم، احذف",
      deleted: "تم الحذف بنجاح",
      saved: "تم حفظ المنتج",
      // الأسعار
      costPrice: "سعر التكلفة (صافي)",
      extraAmount: "الزيادة على المنتج",
      finalPrice: "السعر النهائي (للعميل)",
      // بحث
      noProducts: "لا توجد منتجات مطابقة للفلاتر الحالية.",
      required:
        "من فضلك املأ الكود، اسم المنتج، التصنيف، وسعر التكلفة.",
      amountInvalid: "من فضلك أدخل أرقامًا صحيحة للتكلفة والزيادة.",
    },
    en: {
      searchTitle: "Search products",
      searchSub: "Filter by name, category or status",
      name: "Product name",
      category: "Category",
      status: "Status",
      all: "All",
      drinks: "Drinks",
      food: "Food",
      other: "Other",
      available: "Available",
      stopped: "Disabled",
      search: "Search",
      clear: "Clear",
      listTitle: "Products list",
      listSub:
        "Any change here will show immediately for users when creating orders",
      code: "Code",
      price: "Price (EGP)", // not used directly now, kept for compatibility
      notes: "Notes",
      actions: "Actions",
      formTitle: "Product form (add / edit)",
      formSub:
        "Once saved, product will be updated for users in orders screen",
      save: "Save product",
      cancel: "Cancel",
      confirmDeleteTitle: "Delete product?",
      confirmDeleteText: "This product will be removed from users",
      yesDelete: "Yes, delete",
      deleted: "Product deleted",
      saved: "Product saved",
      // prices
      costPrice: "Net cost price",
      extraAmount: "Added margin",
      finalPrice: "Final price (customer)",
      finalPriceHint:
        "Calculated automatically = cost + margin. This is what users see and what is written to the orders sheet.",
      // search
      noProducts: "No products match the current filters.",
      required:
        "Please fill code, product name, category and cost price.",
      amountInvalid:
        "Please enter valid numeric values for cost and margin.",
    },
  }[lang];

  // حالة المنتجات في الواجهة (الـ API مازال TODO)
  const [products, setProducts] = useState<Product[]>([
    {
      code: "P-001",
      name: lang === "ar" ? "بيبسي 330 مل" : "Pepsi 330 ml",
      category: "drinks",
      costPrice: 10,
      extraAmount: 5,
      status: "available",
      notes: "",
    },
  ]);

  // فلاتر البحث
  const [searchName, setSearchName] = useState<string>("");
  const [searchCategory, setSearchCategory] = useState<
    "all" | ProductCategory
  >("all");
  const [searchStatus, setSearchStatus] = useState<
    "all" | ProductStatus
  >("all");

  // حالة الفورم
  const [form, setForm] = useState<ProductFormState>({
    code: "",
    name: "",
    category: "",
    costPrice: "",
    extraAmount: "",
    status: "available",
    notes: "",
  });
  const [editingCode, setEditingCode] = useState<string | null>(
    null
  );

  const finalPrice =
    (Number(form.costPrice) || 0) +
    (Number(form.extraAmount) || 0);

  const handleFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  function resetForm() {
    setEditingCode(null);
    setForm({
      code: "",
      name: "",
      category: "",
      costPrice: "",
      extraAmount: "",
      status: "available",
      notes: "",
    });
  }

  function handleSaveProduct(e: FormEvent) {
    e.preventDefault();

    if (
      !form.code.trim() ||
      !form.name.trim() ||
      !form.category ||
      !form.costPrice.trim()
    ) {
      Swal.fire({ icon: "warning", title: t.required });
      return;
    }

    const cost = Number(form.costPrice);
    const extra = Number(form.extraAmount || "0");

    if (
      Number.isNaN(cost) ||
      cost < 0 ||
      Number.isNaN(extra) ||
      extra < 0
    ) {
      Swal.fire({ icon: "warning", title: t.amountInvalid });
      return;
    }

    const newProduct: Product = {
      code: form.code.trim(),
      name: form.name.trim(),
      category: form.category as ProductCategory,
      costPrice: cost,
      extraAmount: extra,
      status: form.status,
      notes: form.notes.trim(),
    };

    setProducts((prev) => {
      const index = prev.findIndex(
        (p) => p.code === newProduct.code
      );
      if (index === -1) {
        return [...prev, newProduct];
      }
      const clone = [...prev];
      clone[index] = newProduct;
      return clone;
    });

    resetForm();
    Swal.fire({ icon: "success", title: t.saved });

    // TODO: هنا تقدر تستدعي API فعلي لحفظ المنتج في ملف أو DB
    // await fetch("/api/products", { method: "POST", body: JSON.stringify(newProduct) })
  }

  function handleEditProduct(product: Product) {
    setEditingCode(product.code);
    setForm({
      code: product.code,
      name: product.name,
      category: product.category,
      costPrice: String(product.costPrice),
      extraAmount: String(product.extraAmount),
      status: product.status,
      notes: product.notes,
    });
  }

  function handleDeleteProduct(code: string) {
    Swal.fire({
      title: t.confirmDeleteTitle,
      text: t.confirmDeleteText,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t.yesDelete,
    }).then((r) => {
      if (r.isConfirmed) {
        setProducts((prev) =>
          prev.filter((p) => p.code !== code)
        );
        if (editingCode === code) {
          resetForm();
        }
        Swal.fire({ icon: "success", title: t.deleted });

        // TODO: API DELETE حقيقي
        // await fetch(`/api/products/${code}`, { method: "DELETE" })
      }
    });
  }

  function handleClearFilters() {
    setSearchName("");
    setSearchCategory("all");
    setSearchStatus("all");
  }

  const filteredProducts = products.filter((p) => {
    const nameMatch = searchName
      ? p.name
          .toLowerCase()
          .includes(searchName.toLowerCase())
      : true;

    const categoryMatch =
      searchCategory === "all" ||
      p.category === searchCategory;

    const statusMatch =
      searchStatus === "all" || p.status === searchStatus;

    return nameMatch && categoryMatch && statusMatch;
  });

  return (
    <>
      {/* بحث في المنتجات */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">{t.searchTitle}</div>
            <div className="panel-subtitle">{t.searchSub}</div>
          </div>
        </div>
        <div
          className="filters"
          style={{ marginTop: "0.8rem" }}
        >
          <div className="filter-group">
            <label className="filter-label">{t.name}</label>
            <input
              className="filter-input"
              placeholder={
                lang === "ar"
                  ? "ابحث باسم المنتج..."
                  : "Search..."
              }
              value={searchName}
              onChange={(e) =>
                setSearchName(e.target.value)
              }
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">
              {t.category}
            </label>
            <select
              className="filter-select"
              value={searchCategory}
              onChange={(e) =>
                setSearchCategory(
                  e.target.value as "all" | ProductCategory
                )
              }
            >
              <option value="all">{t.all}</option>
              <option value="drinks">{t.drinks}</option>
              <option value="food">{t.food}</option>
              <option value="other">{t.other}</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">
              {t.status}
            </label>
            <select
              className="filter-select"
              value={searchStatus}
              onChange={(e) =>
                setSearchStatus(
                  e.target.value as "all" | ProductStatus
                )
              }
            >
              <option value="all">{t.all}</option>
              <option value="available">
                {t.available}
              </option>
              <option value="stopped">
                {t.stopped}
              </option>
            </select>
          </div>
          <div className="filters-actions">
            <button
              className="btn btn-primary"
              type="button"
            >
              {t.search}
            </button>
            <button
              className="btn"
              type="button"
              onClick={handleClearFilters}
            >
              {t.clear}
            </button>
          </div>
        </div>
      </section>

      {/* جدول المنتجات مع الأسعار الثلاثة */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">{t.listTitle}</div>
            <div className="panel-subtitle">
              {t.listSub}
            </div>
          </div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>{t.code}</th>
                <th>{t.name}</th>
                <th>{t.category}</th>
                <th>{t.costPrice}</th>
                <th>{t.extraAmount}</th>
                <th>{t.finalPrice}</th>
                <th>{t.status}</th>
                <th>{t.notes}</th>
                <th>{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      textAlign: "center",
                      padding: "0.8rem",
                    }}
                  >
                    {t.noProducts}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const final = p.costPrice + p.extraAmount;
                  return (
                    <tr key={p.code}>
                      <td>{p.code}</td>
                      <td>{p.name}</td>
                      <td>
                        {p.category === "drinks"
                          ? t.drinks
                          : p.category === "food"
                          ? t.food
                          : t.other}
                      </td>
                      <td>
                        {p.costPrice.toLocaleString(
                          lang === "ar"
                            ? "ar-EG"
                            : "en-US"
                        )}
                      </td>
                      <td>
                        {p.extraAmount.toLocaleString(
                          lang === "ar"
                            ? "ar-EG"
                            : "en-US"
                        )}
                      </td>
                      <td>
                        {final.toLocaleString(
                          lang === "ar"
                            ? "ar-EG"
                            : "en-US"
                        )}
                      </td>
                      <td>
                        <span
                          className={
                            "status-pill " +
                            (p.status === "available"
                             
                              ? "status-delivered"
                              : "status-pending")
                          }
                        >
                          {p.status === "available"
                            ? t.available
                            : t.stopped}
                        </span>
                      </td>
                      <td>{p.notes || "-"}</td>
                      <td>
                        <div className="actions">
                          <button
                            type="button"
                            onClick={() =>
                              handleEditProduct(p)
                            }
                          >
                            {lang === "ar"
                              ? "تعديل"
                              : "Edit"}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteProduct(p.code)
                            }
                          >
                            {lang === "ar"
                              ? "حذف"
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* فورم إضافة / تعديل منتج مع التكلفة + الزيادة + السعر النهائي */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">{t.formTitle}</div>
            <div className="panel-subtitle">{t.formSub}</div>
          </div>
        </div>
        <form
          className="filters"
          style={{ marginTop: 0 }}
          onSubmit={handleSaveProduct}
        >
          <div className="filter-group">
            <label className="filter-label">
              {t.code}
            </label>
            <input
              className="filter-input"
              name="code"
              value={form.code}
              onChange={handleFormChange}
              placeholder="P-010"
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">
              {t.name}
            </label>
            <input
              className="filter-input"
              name="name"
              value={form.name}
              onChange={handleFormChange}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">
              {t.category}
            </label>
            <select
              className="filter-select"
              name="category"
              value={form.category}
              onChange={handleFormChange}
            >
              <option value="">
                {lang === "ar"
                  ? "اختر التصنيف"
                  : "Choose category"}
              </option>
              <option value="drinks">
                {t.drinks}
              </option>
              <option value="food">{t.food}</option>
              <option value="other">
                {t.other}
              </option>
            </select>
          </div>

          {/* سعر التكلفة الصافي */}
          <div className="filter-group">
            <label className="filter-label">
              {t.costPrice}
            </label>
            <input
              type="number"
              className="filter-input"
              name="costPrice"
              min={0}
              step={0.5}
              value={form.costPrice}
              onChange={handleFormChange}
            />
          </div>

          {/* الزيادة على المنتج */}
          <div className="filter-group">
            <label className="filter-label">
              {t.extraAmount}
            </label>
            <input
              type="number"
              className="filter-input"
              name="extraAmount"
              min={0}
              step={0.5}
              value={form.extraAmount}
              onChange={handleFormChange}
            />
          </div>

          {/* السعر النهائي (محسوب فقط) */}
          <div className="filter-group">
            <label className="filter-label">
              {t.finalPrice}
            </label>
            <input
              className="filter-input"
              value={
                form.costPrice || form.extraAmount
                  ? finalPrice.toLocaleString(
                      lang === "ar"
                        ? "ar-EG"
                        : "en-US"
                    )
                  : ""
              }
              readOnly
              disabled
            />
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                marginTop: "0.2rem",
              }}
            >
              {t.finalPriceHint}
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">
              {t.status}
            </label>
            <select
              className="filter-select"
              name="status"
              value={form.status}
              onChange={handleFormChange}
            >
              <option value="available">
                {t.available}
              </option>
              <option value="stopped">
                {t.stopped}
              </option>
            </select>
          </div>

          <div className="filter-group" style={{ flex: 2 }}>
            <label className="filter-label">
              {t.notes}
            </label>
            <input
              className="filter-input"
              name="notes"
              value={form.notes}
              onChange={handleFormChange}
            />
          </div>

          <div className="filters-actions">
            <button
              className="btn btn-primary"
              type="submit"
            >
              {t.save}
            </button>
            <button
              className="btn"
              type="button"
              onClick={resetForm}
            >
              {t.cancel}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
