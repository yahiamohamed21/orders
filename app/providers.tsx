"use client";

import { ThemeProvider } from "next-themes";
import React, { createContext, useContext, useEffect, useState } from "react";

type Lang = "ar" | "en";

type LangContextType = {
  lang: Lang;
  toggleLang: () => void;
};

const LangContext = createContext<LangContextType | undefined>(undefined);

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("ar");

  const toggleLang = () => {
    setLang((prev) => (prev === "ar" ? "en" : "ar"));
  };

  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, toggleLang }}>
      <ThemeProvider attribute="class" defaultTheme="light">
        {children}
      </ThemeProvider>
    </LangContext.Provider>
  );
}
