"use client";

import { useEffect, useState, FormEvent } from "react";
import Swal from "sweetalert2";
import { useLang } from "../../providers";

type Role = "superadmin" | "admin" | "user";

type UserRecord = {
  username: string;
  name: string;
  role: Role;
  target: number | null;
};

type ReportStatus = "open" | "in_progress" | "closed" | "other";

type ReportRow = {
  id: string;
  subject: string;
  userName: string;
  createdAt: string;
  status: ReportStatus;
  message: string;
  raw: any;
};

export default function AdminUsersPage() {
  const { lang } = useLang();

  const t = {
    ar: {
      title: "إدارة المستخدمين",
      subtitle: "إضافة وتعديل الأدمن واليوزرات وتحديد أهداف المبيعات",

      username: "اسم الدخول (Username)",
      name: "الاسم الظاهر",
      role: "الصلاحية",
      target: "الهدف (جنيه)",
      role_superadmin: "سوبر أدمن",
      role_admin: "أدمن",
      role_user: "يوزر",
      addNew: "إضافة / تعديل مستخدم",
      saveUser: "حفظ المستخدم",
      usersList: "قائمة المستخدمين",
      actions: "إجراءات",
      edit: "تعديل",
      delete: "حذف",
      targetPlaceholder: "مثال: 100000",
      saved: "تم حفظ بيانات المستخدم / التارجيت",
      fillRequired: "املأ الحقول المطلوبة (username, name, role)",
      // delete flow
      deleteConfirmTitle: "حذف المستخدم؟",
      deleteConfirmText:
        "سيتم حذف هذا المستخدم نهائياً ولن يستطيع الدخول مرة أخرى.",
      deleteYes: "نعم، احذف",
      deleteCanceled: "تم الإلغاء",
      deleteSuccess: "تم حذف المستخدم بنجاح",
      errorTitle: "خطأ",

      // Tabs
      tabUsers: "المستخدمون",
      tabWeeklyReports: "تقارير الأسبوع",

      // Weekly reports
      weeklyTitle: "تقارير الأسبوع الحالي",
      weeklySubtitle:
        "التقارير التي أرسلها اليوزرات خلال هذا الأسبوع (للمتابعة السريعة).",
      loadingWeekly: "جاري تحميل تقارير الأسبوع...",
      errorWeekly:
        "تعذر تحميل تقارير الأسبوع. تأكد من إعداد API /api/reports.",
      noWeekly: "لا توجد تقارير خلال هذا الأسبوع.",
      weeklyCountLabel: "عدد تقارير الأسبوع",

      reportSubject: "عنوان التقرير",
      reportUser: "المستخدم",
      reportDate: "تاريخ الإرسال",
      reportStatus: "الحالة",
      reportActions: "إجراءات",
      viewReport: "عرض",

      status_open: "مفتوح",
      status_in_progress: "قيد المتابعة",
      status_closed: "مغلق",
      status_other: "غير محدد",

      reportDetailsTitle: "تفاصيل التقرير",
      reportFromUser: "من المستخدم",
      reportCreatedAt: "تاريخ الإرسال",
      reportMessageLabel: "نص التقرير",
    },
    en: {
      title: "Users management",
      subtitle: "Add/edit admins & users and set sales targets",

      username: "Login name (username)",
      name: "Display name",
      role: "Role",
      target: "Target (EGP)",
      role_superadmin: "Super admin",
      role_admin: "Admin",
      role_user: "User",
      addNew: "Add / edit user",
      saveUser: "Save user",
      usersList: "Users list",
      actions: "Actions",
      edit: "Edit",
      delete: "Delete",
      targetPlaceholder: "e.g. 100000",
      saved: "User / target saved",
      fillRequired: "Please fill username, name and role",
      // delete flow
      deleteConfirmTitle: "Delete user?",
      deleteConfirmText:
        "This user will be permanently removed and cannot log in again.",
      deleteYes: "Yes, delete",
      deleteCanceled: "Cancelled",
      deleteSuccess: "User deleted successfully",
      errorTitle: "Error",

      // Tabs
      tabUsers: "Users",
      tabWeeklyReports: "Weekly reports",

      // Weekly reports
      weeklyTitle: "Current week reports",
      weeklySubtitle:
        "Reports sent by users during this week (for quick monitoring).",
      loadingWeekly: "Loading weekly reports...",
      errorWeekly:
        "Failed to load weekly reports. Please check /api/reports.",
      noWeekly: "No reports for this week.",
      weeklyCountLabel: "Weekly reports count",

      reportSubject: "Report subject",
      reportUser: "User",
      reportDate: "Created at",
      reportStatus: "Status",
      reportActions: "Actions",
      viewReport: "View",

      status_open: "Open",
      status_in_progress: "In progress",
      status_closed: "Closed",
      status_other: "Unknown",

      reportDetailsTitle: "Report details",
      reportFromUser: "From user",
      reportCreatedAt: "Created at",
      reportMessageLabel: "Report message",
    },
  }[lang];

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [formUsername, setFormUsername] = useState("");
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState<Role>("user");
  const [formTarget, setFormTarget] = useState<string>("");

  // تب مفعّل حاليًا: المستخدمون أو تقارير الأسبوع
  const [activeTab, setActiveTab] = useState<"users" | "weeklyReports">(
    "users"
  );

  // تقارير الأسبوع
  const [weeklyReports, setWeeklyReports] = useState<ReportRow[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [weeklyLoaded, setWeeklyLoaded] = useState(false);
  const [loadReportsError, setLoadReportsError] = useState<string | null>(null);

  // تحميل المستخدمين
  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        const res = await fetch("/api/users");
        const data = await res.json();
        if (res.ok && data.ok && data.users) {
          const arr: UserRecord[] = Object.values(data.users).map(
            (u: any) => ({
              username: u.username,
              name: u.name,
              role: u.role as Role,
              target:
                typeof u.target === "number" && !Number.isNaN(u.target)
                  ? u.target
                  : null,
            })
          );
          arr.sort((a, b) => a.username.localeCompare(b.username));
          setUsers(arr);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error(err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  // تحميل تقارير الأسبوع (مرة واحدة عند أول فتح للتب)
  async function loadWeeklyReports() {
    try {
      setLoadingReports(true);
      setLoadReportsError(null);

      // IMPORTANT:
      // اربط هذه API لاحقًا بفلترة التقارير على مستوى الأسبوع في الباك إند
      const res = await fetch("/api/reports?period=week");
      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const txt = await res.text();
        console.error(
          "[AdminUsersPage] Expected JSON for weekly reports, got:",
          contentType,
          txt.slice(0, 200)
        );
        throw new Error("Non-JSON response from /api/reports");
      }

      const data = await res.json();
      if (!res.ok || data.ok === false) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const rows: any[] = Array.isArray(data.rows) ? data.rows : [];
      const mapped: ReportRow[] = rows.map((r, index) =>
        mapReportRow(r, index)
      );
      setWeeklyReports(mapped);
    } catch (err: any) {
      console.error(err);
      setLoadReportsError(err?.message || t.errorWeekly);
      setWeeklyReports([]);
    } finally {
      setLoadingReports(false);
      setWeeklyLoaded(true);
    }
  }

  function switchTab(tab: "users" | "weeklyReports") {
    setActiveTab(tab);
    if (tab === "weeklyReports" && !weeklyLoaded) {
      loadWeeklyReports();
    }
  }

  function handleEdit(user: UserRecord) {
    setFormUsername(user.username);
    setFormName(user.name);
    setFormRole(user.role);
    setFormTarget(user.target != null ? String(user.target) : "");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!formUsername.trim() || !formName.trim() || !formRole) {
      Swal.fire({ icon: "warning", title: t.fillRequired });
      return;
    }

    const targetNumber =
      formTarget.trim() === "" ? null : Number(formTarget.trim());

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formUsername.trim(),
          name: formName.trim(),
          role: formRole,
          target:
            targetNumber !== null && !Number.isNaN(targetNumber)
              ? targetNumber
              : null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const arr: UserRecord[] = Object.values(data.users).map((u: any) => ({
        username: u.username,
        name: u.name,
        role: u.role as Role,
        target:
          typeof u.target === "number" && !Number.isNaN(u.target)
            ? u.target
            : null,
      }));
      arr.sort((a, b) => a.username.localeCompare(b.username));
      setUsers(arr);

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

  async function handleDelete(user: UserRecord) {
    const result = await Swal.fire({
      title: t.deleteConfirmTitle,
      text: t.deleteConfirmText,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t.deleteYes,
    });

    if (!result.isConfirmed) {
      Swal.fire({
        icon: "info",
        title: t.deleteCanceled,
      });
      return;
    }

    try {
      const res = await fetch("/api/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username }),
      });

      const data = await res.json().catch(() => ({} as any));
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const arr: UserRecord[] = Object.values(data.users).map((u: any) => ({
        username: u.username,
        name: u.name,
        role: u.role as Role,
        target:
          typeof u.target === "number" && !Number.isNaN(u.target)
            ? u.target
            : null,
      }));
      arr.sort((a, b) => a.username.localeCompare(b.username));
      setUsers(arr);

      Swal.fire({
        icon: "success",
        title: t.deleteSuccess,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: t.errorTitle,
        text: String((err as any)?.message || err),
      });
    }
  }

  function handleViewReport(r: ReportRow) {
    Swal.fire({
      title: t.reportDetailsTitle,
      html: `
        <div style="text-align:${lang === "ar" ? "right" : "left"}; font-size:13px;">
          <p><strong>${t.reportSubject}:</strong> ${escapeHtml(
            r.subject
          )}</p>
          <p><strong>${t.reportFromUser}:</strong> ${escapeHtml(
            r.userName
          )}</p>
          <p><strong>${t.reportCreatedAt}:</strong> ${escapeHtml(
            r.createdAt
          )}</p>
          <hr style="margin:8px 0;" />
          <p><strong>${t.reportMessageLabel}:</strong></p>
          <div style="white-space:pre-wrap; margin-top:4px;">
            ${escapeHtml(r.message)}
          </div>
        </div>
      `,
      confirmButtonText: "OK",
    });
  }

  return (
    <>
      {/* فورم إضافة/تعديل مستخدم */}
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
            <label className="filter-label">{t.username}</label>
            <input
              className="filter-input"
              value={formUsername}
              onChange={(e) => setFormUsername(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">{t.name}</label>
            <input
              className="filter-input"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">{t.role}</label>
            <select
              className="filter-select"
              value={formRole}
              onChange={(e) => setFormRole(e.target.value as Role)}
            >
              <option value="superadmin">{t.role_superadmin}</option>
              <option value="admin">{t.role_admin}</option>
              <option value="user">{t.role_user}</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">{t.target}</label>
            <input
              type="number"
              min={0}
              step={500}
              className="filter-input"
              placeholder={t.targetPlaceholder}
              value={formTarget}
              onChange={(e) => setFormTarget(e.target.value)}
            />
          </div>
          <div className="filters-actions">
            <button className="btn btn-primary" type="submit">
              {t.saveUser}
            </button>
          </div>
        </form>
      </section>

      {/* جدول المستخدمين / تقارير الأسبوع (Tabs) */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">
              {activeTab === "users" ? t.usersList : t.weeklyTitle}
            </div>
            <div className="panel-subtitle">
              {activeTab === "users" ? (
                loading ? (
                  "Loading..."
                ) : (
                  ""
                )
              ) : (
                <>
                  {t.weeklySubtitle}
                  {loadingReports && (
                    <>
                      {" — "}
                      {t.loadingWeekly}
                    </>
                  )}
                  {loadReportsError && (
                    <span
                      style={{
                        color: "var(--danger)",
                        marginInlineStart: "8px",
                      }}
                    >
                      {loadReportsError}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            {activeTab === "weeklyReports" && (
              <div className="panel-subtitle">
                {t.weeklyCountLabel}:{" "}
                <strong>
                  {loadingReports ? "..." : weeklyReports.length}
                </strong>
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "0.25rem",
                padding: "0.15rem",
                borderRadius: "999px",
                border: "1px solid var(--border-soft)",
              }}
            >
              <button
                type="button"
                className="btn"
                onClick={() => switchTab("users")}
                style={{
                  padding: "0.25rem 0.7rem",
                  fontSize: "0.75rem",
                  borderRadius: "999px",
                  border: "none",
                  backgroundColor:
                    activeTab === "users" ? "var(--accent)" : "transparent",
                  color: activeTab === "users" ? "#ffffff" : "inherit",
                }}
              >
                {t.tabUsers}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => switchTab("weeklyReports")}
                style={{
                  padding: "0.25rem 0.7rem",
                  fontSize: "0.75rem",
                  borderRadius: "999px",
                  border: "none",
                  backgroundColor:
                    activeTab === "weeklyReports"
                      ? "var(--accent)"
                      : "transparent",
                  color:
                    activeTab === "weeklyReports" ? "#ffffff" : "inherit",
                }}
              >
                {t.tabWeeklyReports}
              </button>
            </div>
          </div>
        </div>

        {/* محتوى التاب النشط */}
        {activeTab === "users" ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>{t.username}</th>
                  <th>{t.name}</th>
                  <th>{t.role}</th>
                  <th>{t.target}</th>
                  <th>{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.username}>
                    <td>{u.username}</td>
                    <td>{u.name}</td>
                    <td>
                      {u.role === "superadmin"
                        ? t.role_superadmin
                        : u.role === "admin"
                        ? t.role_admin
                        : t.role_user}
                    </td>
                    <td>
                      {u.target != null
                        ? u.target.toLocaleString(
                            lang === "ar" ? "ar-EG" : "en-US"
                          )
                        : "-"}
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          type="button"
                          onClick={() => handleEdit(u)}
                        >
                          {t.edit}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(u)}
                        >
                          {t.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center" }}>
                      {lang === "ar" ? "لا يوجد مستخدمون" : "No users"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t.reportSubject}</th>
                  <th>{t.reportUser}</th>
                  <th>{t.reportDate}</th>
                  <th>{t.reportStatus}</th>
                  <th>{t.reportActions}</th>
                </tr>
              </thead>
              <tbody>
                {!loadingReports && weeklyReports.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{ textAlign: "center", padding: "0.8rem" }}
                    >
                      {t.noWeekly}
                    </td>
                  </tr>
                )}

                {weeklyReports.map((r, index) => (
                  <tr key={r.id}>
                    <td>{index + 1}</td>
                    <td>{r.subject}</td>
                    <td>{r.userName}</td>
                    <td>{r.createdAt}</td>
                    <td>
                      <span
                        className={
                          "status-pill " +
                          (r.status === "closed"
                            ? "status-delivered"
                            : "status-pending")
                        }
                      >
                        {renderReportStatusLabel(r.status, t)}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          type="button"
                          onClick={() => handleViewReport(r)}
                        >
                          {t.viewReport}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

/* ===== Helpers ===== */

function mapReportRow(r: any, index: number): ReportRow {
  const id =
    r.id ??
    r.Id ??
    r.ID ??
    r.ReportId ??
    r["Report ID"] ??
    `R-${index + 1}`;

  const subject =
    r.subject ??
    r.Subject ??
    r["Subject"] ??
    r["عنوان"] ??
    r["Title"] ??
    "";

  const userName =
    r.userName ??
    r.UserName ??
    r["User"] ??
    r["المستخدم"] ??
    r["CreatedBy"] ??
    "";

  const message =
    r.message ??
    r.Message ??
    r["Message"] ??
    r["النص"] ??
    r["Text"] ??
    "";

  const createdRaw =
    r.createdAt ??
    r.CreatedAt ??
    r["Created At"] ??
    r["تاريخ الإرسال"] ??
    "";
  const createdAt =
    createdRaw instanceof Date ? formatDate(createdRaw) : String(createdRaw);

  const statusRaw =
    r.status ?? r.Status ?? r["Status"] ?? r["الحالة"] ?? "";
  const status = normalizeReportStatus(statusRaw);

  return {
    id: String(id),
    subject: String(subject),
    userName: String(userName),
    createdAt: String(createdAt || ""),
    status,
    message: String(message),
    raw: r,
  };
}

function formatDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function normalizeReportStatus(value: any): ReportStatus {
  const s = String(value || "").toLowerCase();
  if (!s) return "other";
  if (s.includes("open") || s.includes("مفتوح")) return "open";
  if (s.includes("progress") || s.includes("متابعة")) return "in_progress";
  if (s.includes("closed") || s.includes("مغلق")) return "closed";
  return "other";
}

function renderReportStatusLabel(status: ReportStatus, t: any): string {
  if (status === "open") return t.status_open;
  if (status === "in_progress") return t.status_in_progress;
  if (status === "closed") return t.status_closed;
  return t.status_other;
}

function escapeHtml(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
