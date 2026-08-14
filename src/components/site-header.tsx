import { useState } from "react";
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
  const path = useRouterState({ select: (state) => state.location.pathname });

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
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Leaf className="size-5" aria-hidden="true" />
          </span>
          <span className="truncate text-lg font-bold text-foreground">{t("brand")}</span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <nav aria-label="Main" className="hidden items-center gap-0.5 2xl:flex">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`whitespace-nowrap rounded-full px-2.5 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                  path === link.to ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <LanguageSelect />
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="min-h-11 min-w-11 rounded-full 2xl:hidden"
                aria-label={t("menu")}
              >
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>{t("menu")}</SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile" className="grid gap-1 px-4 pb-6">
                {links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent"
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
