"use client";

import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";
import { useLang } from "../providers";

const translations = {
  ar: {
    appName: "نظام إدارة الأوردرات",
    langBtn: "EN",
    light: "فاتح",
    dark: "غامق",
    menu: {
      dashboard: "لوحة التحكم",
      orders: "الأوردرات",
      users: "المستخدمون",
      products: "المنتجات",
      reports: "التقارير",
      costs: "المصروفات", // جديد
      settings: "الإعدادات",
    },
    sections: {
      dashboard: {
        title: "لوحة التحكم",
        subtitle: "ملخص سريع للأوردرات والمستخدمين",
      },
      orders: {
        title: "إدارة الأوردرات",
        subtitle: "عرض وتعديل كل الأوردرات",
      },
      users: {
        title: "إدارة المستخدمين",
        subtitle: "التحكم في التلات مستخدمين ومتابعة أدائهم",
      },
      products: {
        title: "إدارة المنتجات",
        subtitle: "تحديث قائمة المنتجات لتظهر عند المستخدمين",
      },
      reports: {
        title: "التقارير",
        subtitle: "استخراج تقارير عن المبيعات والأوردرات",
      },
      costs: {
        // جديد
        title: "إدارة المصروفات",
        subtitle: "تسجيل ومتابعة مصروفات الموظفين، الحملات، الإيجار وغيرها",
      },
      settings: {
        title: "الإعدادات",
        subtitle: "تخصيص إعدادات النظام العامة",
      },
    },
    adminRole: "مدير النظام",
    logout: "تسجيل الخروج",
  },
  en: {
    appName: "Orders Management System",
    beta: "Beta version",
    langBtn: "عربي",
    light: "Light",
    dark: "Dark",
    menu: {
      dashboard: "Dashboard",
      orders: "Orders",
      users: "Users",
      products: "Products",
      reports: "Reports",
      costs: "Costs", // new
      settings: "Settings",
    },
    sections: {
      dashboard: {
        title: "Dashboard",
        subtitle: "Quick overview for orders and users",
      },
      orders: {
        title: "Orders Management",
        subtitle: "View and edit all orders",
      },
      users: {
        title: "Users Management",
        subtitle: "Control the 3 users and track performance",
      },
      products: {
        title: "Products Management",
        subtitle: "Update products list used by users",
      },
      reports: {
        title: "Reports",
        subtitle: "Generate sales and orders reports",
      },
      costs: {
        // new
        title: "Costs management",
        subtitle:
          "Track all expenses (salaries, campaigns, rent, delivery and more)",
      },
      settings: {
        title: "Settings",
        subtitle: "Customize global system settings",
      },
    },
    adminRole: "Administrator",
    logout: "Logout",
  },
};

type SectionKey =
  | "dashboard"
  | "orders"
  | "users"
  | "products"
  | "reports"
  | "costs"  
  | "settings";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useTheme();
  const { lang, toggleLang } = useLang();
  const t = translations[lang];
  const pathname = usePathname();
  const router = useRouter();

  const section: SectionKey =
    pathname === "/admin"
      ? "dashboard"
      : pathname.startsWith("/admin/orders")
      ? "orders"
      : pathname.startsWith("/admin/users")
      ? "users"
      : pathname.startsWith("/admin/products")
      ? "products"
      : pathname.startsWith("/admin/reports")
      ? "reports"
      : pathname.startsWith("/admin/costs") // جديد
      ? "costs"
      : "settings";

  const sec = t.sections[section];

  const makeLinkClass = (key: SectionKey) =>
    "sidebar-link" + (section === key ? " active" : "");

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

  return (
    <div className="layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-dot" />
          <span>{t.appName}</span>
        </div>

        <ul className="sidebar-nav">
          <li>
            <a href="/admin" className={makeLinkClass("dashboard")}>
              {t.menu.dashboard}
            </a>
          </li>
          <li>
            <a href="/admin/orders" className={makeLinkClass("orders")}>
              {t.menu.orders}
            </a>
          </li>
          <li>
            <a href="/admin/users" className={makeLinkClass("users")}>
              {t.menu.users}
            </a>
          </li>
          <li>
            <a href="/admin/products" className={makeLinkClass("products")}>
              {t.menu.products}
            </a>
          </li>
          <li>
            <a href="/admin/reports" className={makeLinkClass("reports")}>
              {t.menu.reports}
            </a>
          </li>
          {/* زر المصروفات الجديد */}
          <li>
            <a href="/admin/costs" className={makeLinkClass("costs")}>
              {t.menu.costs}
            </a>
          </li>
          <li>
            <a href="/admin/settings" className={makeLinkClass("settings")}>
              {t.menu.settings}
            </a>
          </li>
        </ul>

        <div className="sidebar-footer">{t.beta}</div>
      </aside>

      {/* MAIN */}
      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-title">{sec.title}</div>
            <div className="topbar-subtitle">{sec.subtitle}</div>
          </div>
          <div className="topbar-right">
            <button className="btn" onClick={toggleLang}>
              {t.langBtn}
            </button>
            <button
              className="btn"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? t.light : t.dark}
            </button>
            <button className="btn btn-danger" onClick={handleLogout}>
              {t.logout}
            </button>
            <div className="topbar-user">
              <div className="topbar-user-name">Admin</div>
              <div className="topbar-user-role">{t.adminRole}</div>
            </div>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}
