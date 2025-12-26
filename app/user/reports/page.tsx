"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import Swal from "sweetalert2";
import { useLang } from "../../providers";

type ReportForm = {
  subject: string;
  type: string;
  message: string;
  relatedOrderId: string;
};

export default function UserReportPage() {
  const { lang } = useLang();

  const labels = {
    ar: {
      pageTitle: "إرسال تقرير للإدارة",
      pageSub:
        "اكتب ملاحظاتك أو المشاكل أو الاقتراحات، وسيتم إرسالها للأدمن لمراجعتها.",
      subject: "عنوان التقرير",
      subjectPlaceholder: "مثال: مشكلة في الأوردرات / اقتراح تطوير / ...",
      type: "نوع التقرير",
      typePlaceholder: "اختر نوع التقرير",
      typeProblem: "مشكلة في النظام",
      typeSuggestion: "اقتراح تطوير",
      typeComplaint: "شكوى",
      typeOther: "أخرى",
      message: "نص التقرير",
      messagePlaceholder: "اكتب التفاصيل هنا...",
      relatedOrderId: "رقم أوردر متعلق (اختياري)",
      relatedOrderIdPlaceholder: "مثال: 1023 (لو التقرير عن أوردر معيّن)",
      send: "إرسال التقرير",
      sending: "جاري الإرسال...",
      sent: "تم إرسال التقرير للإدارة",
      required: "من فضلك املأ عنوان التقرير ونص التقرير.",
      userMissing:
        "لم يتم العثور على اسم المستخدم. تأكد من تسجيل الدخول بشكل صحيح.",
      apiError: "حدث خطأ أثناء إرسال التقرير، حاول مرة أخرى.",
    },
    en: {
      pageTitle: "Send report to admin",
      pageSub:
        "Write any issue, suggestion or feedback. It will be sent to the admin.",
      subject: "Report subject",
      subjectPlaceholder: "e.g. Orders issue / feature request / ...",
      type: "Report type",
      typePlaceholder: "Choose report type",
      typeProblem: "System issue",
      typeSuggestion: "Feature suggestion",
      typeComplaint: "Complaint",
      typeOther: "Other",
      message: "Report text",
      messagePlaceholder: "Write the details here...",
      relatedOrderId: "Related order ID (optional)",
      relatedOrderIdPlaceholder: "Example: 1023 (if related to a specific order)",
      send: "Send report",
      sending: "Sending...",
      sent: "Report sent to admin",
      required: "Please fill subject and report text.",
      userMissing:
        "Username not found. Please login again and try.",
      apiError: "Error while sending report, please try again.",
    },
  }[lang];

  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ReportForm>({
    subject: "",
    type: "",
    message: "",
    relatedOrderId: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("username");
    setCurrentUser(stored || null);
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.subject.trim() || !form.message.trim()) {
      Swal.fire({ icon: "warning", title: labels.required });
      return;
    }

    if (!currentUser) {
      Swal.fire({ icon: "error", title: labels.userMissing });
      return;
    }

    setLoading(true);

    try {
      // TODO: اربط هذا بـ API حقيقي: POST /api/reports
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: form.subject.trim(),
          type: form.type || "other",
          message: form.message.trim(),
          relatedOrderId: form.relatedOrderId.trim() || null,
          userName: currentUser,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.ok === false) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      Swal.fire({ icon: "success", title: labels.sent });

      setForm({
        subject: "",
        type: "",
        message: "",
        relatedOrderId: "",
      });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: labels.apiError });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">{labels.pageTitle}</div>
          <div className="panel-subtitle">{labels.pageSub}</div>
        </div>
      </div>

      <form className="filters" style={{ marginTop: 0 }} onSubmit={handleSubmit}>
        <div className="filter-group" style={{ flex: 2 }}>
          <label className="filter-label">{labels.subject}</label>
          <input
            name="subject"
            className="filter-input"
            value={form.subject}
            onChange={handleChange}
            placeholder={labels.subjectPlaceholder}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">{labels.type}</label>
          <select
            name="type"
            className="filter-select"
            value={form.type}
            onChange={handleChange}
          >
            <option value="">{labels.typePlaceholder}</option>
            <option value="problem">{labels.typeProblem}</option>
            <option value="suggestion">{labels.typeSuggestion}</option>
            <option value="complaint">{labels.typeComplaint}</option>
            <option value="other">{labels.typeOther}</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">{labels.relatedOrderId}</label>
          <input
            name="relatedOrderId"
            className="filter-input"
            value={form.relatedOrderId}
            onChange={handleChange}
            placeholder={labels.relatedOrderIdPlaceholder}
          />
        </div>

        <div className="filter-group" style={{ flexBasis: "100%", maxWidth: "100%"}}>
          <label className="filter-label">{labels.message}</label>
          <textarea
            name="message"
            rows={12}
            className="filter-input"
            value={form.message}
            onChange={handleChange}
            placeholder={labels.messagePlaceholder}
          />
        </div>

        <div className="filters-actions">
          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
          >
            {loading ? labels.sending : labels.send}
          </button>
        </div>
      </form>
    </section>
  );
}
