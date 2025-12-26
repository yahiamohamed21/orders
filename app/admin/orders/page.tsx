"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import Swal from "sweetalert2";
import { useLang } from "../../providers";

type OrderStatusKey = "delivered" | "pending" | "canceled" | "shipping" | "other";

type OrderRow = {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  userName: string;
  created: string;
  statusRaw: string;
  statusKey: OrderStatusKey;
  total: number;
  raw: any;
};

export default function AdminOrdersPage() {
  const { lang } = useLang();

  const labels = {
    ar: {
      searchTitle: "بحث في الأوردرات",
      searchSub: "استخدم الفلاتر لتحديد النتائج",
      from: "من تاريخ",
      to: "إلى تاريخ",
      fromTime: "من ساعة",
      toTime: "إلى ساعة",
      user: "المستخدم",
      status: "الحالة",
      all: "الكل",
      delivered: "تم التسليم",
      pending: "لم يتم التسليم",
      canceled: "ملغي",
      shipping: "قيد الشحن",
      search: "بحث",
      clear: "مسح",
      exportExcel: "تصدير Excel",
      exportPdf: "تصدير PDF",
      listTitle: "قائمة الأوردرات",
      listSub: "هذه البيانات مقروءة مباشرة من شيت الإكسيل",
      resultsCount: "عدد النتائج",
      actions: "إجراءات",
      total: "الإجمالي",
      confirmTitle: "هل أنت متأكد؟",
      confirmText: "سيتم حذف الأوردر نهائياً",
      yesDelete: "نعم، احذف",
      canceledTitle: "تم الإلغاء",
      successTitle: "تم الحذف بنجاح",
      loading: "جاري تحميل البيانات من شيت الإكسيل...",
      noResults: "لا توجد نتائج مطابقة للفلاتر الحالية",
      errorLoading:
        "تعذر تحميل الأوردرات من شيت الإكسيل. تأكد من إعداد الـ API واسم الشيت.",
      statusUnknown: "غير محدد",
      exportExcelHint: "يمكنك توصيل هذا الزر بعملية تصدير مخصصة لاحقاً.",
    },
    en: {
      searchTitle: "Search Orders",
      searchSub: "Use filters to narrow results (data from Excel sheet)",
      from: "From date",
      to: "To date",
      fromTime: "From time",
      toTime: "To time",
      user: "User",
      status: "Status",
      all: "All",
      delivered: "Delivered",
      pending: "Pending",
      canceled: "Canceled",
      shipping: "In shipping",
      search: "Search",
      clear: "Clear",
      exportExcel: "Export Excel",
      exportPdf: "Export PDF",
      listTitle: "Orders list",
      listSub: "Data is loaded directly from the Excel sheet",
      resultsCount: "Results",
      actions: "Actions",
      total: "Total",
      confirmTitle: "Are you sure?",
      confirmText: "This order will be permanently deleted",
      yesDelete: "Yes, delete",
      canceledTitle: "Cancelled",
      successTitle: "Deleted successfully",
      loading: "Loading orders from Excel sheet...",
      noResults: "No orders match the current filters",
      errorLoading:
        "Failed to load orders from Excel sheet. Check API and sheet name.",
      statusUnknown: "Unknown",
      exportExcelHint: "You can connect this button to a custom export later.",
    },
  }[lang];

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // فلاتر
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [fromTime, setFromTime] = useState<string>(""); // HH:MM
  const [toTime, setToTime] = useState<string>(""); // HH:MM
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "delivered" | "pending" | "canceled" | "shipping"
  >("all");

  // تحميل البيانات من API يقرأ شيت الإكسيل
  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        setLoadError(null);

        const res = await fetch("/api/orders/list");

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const txt = await res.text();
          console.error(
            "[AdminOrdersPage] Expected JSON, got:",
            contentType,
            txt.slice(0, 200)
          );
          throw new Error("Non-JSON response from /api/orders/list");
        }

        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || `HTTP ${res.status}`);
        }

        const rows: any[] = Array.isArray(data.rows) ? data.rows : [];

        const mapped: OrderRow[] = rows.map((r, index) => mapExcelRow(r, index));
        setOrders(mapped);
      } catch (err: any) {
        console.error(err);
        setLoadError(
          (err && err.message) ||
            (lang === "ar" ? labels.errorLoading : labels.errorLoading)
        );
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [lang]);

  // مشتق: لستة المستخدمين من الشيت
  const usersOptions = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => {
      if (o.userName) set.add(o.userName);
    });
    return Array.from(set).sort();
  }, [orders]);

  // فلترة الأوردار (تاريخ + وقت + حالة + يوزر)
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // فلتر المستخدم
      if (selectedUser !== "all" && o.userName !== selectedUser) {
        return false;
      }

      // فلتر الحالة
      if (selectedStatus !== "all" && o.statusKey !== selectedStatus) {
        return false;
      }

      // فلتر التاريخ (باليوم)
      const createdDate = parseDate(o.created);
      if (fromDate) {
        const from = parseDate(fromDate);
        if (from && createdDate && createdDate < from) return false;
      }
      if (toDate) {
        const to = parseDate(toDate);
        if (to && createdDate && createdDate > to) return false;
      }

      // فلتر الوقت (بالساعات والدقائق)
      const orderMinutes = extractTimeMinutes(o.created);

      if (fromTime) {
        const fromMinutes = parseTimeToMinutes(fromTime);
        if (fromMinutes != null) {
          if (orderMinutes == null || orderMinutes < fromMinutes) {
            return false;
          }
        }
      }

      if (toTime) {
        const toMinutes = parseTimeToMinutes(toTime);
        if (toMinutes != null) {
          if (orderMinutes == null || orderMinutes > toMinutes) {
            return false;
          }
        }
      }

      return true;
    });
  }, [orders, selectedUser, selectedStatus, fromDate, toDate, fromTime, toTime]);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    // الفلترة كلها في useMemo
  }

  function handleClear() {
    setFromDate("");
    setToDate("");
    setFromTime("");
    setToTime("");
    setSelectedUser("all");
    setSelectedStatus("all");
  }

  function deleteOrder(id: string) {
    Swal.fire({
      title: labels.confirmTitle,
      text: labels.confirmText,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: labels.yesDelete,
    }).then((res) => {
      if (res.isConfirmed) {
        // TODO: استدعاء API لحذف الأوردر فعلياً من الإكسيل أو الـ DB
        setOrders((prev) => prev.filter((o) => o.id !== id));

        Swal.fire({ icon: "success", title: labels.successTitle });
      } else {
        Swal.fire({ icon: "info", title: labels.canceledTitle });
      }
    });
  }

  function handleExportExcel() {
    // TODO: أربطها بـ API يقوم بتوليد ملف Excel مُفلتر
    Swal.fire({
      icon: "info",
      title: labels.exportExcel,
      text: labels.exportExcelHint,
    });
  }

  function handleExportPdf() {
    // TODO: أربطها بـ API يقوم بتوليد PDF
    Swal.fire({
      icon: "info",
      title: labels.exportPdf,
      text: labels.exportExcelHint,
    });
  }

  return (
    <>
      {/* منطقة الفلترة + تصدير */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">{labels.searchTitle}</div>
            <div className="panel-subtitle">{labels.searchSub}</div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn" onClick={handleExportExcel}>
              {labels.exportExcel}
            </button>
            <button className="btn" onClick={handleExportPdf}>
              {labels.exportPdf}
            </button>
          </div>
        </div>

        <form
          className="filters"
          style={{ marginTop: "0.8rem" }}
          onSubmit={handleSearch}
        >
          <div className="filter-group">
            <label className="filter-label">{labels.from}</label>
            <input
              type="date"
              className="filter-input"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">{labels.to}</label>
            <input
              type="date"
              className="filter-input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          {/* فلاتر الوقت */}
          <div className="filter-group">
            <label className="filter-label">{labels.fromTime}</label>
            <input
              type="time"
              className="filter-input"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">{labels.toTime}</label>
            <input
              type="time"
              className="filter-input"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">{labels.user}</label>
            <select
              className="filter-select"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="all">{labels.all}</option>
              {usersOptions.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">{labels.status}</label>
            <select
              className="filter-select"
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as typeof selectedStatus)
              }
            >
              <option value="all">{labels.all}</option>
              <option value="delivered">{labels.delivered}</option>
              <option value="pending">{labels.pending}</option>
              <option value="canceled">{labels.canceled}</option>
              <option value="shipping">{labels.shipping}</option>
            </select>
          </div>
          <div className="filters-actions">
            <button className="btn btn-primary" type="submit">
              {labels.search}
            </button>
            <button className="btn" type="button" onClick={handleClear}>
              {labels.clear}
            </button>
          </div>
        </form>
      </section>

      {/* جدول الأوردرات من الشيت */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">{labels.listTitle}</div>
            <div className="panel-subtitle">
              {labels.listSub}
              {loading && (
                <>
                  {" — "}
                  {labels.loading}
                </>
              )}
              {loadError && (
                <span style={{ color: "var(--danger)", marginInlineStart: 8 }}>
                  {loadError}
                </span>
              )}
            </div>
          </div>
          <div className="panel-subtitle">
            {labels.resultsCount}:{" "}
            <strong>{loading ? "..." : filteredOrders.length}</strong>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>{lang === "ar" ? "رقم الأوردر" : "Order ID"}</th>
                <th>{lang === "ar" ? "العميل" : "Customer"}</th>
                <th>{lang === "ar" ? "الهاتف" : "Phone"}</th>
                <th>{lang === "ar" ? "العنوان" : "Address"}</th>
                <th>{lang === "ar" ? "المستخدم" : "User"}</th>
                <th>{lang === "ar" ? "التسجيل" : "Created"}</th>
                <th>{lang === "ar" ? "الحالة" : "Status"}</th>
                <th>{labels.total}</th>
                <th>{labels.actions}</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filteredOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    style={{ textAlign: "center", padding: "0.8rem" }}
                  >
                    {labels.noResults}
                  </td>
                </tr>
              )}

              {filteredOrders.map((o, idx) => (
                <tr key={o.id + "-" + idx}>
                  <td>{idx + 1}</td>
                  <td>{o.id}</td>
                  <td>{o.customerName}</td>
                  <td>{o.phone}</td>
                  <td>{o.address}</td>
                  <td>{o.userName}</td>
                  <td>{o.created}</td>
                  <td>
                    <span
                      className={
                        "status-pill " +
                        (o.statusKey === "delivered"
                          ? "status-delivered"
                          : o.statusKey === "pending"
                          ? "status-pending"
                          : o.statusKey === "canceled"
                          ? "status-pending"
                          : o.statusKey === "shipping"
                          ? "status-pending"
                          : "")
                      }
                    >
                      {renderStatusLabel(o.statusKey, labels)}
                    </span>
                  </td>
                  <td>
                    {o.total.toLocaleString(
                      lang === "ar" ? "ar-EG" : "en-US"
                    )}
                  </td>
                  <td>
                    <div className="actions">
                      <button onClick={() => deleteOrder(o.id)} type="button">
                        {labels.actions}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

/* ===== Helpers ===== */

function parseDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const str = String(value).trim();
  if (!str) return null;
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

// تحويل سطر من الشيت إلى OrderRow
function mapExcelRow(r: any, index: number): OrderRow {
  // ID
  const id =
    r.OrderId ??
    r.orderId ??
    r["Order ID"] ??
    r["رقم الأوردر"] ??
    r["OrderID"] ??
    `#${index + 1}`;

  // اسم العميل
  const customerName =
    r.Customer ??
    r.customer ??
    r["Customer Name"] ??
    r["اسم العميل"] ??
    r["RecipientName"] ??
    r["recipientName"] ??
    "";

  // هاتف
  const phone =
    r.Phone ??
    r.phone ??
    r["Phone Number"] ??
    r["الهاتف"] ??
    r["RecipientPhone"] ??
    r["recipientPhone"] ??
    "";

  // عنوان
  const address =
    r.Address ??
    r.address ??
    r["العنوان"] ??
    r["RecipientAddress"] ??
    r["recipientAddress"] ??
    "";

  // المستخدم
  const userName =
    r.User ??
    r.user ??
    r["UserName"] ??
    r["المستخدم"] ??
    r["CreatedBy"] ??
    r["createdBy"] ??
    "";

  // تاريخ
  const createdRaw =
    r.Created ??
    r.created ??
    r["CreatedAt"] ??
    r["التسجيل"] ??
    r["Date"] ??
    r["OrderDate"] ??
    "";
  let createdStr = "";
  if (createdRaw instanceof Date) {
    const yyyy = createdRaw.getFullYear();
    const mm = String(createdRaw.getMonth() + 1).padStart(2, "0");
    const dd = String(createdRaw.getDate()).padStart(2, "0");
    createdStr = `${yyyy}-${mm}-${dd}`;
  } else {
    createdStr = String(createdRaw || "");
  }

  // الحالة
  const statusField =
    r.Status ??
    r.status ??
    r["الحالة"] ??
    r["OrderStatus"] ??
    r["orderStatus"] ??
    "";
  const statusRaw = String(statusField || "");
  const statusKey = normalizeStatus(statusRaw);

  // الإجمالي
  const totalField =
    r.Total ??
    r.total ??
    r["الإجمالي"] ??
    r["CollectionAmount"] ??
    r["collectionAmount"] ??
    0;
  const total =
    typeof totalField === "number"
      ? totalField
      : Number(totalField) || 0;

  return {
    id: String(id || `#${index + 1}`),
    customerName: String(customerName || ""),
    phone: String(phone || ""),
    address: String(address || ""),
    userName: String(userName || ""),
    created: createdStr,
    statusRaw,
    statusKey,
    total,
    raw: r,
  };
}

function normalizeStatus(str: string): OrderStatusKey {
  const s = str.toLowerCase();

  if (!s) return "other";

  // Delivered
  if (
    s.includes("delivered") ||
    s.includes("تم") ||
    s.includes("وصل") ||
    s.includes("deliv")
  ) {
    return "delivered";
  }

  // Canceled
  if (s.includes("cancel") || s.includes("ملغي") || s.includes("ملغى")) {
    return "canceled";
  }

  // Shipping / قيد الشحن
  if (s.includes("ship") || s.includes("شحن") || s.includes("قيد الشحن")) {
    return "shipping";
  }

  // Pending / not delivered
  if (
    s.includes("pending") ||
    s.includes("لم") ||
    s.includes("قيد") ||
    s.includes("not delivered")
  ) {
    return "pending";
  }

  return "other";
}

function renderStatusLabel(
  key: OrderStatusKey,
  labels: any
): string {
  if (key === "delivered") return labels.delivered;
  if (key === "pending") return labels.pending;
  if (key === "canceled") return labels.canceled;
  if (key === "shipping") return labels.shipping;
  return labels.statusUnknown;
}

// يحوّل "HH:MM" إلى دقائق من بداية اليوم
function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr) return null;
  const [hStr, mStr] = timeStr.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (
    Number.isNaN(h) ||
    Number.isNaN(m) ||
    h < 0 ||
    h > 23 ||
    m < 0 ||
    m > 59
  ) {
    return null;
  }
  return h * 60 + m;
}

// يستخرج وقت الأوردر من created (Date أو string) ويحوله لدقائق
function extractTimeMinutes(value: any): number | null {
  if (!value) return null;

  if (value instanceof Date) {
    return value.getHours() * 60 + value.getMinutes();
  }

  const str = String(value).trim();
  if (!str) return null;

  // لو string قابل للتحويل لـ Date
  const d = new Date(str);
  if (!Number.isNaN(d.getTime())) {
    return d.getHours() * 60 + d.getMinutes();
  }

  // fallback: ندور على HH:MM في النص
  const match = str.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;

  const h = Number(match[1]);
  const m = Number(match[2]);
  if (
    Number.isNaN(h) ||
    Number.isNaN(m) ||
    h < 0 ||
    h > 23 ||
    m < 0 ||
    m > 59
  ) {
    return null;
  }

  return h * 60 + m;
}
