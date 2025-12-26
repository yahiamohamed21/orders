"use client";

import { useEffect, useState, FormEvent } from "react";
import Swal from "sweetalert2";
import { useLang } from "../../providers";

type FormConfig = {
  id: string;
  nameAr: string;
  nameEn: string;
  sheetName: string;
  active: boolean;
};

export default function AdminFormsPage() {
  const { lang } = useLang();

  const t = {
    ar: {
      title: "إدارة الفورمات",
      subtitle:
        "تحكم في الفورمات التي تظهر لليوزر، مع ربط كل فورم بشيت إكسيل معيّن.",
      id: "المعرّف (ID) للفورم",
      idHint: "يُستخدم في الكود والـ API، مثال: default, cod_orders",
      nameAr: "اسم الفورم (عربي)",
      nameEn: "اسم الفورم (إنجليزي)",
      sheetName: "اسم الـ Sheet في ملف الإكسيل",
      sheetHint: "يجب أن يطابق اسم الـ Sheet داخل ملف الإكسيل",
      active: "مفعّل",
      addEditTitle: "إضافة / تعديل فورم",
      save: "حفظ الفورم",
      reset: "تفريغ الحقول",
      listTitle: "قائمة الفورمات",
      colId: "ID",
      colName: "الاسم",
      colSheet: "Sheet",
      colActive: "مفعّلة؟",
      colActions: "إجراءات",
      yes: "نعم",
      no: "لا",
      edit: "تعديل",
      toggleOn: "تفعيل",
      toggleOff: "إيقاف",
      delete: "حذف",
      confirmDeleteTitle: "حذف الفورم؟",
      confirmDeleteText:
        "سيتم حذف هذه الفورم من لوحة التحكم، تأكد من عدم استخدامها في الكود.",
      confirmYes: "نعم، احذف",
      confirmCanceled: "تم الإلغاء",
      deleted: "تم حذف الفورم",
      saved: "تم حفظ الفورم بنجاح",
      required:
        "من فضلك املأ الحقول: ID، اسم عربي، اسم إنجليزي، اسم الـ Sheet.",
      errorTitle: "خطأ",
      noForms: "لا توجد فورمات حتى الآن",
    },
    en: {
      title: "Forms management",
      subtitle:
        "Control which forms appear to users, and link each form to a specific Excel sheet.",
      id: "Form ID",
      idHint: "Used in code & API, e.g. default, cod_orders",
      nameAr: "Form name (Arabic)",
      nameEn: "Form name (English)",
      sheetName: "Sheet name in Excel file",
      sheetHint: "Must match the sheet name inside the Excel file",
      active: "Active",
      addEditTitle: "Add / edit form",
      save: "Save form",
      reset: "Reset form",
      listTitle: "Forms list",
      colId: "ID",
      colName: "Name",
      colSheet: "Sheet",
      colActive: "Active?",
      colActions: "Actions",
      yes: "Yes",
      no: "No",
      edit: "Edit",
      toggleOn: "Activate",
      toggleOff: "Deactivate",
      delete: "Delete",
      confirmDeleteTitle: "Delete form?",
      confirmDeleteText:
        "This form will be removed from the panel. Make sure it's not used in code.",
      confirmYes: "Yes, delete",
      confirmCanceled: "Cancelled",
      deleted: "Form deleted",
      saved: "Form saved successfully",
      required:
        "Please fill ID, Arabic name, English name, and sheet name.",
      errorTitle: "Error",
      noForms: "No forms yet",
    },
  }[lang];

  const [forms, setForms] = useState<FormConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const [id, setId] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [sheetName, setSheetName] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    async function loadForms() {
      try {
        setLoading(true);
        const res = await fetch("/api/forms");
        const data = await res.json();
        if (res.ok && data.ok && Array.isArray(data.forms)) {
          setForms(data.forms);
        } else {
          setForms([]);
        }
      } catch (err) {
        console.error(err);
        setForms([]);
      } finally {
        setLoading(false);
      }
    }

    loadForms();
  }, []);

  function handleEdit(form: FormConfig) {
    setId(form.id);
    setNameAr(form.nameAr);
    setNameEn(form.nameEn);
    setSheetName(form.sheetName);
    setActive(form.active);
  }

  function handleReset() {
    setId("");
    setNameAr("");
    setNameEn("");
    setSheetName("");
    setActive(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!id.trim() || !nameAr.trim() || !nameEn.trim() || !sheetName.trim()) {
      Swal.fire({ icon: "warning", title: t.required });
      return;
    }

    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: id.trim(),
          nameAr: nameAr.trim(),
          nameEn: nameEn.trim(),
          sheetName: sheetName.trim(),
          active,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setForms(data.forms as FormConfig[]);

      Swal.fire({ icon: "success", title: t.saved });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: t.errorTitle,
        text: String((err as any)?.message || err),
      });
    }
  }

  async function handleToggle(form: FormConfig) {
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          active: !form.active,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setForms(data.forms as FormConfig[]);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: t.errorTitle,
        text: String((err as any)?.message || err),
      });
    }
  }

  async function handleDelete(form: FormConfig) {
    const result = await Swal.fire({
      icon: "warning",
      title: t.confirmDeleteTitle,
      text: t.confirmDeleteText,
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t.confirmYes,
    });

    if (!result.isConfirmed) {
      Swal.fire({ icon: "info", title: t.confirmCanceled });
      return;
    }

    try {
      const res = await fetch("/api/forms", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: form.id }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setForms(data.forms as FormConfig[]);
      Swal.fire({ icon: "success", title: t.deleted });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: t.errorTitle,
        text: String((err as any)?.message || err),
      });
    }
  }

  return (
    <>
      {/* فورم إضافة / تعديل فورم */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">{t.title}</div>
            <div className="panel-subtitle">{t.subtitle}</div>
          </div>
        </div>

        <form
          className="filters"
          style={{ marginTop: 0 }}
          onSubmit={handleSubmit}
        >
          <div className="filter-group">
            <label className="filter-label">{t.id}</label>
            <input
              className="filter-input"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                marginTop: "0.1rem",
              }}
            >
              {t.idHint}
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">{t.nameAr}</label>
            <input
              className="filter-input"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">{t.nameEn}</label>
            <input
              className="filter-input"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">{t.sheetName}</label>
            <input
              className="filter-input"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
            />
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                marginTop: "0.1rem",
              }}
            >
              {t.sheetHint}
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">{t.active}</label>
            <select
              className="filter-select"
              value={active ? "1" : "0"}
              onChange={(e) => setActive(e.target.value === "1")}
            >
              <option value="1">{t.yes}</option>
              <option value="0">{t.no}</option>
            </select>
          </div>

          <div className="filters-actions">
            <button className="btn btn-primary" type="submit">
              {t.save}
            </button>
            <button
              className="btn"
              type="button"
              onClick={handleReset}
            >
              {t.reset}
            </button>
          </div>
        </form>
      </section>

      {/* جدول الفورمات */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">{t.listTitle}</div>
            <div className="panel-subtitle">
              {loading ? "Loading..." : ""}
            </div>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>{t.colId}</th>
                <th>{t.colName}</th>
                <th>{t.colSheet}</th>
                <th>{t.colActive}</th>
                <th>{t.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {!loading && forms.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: "center", padding: "0.7rem" }}
                  >
                    {t.noForms}
                  </td>
                </tr>
              )}

              {forms.map((form) => (
                <tr key={form.id}>
                  <td>{form.id}</td>
                  <td>
                    {lang === "ar"
                      ? form.nameAr
                      : `${form.nameEn} / ${form.nameAr}`}
                  </td>
                  <td>{form.sheetName}</td>
                  <td>
                    {form.active ? (
                      <span className="status-pill status-delivered">
                        {t.yes}
                      </span>
                    ) : (
                      <span className="status-pill status-pending">
                        {t.no}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        type="button"
                        onClick={() => handleEdit(form)}
                      >
                        {t.edit}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggle(form)}
                      >
                        {form.active ? t.toggleOff : t.toggleOn}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(form)}
                      >
                        {t.delete}
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
