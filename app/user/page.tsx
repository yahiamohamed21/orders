"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import Swal from "sweetalert2";
import { useLang } from "../providers";
import { CITY_AREAS } from "./city-areas";

type FormState = {
  customerPolicyNumber: string;
  goodsType: string;
  goodsName: string;
  quantity: string;
  weight: string;
  collectionAmount: string;
  priceGuarantee: string;
  allowOpenPackage: "Yes" | "No";
  note: string;
  recipientName: string;
  recipientPhone: string;
  city: string;
  area: string;
  address: string;
  recipientEmail: string;
};

export default function UserDashboardPage() {
  const { lang } = useLang();

  const [form, setForm] = useState<FormState>({
    customerPolicyNumber: "",
    goodsType: "Normal",
    goodsName: "عرض",
    quantity: "1",
    weight: "1",
    collectionAmount: "",
    priceGuarantee: "",
    allowOpenPackage: "Yes",
    note: "",
    recipientName: "",
    recipientPhone: "",
    city: "",
    area: "",
    address: "",
    recipientEmail: "",
  });

  const [loading, setLoading] = useState(false);

  // اليوزر الحالي (من الـ login)
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // حالة التارجيت و إجمالي المبيعات
  const [target, setTarget] = useState<number | null>(null);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [loadingStats, setLoadingStats] = useState(true);

  const labels = {
    ar: {
      mainTitle: "تسجيل أوردر جديد",
      mainSub:
        "املأ بيانات الشحنة وبيانات العميل وسيتم إرسال الأوردر إلى شيت الإكسيل مباشرة",
      shipmentData: "بيانات الشحنة",
      shipmentSub: "البيانات المتعلقة بالبضاعة وقيمة التحصيل",
      receiverData: "بيانات المستلم",
      receiverSub: "اسم العميل وبيانات التواصل والعنوان",
      customerPolicyNumber: "رقم بوليصة العميل (اختياري)",
      goodsType: "نوع البضاعة",
      goodsName: "اسم البضاعة",
      quantity: "العدد",
      weight: "وزن الطلب",
      collectionAmount: "قيمة التحصيل (جنيه)",
      priceGuarantee: "مبلغ ضمان السعر (اختياري)",
      allowOpenPackage: "السماح بفتح الحزمة",
      note: "ملاحظة",
      yes: "Yes",
      no: "No",
      recipientName: "الاسم",
      recipientPhone: "هاتف",
      city: "مدينة",
      chooseCity: "اختر المدينة",
      area: "منطقة",
      chooseArea: "اختر المنطقة",
      address: "عنوان المرسل إليه",
      recipientEmail: "البريد الإلكتروني المستلم (اختياري)",
      send: "إرسال الأوردر",
      sending: "جاري الإرسال...",
      sent: "تم إرسال الأوردر بنجاح إلى شيت الإكسيل",
      error: "حدث خطأ أثناء إرسال الأوردر",
      required: "من فضلك املأ الحقول المطلوبة",
      // Target
      targetCardTitle: "هدف المبيعات الشهري",
      targetLoading: "جاري تحميل بيانات الهدف...",
      noTarget: "لم يتم تحديد هدف لك بعد",
      achieved: "المحقق حتى الآن",
      remaining: "المتبقي للوصول للهدف",
      exceeded: "لقد تخطيت الهدف! أحسنت 👏",
      msgNear: "أنت قريب جدًا من تحقيق الهدف، استمر 👌",
      msgHalf: "أتممت أكثر من نصف الهدف، شغل جامد 💪",
      msgStart: "بداية جيدة، كمل وهنوصل للهدف 🔥",
      totalSalesLabel: "إجمالي مبيعاتك",
      targetLabel: "هدفك",
      remainingLabel: "المتبقي",
    },
    en: {
      mainTitle: "Create new order",
      mainSub:
        "Fill shipment and customer data, the order will be sent to the Excel sheet",
      shipmentData: "Shipment data",
      shipmentSub: "Information about goods and collection amount",
      receiverData: "Recipient info",
      receiverSub: "Customer name, contact and address",
      customerPolicyNumber: "Customer policy number (optional)",
      goodsType: "Goods type",
      goodsName: "Goods name",
      quantity: "Quantity",
      weight: "Weight",
      collectionAmount: "Collection amount (EGP)",
      priceGuarantee: "Price guarantee amount (optional)",
      allowOpenPackage: "Allow opening the package",
      note: "Note",
      yes: "Yes",
      no: "No",
      recipientName: "Name",
      recipientPhone: "Phone",
      city: "City",
      chooseCity: "Choose city",
      area: "Area",
      chooseArea: "Choose area",
      address: "Recipient address",
      recipientEmail: "Recipient email (optional)",
      send: "Send order",
      sending: "Sending...",
      sent: "Order sent successfully to Excel sheet",
      error: "Error while sending order",
      required: "Please fill required fields",
      // Target
      targetCardTitle: "Monthly sales target",
      targetLoading: "Loading target data...",
      noTarget: "No target has been set for you yet",
      achieved: "Achieved so far",
      remaining: "Remaining to reach target",
      exceeded: "You exceeded the target! Great job 👏",
      msgNear: "You are very close to the target, keep pushing 👌",
      msgHalf: "You passed half the target, awesome work 💪",
      msgStart: "Good start, keep going to reach your target 🔥",
      totalSalesLabel: "Your total sales",
      targetLabel: "Your target",
      remainingLabel: "Remaining",
    },
  }[lang];

  const cities = Object.keys(CITY_AREAS).sort();
  const areasForSelectedCity = form.city ? CITY_AREAS[form.city] || [] : [];

  // قراءة اسم اليوزر من localStorage بعد اللوجين
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("username");
    setCurrentUser(stored || "user1");
  }, []);

  // تحميل التارجيت وإجمالي المبيعات عند توفر currentUser
  useEffect(() => {
    if (!currentUser) return;

    async function loadStats() {
      try {
        setLoadingStats(true);

        // 1) targets
        const tRes = await fetch("/api/targets");
        const tData = await tRes.json();
        if (
          tRes.ok &&
          tData.ok &&
          tData.targets?.[currentUser]?.target != null
        ) {
          setTarget(Number(tData.targets[currentUser].target));
        } else {
          setTarget(null);
        }

        // 2) total sales for this user
        const sRes = await fetch(`/api/user-stats/${currentUser}`);
        const sData = await sRes.json();
        if (sRes.ok && sData.ok) {
          setTotalSales(Number(sData.total || 0));
        } else {
          setTotalSales(0);
        }
      } catch (err) {
        console.error(err);
        setTarget(null);
        setTotalSales(0);
      } finally {
        setLoadingStats(false);
      }
    }

    loadStats();
  }, [currentUser]);

  function handleChange(
    e: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target;
    setForm((prev) => {
      if (name === "city") {
        return { ...prev, city: value, area: "" };
      }
      return { ...prev, [name]: value };
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const isMissing =
      form.goodsName.trim() === "" ||
      form.collectionAmount.trim() === "" ||
      form.recipientName.trim() === "" ||
      form.recipientPhone.trim() === "" ||
      form.city.trim() === "" ||
      form.area.trim() === "" ||
      form.address.trim() === "";

    if (isMissing) {
      Swal.fire({ icon: "warning", title: labels.required });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerPolicyNumber: form.customerPolicyNumber || null,
          goodsType: form.goodsType,
          goodsName: form.goodsName,
          quantity: Number(form.quantity || "1"),
          weight: Number(form.weight || "1"),
          collectionAmount: Number(form.collectionAmount),
          priceGuarantee: form.priceGuarantee
            ? Number(form.priceGuarantee)
            : null,
          allowOpenPackage: form.allowOpenPackage,
          note: form.note || null,
          recipientName: form.recipientName,
          recipientPhone: form.recipientPhone,
          city: form.city,
          area: form.area,
          address: form.address,
          recipientEmail: form.recipientEmail || null,
          userName: currentUser || "user1",
        }),
      });

      const data = await res.json().catch(() => ({} as any));
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      Swal.fire({ icon: "success", title: labels.sent });

      // تحديث إجمالي المبيعات بعد إضافة أوردر جديد
      setTotalSales((prev) => prev + Number(form.collectionAmount || "0"));

      setForm((prev) => ({
        ...prev,
        customerPolicyNumber: "",
        collectionAmount: "",
        priceGuarantee: "",
        note: "",
        recipientName: "",
        recipientPhone: "",
        city: "",
        area: "",
        address: "",
        recipientEmail: "",
      }));
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: labels.error,
        text: err?.message || "",
      });
    } finally {
      setLoading(false);
    }
  }

  // حساب نسبة التقدم والرسالة التشجيعية
  let progress = 0;
  let remainingText = "";
  let motivation = "";
  let remainingValue: number | null = null;

  if (target && target > 0) {
    progress = Math.min(100, Math.round((totalSales / target) * 100));
    const remaining = target - totalSales;
    remainingValue = remaining > 0 ? remaining : 0;

    if (remaining <= 0) {
      remainingText = labels.exceeded;
      motivation = labels.exceeded;
    } else {
      remainingText =
        lang === "ar"
          ? `${labels.remaining}: ${remaining.toLocaleString("ar-EG")}`
          : `${labels.remaining}: ${remaining.toLocaleString("en-US")}`;

      if (progress >= 80) {
        motivation = labels.msgNear;
      } else if (progress >= 50) {
        motivation = labels.msgHalf;
      } else {
        motivation = labels.msgStart;
      }
    }
  }

  const citiesList = cities;
  const areasList = areasForSelectedCity;

  return (
    <>
      {/* Target / stats panel */}
      <section className="panel user-target-panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">{labels.targetCardTitle}</div>
            <div className="panel-subtitle">
              {loadingStats
                ? labels.targetLoading
                : !target
                ? labels.noTarget
                : ""}
            </div>
          </div>
        </div>

        <div className="user-stats-grid">
          <div className="user-stat-card user-stat-card-success">
            <div className="user-stat-label">
              {labels.totalSalesLabel}
            </div>
            <div className="user-stat-value">
              {totalSales.toLocaleString(
                lang === "ar" ? "ar-EG" : "en-US"
              )}
            </div>
          </div>

          <div className="user-stat-card user-stat-card-info">
            <div className="user-stat-label">{labels.targetLabel}</div>
            <div className="user-stat-value">
              {target
                ? target.toLocaleString(
                    lang === "ar" ? "ar-EG" : "en-US"
                  )
                : "-"}
            </div>
          </div>

          <div className="user-stat-card user-stat-card-warning">
            <div className="user-stat-label">
              {labels.remainingLabel}
            </div>
            <div className="user-stat-value">
              {remainingValue != null
                ? remainingValue.toLocaleString(
                    lang === "ar" ? "ar-EG" : "en-US"
                  )
                : "-"}
            </div>
          </div>
        </div>

        {target && !loadingStats && (
          <div className="user-progress-card">
            <div className="user-progress-header">
              <span>
                {labels.achieved}:{" "}
                {totalSales.toLocaleString(
                  lang === "ar" ? "ar-EG" : "en-US"
                )}
              </span>
              <span>
                {lang === "ar" ? "الهدف:" : "Target:"}{" "}
                {target.toLocaleString(
                  lang === "ar" ? "ar-EG" : "en-US"
                )}
              </span>
            </div>
            <div className="user-progress-bar">
              <div
                className="user-progress-bar-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="user-progress-footer">
              <span>{remainingText}</span>
              <span>{progress}%</span>
            </div>
            <div className="user-progress-motivation">{motivation}</div>
          </div>
        )}
      </section>

      {/* Form panel */}
      <section className="panel user-form-panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">{labels.mainTitle}</div>
            <div className="panel-subtitle">{labels.mainSub}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="user-grid">
            {/* لوحة بيانات الشحنة */}
            <div className="user-form-section">
              <div className="user-section-title">
                {labels.shipmentData}
              </div>
              <div className="user-section-subtitle">
                {labels.shipmentSub}
              </div>

              <div className="user-fields-grid">
                <div className="filter-group">
                  <label className="filter-label">
                    {labels.customerPolicyNumber}
                  </label>
                  <input
                    className="filter-input"
                    name="customerPolicyNumber"
                    value={form.customerPolicyNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="filter-group">
                  <label className="filter-label">
                    {labels.goodsType}
                  </label>
                  <select
                    className="filter-select"
                    name="goodsType"
                    value={form.goodsType}
                    onChange={handleChange}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Fragile">Fragile</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">
                    {labels.goodsName}
                  </label>
                  <input
                    className="filter-input"
                    name="goodsName"
                    value={form.goodsName}
                    onChange={handleChange}
                  />
                </div>

                <div className="filter-group">
                  <label className="filter-label">
                    {labels.quantity}
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="filter-input"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                  />
                </div>

                <div className="filter-group">
                  <label className="filter-label">
                    {labels.weight}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    className="filter-input"
                    name="weight"
                    value={form.weight}
                    onChange={handleChange}
                  />
                </div>

                <div className="filter-group">
                  <label className="filter-label">
                    {labels.collectionAmount}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    className="filter-input"
                    name="collectionAmount"
                    value={form.collectionAmount}
                    onChange={handleChange}
                  />
                </div>

                <div className="filter-group">
                  <label className="filter-label">
                    {labels.priceGuarantee}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    className="filter-input"
                    name="priceGuarantee"
                    value={form.priceGuarantee}
                    onChange={handleChange}
                  />
                </div>

                <div className="filter-group">
                  <label className="filter-label">
                    {labels.allowOpenPackage}
                  </label>
                  <select
                    className="filter-select"
                    name="allowOpenPackage"
                    value={form.allowOpenPackage}
                    onChange={handleChange}
                  >
                    <option value="Yes">{labels.yes}</option>
                    <option value="No">{labels.no}</option>
                  </select>
                </div>

                <div className="filter-group filter-group-full">
                  <label className="filter-label">
                    {labels.note}
                  </label>
                  <textarea
                    className="filter-input"
                    name="note"
                    rows={3}
                    value={form.note}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* لوحة بيانات المستلم */}
            <div className="user-form-section">
              <div className="user-section-title">
                {labels.receiverData}
              </div>
              <div className="user-section-subtitle">
                {labels.receiverSub}
              </div>

              <div className="user-fields-grid">
                <div className="filter-group">
                  <label className="filter-label">
                    {labels.recipientName}
                  </label>
                  <input
                    className="filter-input"
                    name="recipientName"
                    value={form.recipientName}
                    onChange={handleChange}
                  />
                </div>

                <div className="filter-group">
                  <label className="filter-label">
                    {labels.recipientPhone}
                  </label>
                  <input
                    className="filter-input"
                    name="recipientPhone"
                    value={form.recipientPhone}
                    onChange={handleChange}
                  />
                </div>

                <div className="filter-group">
                  <label className="filter-label">
                    {labels.city}
                  </label>
                  <select
                    className="filter-select"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                  >
                    <option value="">{labels.chooseCity}</option>
                    {citiesList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">
                    {labels.area}
                  </label>
                  <select
                    className="filter-select"
                    name="area"
                    value={form.area}
                    onChange={handleChange}
                    disabled={!form.city}
                  >
                    <option value="">
                      {form.city ? labels.chooseArea : labels.chooseCity}
                    </option>
                    {areasList.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group filter-group-full">
                  <label className="filter-label">
                    {labels.address}
                  </label>
                  <input
                    className="filter-input"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="filter-group filter-group-full">
                  <label className="filter-label">
                    {labels.recipientEmail}
                  </label>
                  <input
                    type="email"
                    className="filter-input"
                    name="recipientEmail"
                    value={form.recipientEmail}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="user-form-actions">
            <button
              className="btn btn-primary user-submit-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? labels.sending : labels.send}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
