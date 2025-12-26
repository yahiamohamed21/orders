"use client";

import Swal from "sweetalert2";
import { useLang } from "../providers";

const t = {
  ar: {
    ordersTotal: "إجمالي الأوردرات",
    delivered: "تم تسليمها",
    pending: "لم تُسلم بعد",
    salesTotal: "إجمالي المبيعات (جنيه)",
    vsYesterday: "مقارنة باليوم السابق",
    moreOrders: "أوردرات زيادة",
    lessThanYesterday: "أقل من أمس",
    period: "خلال الفترة الحالية",
    lastOrders: "آخر الأوردرات",
    lastOrdersSub: "أحدث 20 أوردر في النظام",
    showAll: "عرض الكل",
    cust: "العميل",
    phone: "الهاتف",
    address: "العنوان",
    user: "المستخدم",
    created: "التسجيل",
    status: "الحالة",
    total: "الإجمالي",
    actions: "إجراءات",
    deleteOrder: "حذف الأوردر",
    deleteConfirmTitle: "هل أنت متأكد؟",
    deleteConfirmText: "سيتم حذف الأوردر نهائياً",
    deleteYes: "نعم، احذف",
    deleteCanceled: "تم الإلغاء",
    deleteSuccess: "تم الحذف بنجاح",
  },
  en: {
    ordersTotal: "Total Orders",
    delivered: "Delivered",
    pending: "Pending",
    salesTotal: "Total Sales (EGP)",
    vsYesterday: "vs yesterday",
    moreOrders: "more orders",
    lessThanYesterday: "less than yesterday",
    period: "current period",
    lastOrders: "Recent Orders",
    lastOrdersSub: "Latest 20 orders in the system",
    showAll: "View all",
    cust: "Customer",
    phone: "Phone",
    address: "Address",
    user: "User",
    created: "Created",
    status: "Status",
    total: "Total",
    actions: "Actions",
    deleteOrder: "Delete order",
    deleteConfirmTitle: "Are you sure?",
    deleteConfirmText: "This order will be permanently deleted",
    deleteYes: "Yes, delete",
    deleteCanceled: "Cancelled",
    deleteSuccess: "Deleted successfully",
  },
};

export default function AdminDashboardPage() {
  const { lang } = useLang();
  const tr = t[lang];

  function handleDeleteOrder() {
    Swal.fire({
      title: tr.deleteConfirmTitle,
      text: tr.deleteConfirmText,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: tr.deleteYes,
    }).then((result) => {
      if (result.isConfirmed) {
        // TODO: استدعاء API لحذف الأوردر فعلياً
        Swal.fire({
          icon: "success",
          title: tr.deleteSuccess,
        });
      } else {
        Swal.fire({
          icon: "info",
          title: tr.deleteCanceled,
        });
      }
    });
  }

  return (
    <>
      <section className="cards-row">
        <article className="card">
          <div className="card-title">{tr.ordersTotal}</div>
          <div className="card-value">235</div>
          <div className="card-footer">
            <span className="card-badge success">+12%</span>{" "}
            {tr.vsYesterday}
          </div>
        </article>
        <article className="card">
          <div className="card-title">{tr.delivered}</div>
          <div className="card-value">180</div>
          <div className="card-footer">
            <span className="card-badge success">+5</span> {tr.moreOrders}
          </div>
        </article>
        <article className="card">
          <div className="card-title">{tr.pending}</div>
          <div className="card-value">55</div>
          <div className="card-footer">
            <span className="card-badge danger">-3</span>{" "}
            {tr.lessThanYesterday}
          </div>
        </article>
        <article className="card">
          <div className="card-title">{tr.salesTotal}</div>
          <div className="card-value">52,300</div>
          <div className="card-footer">{tr.period}</div>
        </article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">{tr.lastOrders}</div>
            <div className="panel-subtitle">{tr.lastOrdersSub}</div>
          </div>
          <button className="btn">{tr.showAll}</button>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>{tr.cust}</th>
                <th>{tr.phone}</th>
                <th>{tr.address}</th>
                <th>{tr.user}</th>
                <th>{tr.created}</th>
                <th>{tr.status}</th>
                <th>{tr.total}</th>
                <th>{tr.actions}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#1023</td>
                <td>{lang === "ar" ? "محمد أحمد" : "Mohamed Ahmed"}</td>
                <td>0100 000 0000</td>
                <td>{lang === "ar" ? "مدينة نصر" : "Nasr City"}</td>
                <td>User 1</td>
                <td>2025-12-07</td>
                <td>
                  <span className="status-pill status-delivered">
                    {lang === "ar" ? "تم التسليم" : "Delivered"}
                  </span>
                </td>
                <td>850</td>
                <td>
                  <div className="actions">
                    <button onClick={handleDeleteOrder}>
                      {tr.deleteOrder}
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>#1022</td>
                <td>{lang === "ar" ? "سارة علي" : "Sara Ali"}</td>
                <td>0111 111 1111</td>
                <td>{lang === "ar" ? "المهندسين" : "Mohandessin"}</td>
                <td>User 2</td>
                <td>2025-12-07</td>
                <td>
                  <span className="status-pill status-pending">
                    {lang === "ar" ? "لم يتم" : "Pending"}
                  </span>
                </td>
                <td>430</td>
                <td>
                  <div className="actions">
                    <button onClick={handleDeleteOrder}>
                      {tr.deleteOrder}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
