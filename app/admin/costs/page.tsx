"use client";

import {
  useState,
  useEffect,
  FormEvent,
  ChangeEvent,
} from "react";
import Swal from "sweetalert2";
import { useLang } from "../../providers";

type Cost = {
  id: number;
  type: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
};

type CostFormState = {
  type: string;
  description: string;
  amount: string;
  date: string;
};

type OrderIncomeRow = {
  date: string; // YYYY-MM-DD (normalized)
  amount: number;
};

export default function AdminCostsPage() {
  const { lang } = useLang();

  const tr = {
    ar: {
      pageTitle: "إدارة المصروفات",
      pageSub:
        "سجّل جميع المصروفات (رواتب، حملات، إيجار، …) وتابعها حسب الشهر والسنة.",
      addTitle: "إضافة مصروف جديد",
      addSub:
        "املأ بيانات المصروف وسيتم إضافته إلى السجل الحالي.",
      type: "نوع المصروف",
      typePlaceholder: "اختر نوع المصروف",
      typeEmployees: "رواتب الموظفين",
      typeMarketing: "الحملات الإعلانية",
      typeRent: "إيجار ومقر",
      typeDelivery: "شحن وتوصيل",
      typeOther: "مصروفات أخرى",
      description: "الوصف",
      descriptionPlaceholder: "مثال: حملة فيسبوك، راتب شهر ديسمبر،…",
      amount: "المبلغ (جنيه)",
      date: "التاريخ",
      addCost: "إضافة المصروف",
      filtersTitle: "فلترة وعرض المصروفات",
      month: "الشهر",
      year: "السنة",
      allMonths: "كل الشهور",
      totalForPeriod: "إجمالي المصروفات في الفترة المحددة",
      totalAll: "إجمالي المصروفات الكلي",
      countForPeriod: "عدد العمليات في الفترة",
      ordersIncomeForPeriod: "دخل الأوردرات في الفترة المحددة",
      netForPeriod: "الصافي (الدخل - المصروفات)",
      ordersLoading: "جاري تحميل دخل الأوردرات...",
      ordersError:
        "تعذر تحميل دخل الأوردرات من شيت الأوردرات.",
      tableTitle: "سجل المصروفات",
      tableSub: "جميع المصروفات المسجلة حسب الفلتر الحالي.",
      colType: "النوع",
      colDesc: "الوصف",
      colAmount: "المبلغ",
      colDate: "التاريخ",
      colActions: "إجراءات",
      delete: "حذف",
      confirmTitle: "حذف المصروف؟",
      confirmText: "سيتم حذف هذا المصروف نهائياً من السجل.",
      confirmYes: "نعم، احذف",
      canceled: "تم الإلغاء",
      deleted: "تم حذف المصروف بنجاح",
      required:
        "من فضلك املأ نوع المصروف، المبلغ، والتاريخ.",
      amountInvalid: "من فضلك أدخل مبلغاً صحيحاً.",
      noData: "لا توجد مصروفات في الفلتر الحالي.",
      // months
      m1: "يناير",
      m2: "فبراير",
      m3: "مارس",
      m4: "أبريل",
      m5: "مايو",
      m6: "يونيو",
      m7: "يوليو",
      m8: "أغسطس",
      m9: "سبتمبر",
      m10: "أكتوبر",
      m11: "نوفمبر",
      m12: "ديسمبر",
    },
    en: {
      pageTitle: "Costs management",
      pageSub:
        "Track all business expenses (salaries, campaigns, rent, …) filtered by month and year.",
      addTitle: "Add new expense",
      addSub:
        "Fill the expense details to add it to the current log.",
      type: "Expense type",
      typePlaceholder: "Choose expense type",
      typeEmployees: "Employees salaries",
      typeMarketing: "Marketing campaigns",
      typeRent: "Rent & office",
      typeDelivery: "Shipping & delivery",
      typeOther: "Other expenses",
      description: "Description",
      descriptionPlaceholder:
        "Example: Facebook campaign, December salaries…",
      amount: "Amount (EGP)",
      date: "Date",
      addCost: "Add expense",
      filtersTitle: "Filter and view expenses",
      month: "Month",
      year: "Year",
      allMonths: "All months",
      totalForPeriod: "Total expenses in selected period",
      totalAll: "Total expenses (all time)",
      countForPeriod: "Operations in period",
      ordersIncomeForPeriod: "Orders income in selected period",
      netForPeriod: "Net (income - costs)",
      ordersLoading: "Loading orders income...",
      ordersError:
        "Failed to load orders income from orders sheet.",
      tableTitle: "Expenses log",
      tableSub: "All expenses based on current filter.",
      colType: "Type",
      colDesc: "Description",
      colAmount: "Amount",
      colDate: "Date",
      colActions: "Actions",
      delete: "Delete",
      confirmTitle: "Delete expense?",
      confirmText: "This expense will be permanently removed.",
      confirmYes: "Yes, delete",
      canceled: "Cancelled",
      deleted: "Expense deleted successfully",
      required: "Please fill type, amount, and date.",
      amountInvalid: "Please enter a valid amount.",
      noData: "No expenses for the selected filter.",
      // months
      m1: "January",
      m2: "February",
      m3: "March",
      m4: "April",
      m5: "May",
      m6: "June",
      m7: "July",
      m8: "August",
      m9: "September",
      m10: "October",
      m11: "November",
      m12: "December",
    },
  }[lang];

  const [costs, setCosts] = useState<Cost[]>([]);

  // دخل الأوردرات من شيت الأوردرات
  const [ordersIncomeRows, setOrdersIncomeRows] = useState<
    OrderIncomeRow[]
  >([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(
    null
  );

  const [form, setForm] = useState<CostFormState>({
    type: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  // فلتر الشهر/السنة (نفسهم نستخدمهم للمصاريف + دخل الأوردرات)
  const [filterMonth, setFilterMonth] = useState<string>("");
  const [filterYear, setFilterYear] = useState<string>("");

  const monthsOptions = [
    { value: "", label: tr.allMonths },
    { value: "1", label: tr.m1 },
    { value: "2", label: tr.m2 },
    { value: "3", label: tr.m3 },
    { value: "4", label: tr.m4 },
    { value: "5", label: tr.m5 },
    { value: "6", label: tr.m6 },
    { value: "7", label: tr.m7 },
    { value: "8", label: tr.m8 },
    { value: "9", label: tr.m9 },
    { value: "10", label: tr.m10 },
    { value: "11", label: tr.m11 },
    { value: "12", label: tr.m12 },
  ];

  // تحميل دخل الأوردرات من API /api/orders/list
  useEffect(() => {
    async function loadOrdersIncome() {
      try {
        setOrdersLoading(true);
        setOrdersError(null);

        const res = await fetch("/api/orders/list");
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const txt = await res.text();
          console.error(
            "[AdminCostsPage] Non-JSON response from /api/orders/list:",
            contentType,
            txt.slice(0, 200)
          );
          throw new Error("Non-JSON response from /api/orders/list");
        }

        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || `HTTP ${res.status}`);
        }

        const rows: any[] = Array.isArray(data.rows)
          ? data.rows
          : [];
        const mapped: OrderIncomeRow[] = rows.map(
          mapOrderIncomeRow
        );

        setOrdersIncomeRows(mapped);
      } catch (err: any) {
        console.error(err);
        setOrdersIncomeRows([]);
        setOrdersError(tr.ordersError);
      } finally {
        setOrdersLoading(false);
      }
    }

    loadOrdersIncome();
  }, [tr.ordersError]);

  const handleFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddCost = (e: FormEvent) => {
    e.preventDefault();

    if (!form.type.trim() || !form.amount.trim() || !form.date.trim()) {
      Swal.fire({ icon: "warning", title: tr.required });
      return;
    }

    const amount = Number(form.amount);
    if (isNaN(amount) || amount <= 0) {
      Swal.fire({ icon: "warning", title: tr.amountInvalid });
      return;
    }

    const newCost: Cost = {
      id: Date.now(),
      type: form.type,
      description: form.description.trim(),
      amount,
      date: form.date,
    };

    setCosts((prev) => [newCost, ...prev]);

    setForm((prev) => ({
      ...prev,
      description: "",
      amount: "",
    }));

    Swal.fire({
      icon: "success",
      title: lang === "ar" ? "تم إضافة المصروف" : "Expense added",
    });

    // هنا تقدر تبعت المصروف لـ API حقيقي لو حابب
    // await fetch("/api/costs", { method: "POST", body: JSON.stringify(newCost) })
  };

  const handleDeleteCost = (id: number) => {
    Swal.fire({
      title: tr.confirmTitle,
      text: tr.confirmText,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: tr.confirmYes,
    }).then((result) => {
      if (result.isConfirmed) {
        setCosts((prev) => prev.filter((c) => c.id !== id));
        Swal.fire({ icon: "success", title: tr.deleted });
      } else {
        Swal.fire({ icon: "info", title: tr.canceled });
      }
    });
  };

  // دالة مساعدة لتحديد إذا كان التاريخ داخل الفلتر الحالي
  const isInCurrentPeriod = (dateStr: string) => {
    if (!dateStr) return false;
    const [yearStr, monthStr] = dateStr.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);

    if (filterYear && year !== Number(filterYear)) return false;
    if (filterMonth && month !== Number(filterMonth)) return false;

    return true;
  };

  // مصروفات حسب الفلتر
  const filteredCosts = costs.filter((cost) =>
    isInCurrentPeriod(cost.date)
  );

  const totalForPeriod = filteredCosts.reduce(
    (sum, c) => sum + c.amount,
    0
  );
  const totalAll = costs.reduce((sum, c) => sum + c.amount, 0);

  // دخل الأوردرات حسب الفلتر
  const ordersIncomeForPeriod = ordersIncomeRows.reduce(
    (sum, o) =>
      isInCurrentPeriod(o.date) ? sum + o.amount : sum,
    0
  );

  const netForPeriod =
    ordersIncomeForPeriod - totalForPeriod;

  return (
    <>
      {/* قسم إضافة مصروف جديد */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">{tr.pageTitle}</div>
            <div className="panel-subtitle">{tr.pageSub}</div>
          </div>
        </div>

        <form onSubmit={handleAddCost}>
          <div
            className="panel-header"
            style={{ marginBottom: "0.6rem" }}
          >
            <div>
              <div
                className="panel-title"
                style={{ fontSize: "0.9rem" }}
              >
                {tr.addTitle}
              </div>
              <div className="panel-subtitle">
                {tr.addSub}
              </div>
            </div>
          </div>

          <div
            className="filters"
            style={{ marginTop: 0 }}
          >
            <div className="filter-group">
              <label className="filter-label">
                {tr.type}
              </label>
              <select
                className="filter-select"
                name="type"
                value={form.type}
                onChange={handleFormChange}
              >
                <option value="">
                  {tr.typePlaceholder}
                </option>
                <option value="employees">
                  {tr.typeEmployees}
                </option>
                <option value="marketing">
                  {tr.typeMarketing}
                </option>
                <option value="rent">
                  {tr.typeRent}
                </option>
                <option value="delivery">
                  {tr.typeDelivery}
                </option>
                <option value="other">
                  {tr.typeOther}
                </option>
              </select>
            </div>

            <div
              className="filter-group"
              style={{ flex: 2 }}
            >
              <label className="filter-label">
                {tr.description}
              </label>
              <input
                className="filter-input"
                name="description"
                value={form.description}
                onChange={handleFormChange}
                placeholder={tr.descriptionPlaceholder}
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">
                {tr.amount}
              </label>
              <input
                className="filter-input"
                name="amount"
                type="number"
                min={0}
                step={0.5}
                value={form.amount}
                onChange={handleFormChange}
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">
                {tr.date}
              </label>
              <input
                className="filter-input"
                name="date"
                type="date"
                value={form.date}
                onChange={handleFormChange}
              />
            </div>

            <div className="filters-actions">
              <button
                type="submit"
                className="btn btn-primary"
              >
                {tr.addCost}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* قسم الفلترة + السجل + دخل الأوردرات + الصافي */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">
              {tr.filtersTitle}
            </div>
          </div>
        </div>

        {/* الفلترة بالشهر والسنة + الأرقام السريعة */}
        <div
          className="filters"
          style={{
            marginTop: 0,
            marginBottom: "1rem",
          }}
        >
          <div className="filter-group">
            <label className="filter-label">
              {tr.month}
            </label>
            <select
              className="filter-select"
              value={filterMonth}
              onChange={(e) =>
                setFilterMonth(e.target.value)
              }
            >
              {monthsOptions.map((m) => (
                <option
                  key={m.value}
                  value={m.value}
                >
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">
              {tr.year}
            </label>
            <input
              className="filter-input"
              type="number"
              min={2000}
              max={2100}
              value={filterYear}
              onChange={(e) =>
                setFilterYear(e.target.value)
              }
              placeholder={
                lang === "ar"
                  ? "مثال: 2025"
                  : "e.g. 2025"
              }
            />
          </div>

          {/* إجمالي مصروفات الفترة */}
          <div className="filter-group">
            <label className="filter-label">
              {tr.totalForPeriod}
            </label>
            <div
              style={{
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              {totalForPeriod.toLocaleString(
                lang === "ar" ? "ar-EG" : "en-US"
              )}
            </div>
          </div>

          {/* إجمالي المصروفات الكلي */}
          <div className="filter-group">
            <label className="filter-label">
              {tr.totalAll}
            </label>
            <div
              style={{
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              {totalAll.toLocaleString(
                lang === "ar" ? "ar-EG" : "en-US"
              )}
            </div>
          </div>

          {/* عدد العمليات في الفترة */}
          <div className="filter-group">
            <label className="filter-label">
              {tr.countForPeriod}
            </label>
            <div
              style={{
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              {filteredCosts.length}
            </div>
          </div>

          {/* دخل الأوردرات في الفترة */}
          <div className="filter-group">
            <label className="filter-label">
              {tr.ordersIncomeForPeriod}
            </label>
            <div
              style={{
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              {ordersIncomeForPeriod.toLocaleString(
                lang === "ar" ? "ar-EG" : "en-US"
              )}
            </div>
            {ordersLoading && (
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                  marginTop: "0.15rem",
                }}
              >
                {tr.ordersLoading}
              </div>
            )}
            {ordersError && (
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--danger)",
                  marginTop: "0.15rem",
                }}
              >
                {ordersError}
              </div>
            )}
          </div>

          {/* الصافي (دخل - مصروفات) */}
          <div className="filter-group">
            <label className="filter-label">
              {tr.netForPeriod}
            </label>
            <div
              style={{
                fontWeight: 700,
                fontSize: "0.9rem",
                color:
                  netForPeriod < 0
                    ? "var(--danger)"
                    : netForPeriod > 0
                    ? "var(--success)"
                    : "inherit",
              }}
            >
              {netForPeriod.toLocaleString(
                lang === "ar" ? "ar-EG" : "en-US"
              )}
            </div>
          </div>
        </div>

        {/* جدول السجل */}
        <div
          className="panel-header"
          style={{ marginBottom: "0.6rem" }}
        >
          <div>
            <div
              className="panel-title"
              style={{ fontSize: "0.9rem" }}
            >
              {tr.tableTitle}
            </div>
            <div className="panel-subtitle">
              {tr.tableSub}
            </div>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>{tr.colType}</th>
                <th>{tr.colDesc}</th>
                <th>{tr.colAmount}</th>
                <th>{tr.colDate}</th>
                <th>{tr.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredCosts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "0.8rem",
                    }}
                  >
                    {tr.noData}
                  </td>
                </tr>
              ) : (
                filteredCosts.map((cost, index) => (
                  <tr key={cost.id}>
                    <td>{index + 1}</td>
                    <td>
                      {(() => {
                        switch (cost.type) {
                          case "employees":
                            return tr.typeEmployees;
                          case "marketing":
                            return tr.typeMarketing;
                          case "rent":
                            return tr.typeRent;
                          case "delivery":
                            return tr.typeDelivery;
                          case "other":
                          default:
                            return tr.typeOther;
                        }
                      })()}
                    </td>
                    <td>{cost.description || "-"}</td>
                    <td>
                      {cost.amount.toLocaleString(
                        lang === "ar"
                          ? "ar-EG"
                          : "en-US"
                      )}
                    </td>
                    <td>{cost.date}</td>
                    <td>
                      <div className="actions">
                        <button
                          onClick={() =>
                            handleDeleteCost(cost.id)
                          }
                        >
                          {tr.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

/* === Helpers === */

function mapOrderIncomeRow(r: any): OrderIncomeRow {
  // التاريخ
  const createdRaw =
    r.Created ??
    r.created ??
    r["CreatedAt"] ??
    r["التسجيل"] ??
    r["Date"] ??
    r["OrderDate"] ??
    "";

  let dateStr = "";

  if (createdRaw instanceof Date) {
    const yyyy = createdRaw.getFullYear();
    const mm = String(createdRaw.getMonth() + 1).padStart(
      2,
      "0"
    );
    const dd = String(createdRaw.getDate()).padStart(2, "0");
    dateStr = `${yyyy}-${mm}-${dd}`;
  } else if (createdRaw) {
    const d = new Date(String(createdRaw));
    if (!Number.isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      dateStr = `${yyyy}-${mm}-${dd}`;
    } else {
      // لو مش عارف نفهمه، نخليه سترينج خام (ممكن مايتفلترش مظبوط)
      dateStr = String(createdRaw);
    }
  }

  // المبلغ (إجمالي الأوردر)
  const totalField =
    r.Total ??
    r.total ??
    r["الإجمالي"] ??
    r["CollectionAmount"] ??
    r["collectionAmount"] ??
    0;

  const amount =
    typeof totalField === "number"
      ? totalField
      : Number(totalField) || 0;

  return {
    date: dateStr,
    amount,
  };
}
