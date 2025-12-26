import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

// إعداد Font Awesome مع Next.js
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

// منع إضافة الـ CSS تلقائيًا (ضروري مع Next.js)
config.autoAddCss = false;

export const metadata: Metadata = {
  title: "Orders System",
  description: "Admin & users order management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
