"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";
import { useLang } from "../providers";

const text = {
  ar: {
    appName: "نظام إدارة الأوردرات - يوزر",
    langBtn: "EN",
    light: "لايت",
    dark: "دارك",
    logout: "تسجيل الخروج",
    menu: {
      orders: "إنشاء أوردر جديد",
      reports: "تقارير الأسبوع",
      settings: "إعدادات الحساب",
    },
  },
  en: {
    appName: "Orders System - User",
    langBtn: "عربي",
    light: "Light",
    dark: "Dark",
    logout: "Logout",
    menu: {
      orders: "New order",
      reports: "Weekly reports",
      settings: "Account settings",
    },
  },
};

type MenuKey = "orders" | "reports" | "settings";

export default function UserLayout({ children }: { children: ReactNode }) {
  const { lang, toggleLang } = useLang();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const t = text[lang];

  const [currentUser, setCurrentUser] = useState<string>("user1");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("username");
    if (stored) setCurrentUser(stored);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });

      if (typeof window !== "undefined") {
        localStorage.removeItem("username");
        localStorage.removeItem("role");
      }

      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // التاب النشط حسب الـ URL
  const activeMenu: MenuKey =
    pathname === "/user" || pathname === "/user/"
      ? "orders"
      : pathname.startsWith("/user/reports")
      ? "reports"
      : "settings";

  const goTo = (path: string) => {
    router.push(path);
  };

  const makeNavClass = (key: MenuKey) =>
    "user-nav-item" + (activeMenu === key ? " user-nav-item-active" : "");

  return (
    <div className="user-layout">
      {/* SIDEBAR */}
      <aside className="user-sidebar">
        <div className="user-sidebar-header">
          <div className="user-avatar">
            {currentUser ? currentUser.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="user-sidebar-info">
            <div className="user-sidebar-name">
              {currentUser || "user"}
            </div>
            <div className="user-sidebar-role">
              {/* ممكن تترجم لو حابب */}
              {lang === "ar" ? "مستخدم" : "User"}
            </div>
          </div>
        </div>

        <nav className="user-sidebar-nav">
          <button
            type="button"
            className={makeNavClass("orders")}
            onClick={() => goTo("/user")}
          >
            {t.menu.orders}
          </button>

          <button
            type="button"
            className={makeNavClass("reports")}
            onClick={() => goTo("/user/reports")}
          >
            {t.menu.reports}
          </button>

          <button
            type="button"
            className={makeNavClass("settings")}
            onClick={() => goTo("/user/settings")}
          >
            {t.menu.settings}
          </button>
        </nav>

        <div className="user-sidebar-footer">
          <button
            type="button"
            className="user-logout-btn"
            onClick={handleLogout}
          >
            {t.logout}
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="user-main">
        {/* TOPBAR فيها بس اللغة والثيم */}
        <header className="user-topbar">
          <div className="user-topbar-left">
            <div className="user-topbar-title">{t.appName}</div>
          </div>
          <div className="user-topbar-right">
            <button className="btn" onClick={toggleLang}>
              {t.langBtn}
            </button>
            <button
              className="btn"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? t.light : t.dark}
            </button>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}
