"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useLang } from "../providers";

export default function LoginPage() {
  const { lang, toggleLang } = useLang();
  const router = useRouter();

  const t = {
    ar: {
      title: "تسجيل الدخول",
      subtitle: "ادخل بيانات حسابك للوصول لنظام إدارة الأوردرات",
      username: "اسم المستخدم",
      password: "كلمة المرور",
      login: "دخول",
      loggingIn: "جاري الدخول...",
      error: "خطأ في تسجيل الدخول",
      fill: "من فضلك ادخل اسم المستخدم وكلمة المرور",
      brandTitle: "إدارة الأوردرات باحترافية",
      brandLine1: "تابع أداء فريق المبيعات لحظيًا.",
      brandLine2: "تصدير مباشر إلى شيت الإكسيل.",
      brandLine3: "أهداف شهرية، تقارير، ومتابعة دقيقة.",
      langBtn: "English",
    },
    en: {
      title: "Sign in",
      subtitle: "Enter your credentials to access the orders system",
      username: "Username",
      password: "Password",
      login: "Login",
      loggingIn: "Signing in...",
      error: "Login error",
      fill: "Please enter username and password",
      brandTitle: "Manage your orders like a pro",
      brandLine1: "Track your sales team in real time.",
      brandLine2: "Export directly to Excel sheets.",
      brandLine3: "Monthly targets, reports and insights.",
      langBtn: "عربي",
    },
  }[lang];

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      Swal.fire({ icon: "warning", title: t.fill });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("username", username.trim());
        localStorage.setItem("role", data.role);
      }

      if (data.role === "user") {
        router.push("/user");
      } else {
        router.push("/admin");
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: t.error,
        text: err?.message || "",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        {/* الجزء الأيسر: البراند */}
        <div className="login-brand">
          <div className="login-brand-logo">
            <span className="login-logo-dot" />
            <span className="login-logo-text">
              {lang === "ar"
                ? "نظام إدارة الأوردرات"
                : "Orders Management System"}
            </span>
          </div>
          <h1 className="login-brand-title">{t.brandTitle}</h1>
          <ul className="login-brand-list">
            <li>{t.brandLine1}</li>
            <li>{t.brandLine2}</li>
            <li>{t.brandLine3}</li>
          </ul>
        </div>

        {/* الجزء الأيمن: فورم اللوجين */}
        <div className="login-form-wrapper">
          <div className="login-form-header">
            <button className="login-lang-btn" onClick={toggleLang}>
              {t.langBtn}
            </button>
          </div>

          <div className="login-form-body">
            <h2 className="login-title">{t.title}</h2>
            <p className="login-subtitle">{t.subtitle}</p>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-field">
                <label className="login-label">{t.username}</label>
                <input
                  className="login-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={lang === "ar" ? "مثال: user1" : "e.g. user1"}
                />
              </div>

              <div className="login-field">
                <label className="login-label">{t.password}</label>
                <input
                  type="password"
                  className="login-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="******"
                />
              </div>

              <button
                className="login-submit-btn"
                type="submit"
                disabled={loading}
              >
                {loading ? t.loggingIn : t.login}
              </button>

            </form>
          </div>
        </div>
      </div>

      {/* خلفية شكلية في الأسفل */}
      <div className="login-bg-blur login-bg-blur-1" />
      <div className="login-bg-blur login-bg-blur-2" />
    </div>
  );
}
