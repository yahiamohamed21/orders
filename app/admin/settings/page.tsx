// app/admin/settings/page.tsx
"use client";

import { useLang } from "../../providers";
import Swal from "sweetalert2";
import type { FormEvent } from "react";

export default function AdminSettingsPage() {
  const { lang } = useLang();

  const t = {
    ar: {
      generalTitle: "إعدادات عامة",
      generalSub: "تغيير اسم النظام والعملة الافتراضية",
      systemName: "اسم النظام",
      currency: "العملة الافتراضية",
      language: "لغة الواجهة",
      timezone: "المنطقة الزمنية",
      saveGeneral: "حفظ الإعدادات",
      cancel: "إلغاء",
      securityTitle: "إعدادات الأمان",
      securitySub: "إدارة كلمة مرور الأدمن وبعض الخيارات",
      currentPass: "كلمة المرور الحالية",
      newPass: "كلمة المرور الجديدة",
      confirmPass: "تأكيد كلمة المرور الجديدة",
      autoLogout: "تسجيل الخروج تلقائيًا بعد",
      noAuto: "لا يتم تسجيل الخروج التلقائي",
      mins15: "15 دقيقة",
      mins30: "30 دقيقة",
      mins60: "60 دقيقة",
      updatePass: "تحديث كلمة المرور",
      generalSaved: "تم حفظ الإعدادات العامة",
      passUpdated: "تم تحديث كلمة المرور",
    },
    en: {
      generalTitle: "General settings",
      generalSub: "Change system name and default currency",
      systemName: "System name",
      currency: "Default currency",
      language: "Interface language",
      timezone: "Time zone",
      saveGeneral: "Save settings",
      cancel: "Cancel",
      securityTitle: "Security settings",
      securitySub: "Manage admin password and security options",
      currentPass: "Current password",
      newPass: "New password",
      confirmPass: "Confirm new password",
      autoLogout: "Auto logout after",
      noAuto: "No auto logout",
      mins15: "15 minutes",
      mins30: "30 minutes",
      mins60: "60 minutes",
      updatePass: "Update password",
      generalSaved: "General settings saved",
      passUpdated: "Password updated",
    },
  }[lang];

  function handleGeneralSubmit(e: FormEvent) {
    e.preventDefault();
    // TODO: call API to save general settings
    Swal.fire({ icon: "success", title: t.generalSaved });
  }

  function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    // TODO: call API to update password
    Swal.fire({ icon: "success", title: t.passUpdated });
  }

  return (
    <>
      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">{t.generalTitle}</div>
            <div className="panel-subtitle">{t.generalSub}</div>
          </div>
        </div>

        <form
          className="filters"
          style={{ marginTop: 0 }}
          onSubmit={handleGeneralSubmit}
        >
          <div className="filter-group">
            <label className="filter-label">{t.systemName}</label>
            <input
              type="text"
              className="filter-input"
              defaultValue={
                lang === "ar" ? "نظام إدارة الأوردرات" : "Orders Management System"
              }
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">{t.currency}</label>
            <select className="filter-select">
              <option>جنيه مصري (EGP)</option>
              <option>ريال سعودي (SAR)</option>
              <option>دولار أمريكي (USD)</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">{t.language}</label>
            <select className="filter-select">
              <option>{lang === "ar" ? "العربية" : "Arabic"}</option>
              <option>{lang === "ar" ? "الإنجليزية" : "English"}</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">{t.timezone}</label>
            <select className="filter-select">
              <option>Africa/Cairo</option>
              <option>Asia/Riyadh</option>
              <option>UTC</option>
            </select>
          </div>
          <div className="filters-actions">
            <button className="btn btn-primary" type="submit">
              {t.saveGeneral}
            </button>
            <button className="btn" type="button">
              {t.cancel}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">{t.securityTitle}</div>
            <div className="panel-subtitle">{t.securitySub}</div>
          </div>
        </div>

        <form
          className="filters"
          style={{ marginTop: 0 }}
          onSubmit={handlePasswordSubmit}
        >
          <div className="filter-group">
            <label className="filter-label">{t.currentPass}</label>
            <input type="password" className="filter-input" />
          </div>
          <div className="filter-group">
            <label className="filter-label">{t.newPass}</label>
            <input type="password" className="filter-input" />
          </div>
          <div className="filter-group">
            <label className="filter-label">{t.confirmPass}</label>
            <input type="password" className="filter-input" />
          </div>
          <div className="filter-group">
            <label className="filter-label">{t.autoLogout}</label>
            <select className="filter-select">
              <option>{t.noAuto}</option>
              <option>{t.mins15}</option>
              <option>{t.mins30}</option>
              <option>{t.mins60}</option>
            </select>
          </div>
          <div className="filters-actions">
            <button className="btn btn-primary" type="submit">
              {t.updatePass}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
