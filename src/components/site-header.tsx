import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Leaf, Menu } from "lucide-react";

import { LanguageSelect } from "@/components/language-select";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useLang } from "@/lib/i18n";

export function SiteHeader() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { to: "/", label: t("navHome") },
    { to: "/dashboard", label: t("navDashboard") },
    { to: "/advisor", label: t("navAdvisor") },
    { to: "/care", label: t("navCare") },
    { to: "/outbreaks", label: t("navOutbreaks") },
    { to: "/weather", label: t("navWeather") },
    { to: "/knowledge", label: t("navLibrary") },
    { to: "/faq", label: t("navFaq") },
    { to: "/about", label: t("navAbout") },
    { to: "/contact", label: t("navContact") },
  ] as const;

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 ${
        scrolled
          ? "border-b border-white/50 dark:border-white/10 bg-white/75 dark:bg-slate-950/70 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
          : "border-b border-transparent bg-background/50 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-2.5 group">
          <span className="glass-icon-3d size-10 shrink-0 rounded-2xl transition-transform duration-200 group-hover:scale-105">
            <Leaf className="size-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          </span>
          <span className="truncate text-lg font-extrabold tracking-tight text-foreground">
            {t("brand")}
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <nav
            aria-label="Main"
            className="hidden items-center gap-1 rounded-full border border-white/50 dark:border-white/10 bg-white/40 dark:bg-white/5 p-1 backdrop-blur-xl 2xl:flex"
          >
            {links.map((link) => {
              const active = path === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    active
                      ? "bg-white/90 dark:bg-white/20 text-foreground shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-white/70 dark:border-white/15"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <LanguageSelect />
          <ThemeToggle />

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="min-h-10 min-w-10 rounded-full 2xl:hidden"
                aria-label={t("menu")}
              >
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-72 bg-card/90 backdrop-blur-2xl border-white/40 dark:border-white/10"
            >
              <SheetHeader>
                <SheetTitle>{t("menu")}</SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile" className="grid gap-1 px-4 pb-6 mt-4">
                {links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3.5 py-3 text-base font-semibold text-foreground transition-all duration-200 hover:bg-white/60 dark:hover:bg-white/10"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
