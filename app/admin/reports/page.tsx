 // app/admin/reports/page.tsx
"use client";

import { useLang } from "../../providers";
import Swal from "sweetalert2";

export default function AdminReportsPage() {
  const { lang } = useLang();

  const t = {
    ar: {
      title: "التقارير",
      subtitle: "استخراج تقارير عن المبيعات والأوردرات",
      reportType: "نوع التقرير",
      from: "من تاريخ",
      to: "إلى تاريخ",
      user: "المستخدم (اختياري)",
      all: "الكل",
      typeSales: "تقرير مبيعات إجمالي",
      typeUser: "تقرير حسب المستخدم",
      typeProduct: "تقرير حسب المنتج",
      typeStatus: "تقرير حالات التسليم",
      generate: "توليد التقرير",
      clear: "مسح",
      cards: {
        totalSales: "إجمالي المبيعات في الفترة",
        ordersCount: "عدد الأوردرات",
        deliveryRate: "نسبة التسليم",
        topProduct: "أعلى منتج مبيعًا",
        egp: "جنيه مصري",
        inPeriod: "في الفترة المحددة",
        delivered: "تم التسليم",
        sampleProduct: "بيبسي 330 مل (مثال تجريبي)",
      },
      tableTitle: "تفاصيل التقرير (جدول)",
      tableSubtitle:
        "يمكن تخصيص نوع التقرير وربطه بالجداول الحقيقية لاحقًا",
      date: "التاريخ",
      userCol: "المستخدم",
      orders: "عدد الأوردرات",
      deliveredCol: "تم التسليم",
      notDelivered: "لم يتم",
      total: "إجمالي المبيعات",
      chartTitle: "جراف التقرير",
      chartSubtitle: "مكان لجراف المبيعات أو الأوردرات",
      generated: "تم توليد التقرير (مثال تجريبي)",
    },
    en: {
      title: "Reports",
      subtitle: "Generate reports for sales and orders",
      reportType: "Report type",
      from: "From date",
      to: "To date",
      user: "User (optional)",
      all: "All",
      typeSales: "Total sales report",
      typeUser: "Per user report",
      typeProduct: "Per product report",
      typeStatus: "Delivery status report",
      generate: "Generate report",
      clear: "Clear",
      cards: {
        totalSales: "Total sales in period",
        ordersCount: "Orders count",
        deliveryRate: "Delivery rate",
        topProduct: "Top selling product",
        egp: "EGP",
        inPeriod: "in selected period",
        delivered: "Delivered",
        sampleProduct: "Pepsi 330 ml (sample)",
      },
      tableTitle: "Report details (table)",
      tableSubtitle:
        "You can later bind this to real data and customize the report",
      date: "Date",
      userCol: "User",
      orders: "Orders",
      deliveredCol: "Delivered",
      notDelivered: "Not delivered",
      total: "Total sales",
      chartTitle: "Report chart",
      chartSubtitle: "Placeholder for sales/orders chart",
      generated: "Report generated (sample)",
    },
  }[lang];

  function handleGenerate() {
    Swal.fire({
      icon: "success",
      title: t.generated,
    });
  }

  return (
    <>
      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">{t.title}</div>
            <div className="panel-subtitle">{t.subtitle}</div>
          </div>
        </div>

        <div className="filters" style={{ marginTop: "0.8rem" }}>
          <div className="filter-group">
            <label className="filter-label">{t.reportType}</label>
            <select className="filter-select">
              <option>{t.typeSales}</option>
              <option>{t.typeUser}</option>
              <option>{t.typeProduct}</option>
              <option>{t.typeStatus}</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">{t.from}</label>
            <input type="date" className="filter-input" />
          </div>
          <div className="filter-group">
            <label className="filter-label">{t.to}</label>
            <input type="date" className="filter-input" />
          </div>
          <div className="filter-group">
            <label className="filter-label">{t.user}</label>
            <select className="filter-select">
              <option>{t.all}</option>
              <option>User 1</option>
              <option>User 2</option>
              <option>User 3</option>
            </select>
          </div>
          <div className="filters-actions">
            <button className="btn btn-primary" onClick={handleGenerate}>
              {t.generate}
            </button>
            <button className="btn">{t.clear}</button>
          </div>
        </div>
      </section>

      <section className="cards-row">
        <article className="card">
          <div className="card-title">{t.cards.totalSales}</div>
          <div className="card-value">35,200</div>
          <div className="card-footer">{t.cards.egp}</div>
        </article>
        <article className="card">
          <div className="card-title">{t.cards.ordersCount}</div>
          <div className="card-value">150</div>
          <div className="card-footer">{t.cards.inPeriod}</div>
        </article>
        <article className="card">
          <div className="card-title">{t.cards.deliveryRate}</div>
          <div className="card-value">82%</div>
          <div className="card-footer">{t.cards.delivered}</div>
        </article>
        <article className="card">
          <div className="card-title">{t.cards.topProduct}</div>
          <div className="card-value">{t.cards.sampleProduct}</div>
          <div className="card-footer">
            {lang === "ar" ? "كمثال تجريبي" : "sample only"}
          </div>
        </article>
      </section>

      <section className="bottom-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">{t.tableTitle}</div>
              <div className="panel-subtitle">{t.tableSubtitle}</div>
            </div>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>{t.date}</th>
                  <th>{t.userCol}</th>
                  <th>{t.orders}</th>
                  <th>{t.deliveredCol}</th>
                  <th>{t.notDelivered}</th>
                  <th>{t.total}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2025-12-05</td>
                  <td>User 1</td>
                  <td>20</td>
                  <td>18</td>
                  <td>2</td>
                  <td>4,800</td>
                </tr>
                <tr>
                  <td>2025-12-05</td>
                  <td>User 2</td>
                  <td>15</td>
                  <td>13</td>
                  <td>2</td>
                  <td>3,600</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">{t.chartTitle}</div>
              <div className="panel-subtitle">{t.chartSubtitle}</div>
            </div>
          </div>
          <div className="placeholder-chart">
            {lang === "ar"
              ? "هنا يمكن وضع جراف يوضح توزيع المبيعات على الأيام أو المستخدمين."
              : "Here you can place a chart for sales or orders over time/users."}
          </div>
        </section>
      </section>
    </>
  );
}
