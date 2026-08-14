import { Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";

import { useLang } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useLang();

  return (
    <footer className="mt-14 border-t bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="flex items-center gap-2 text-base font-bold text-foreground">
            <Leaf className="size-5 text-primary" aria-hidden="true" /> {t("brand")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            A simple leaf check for farmers and gardeners. Photos stay on your device.
          </p>
        </div>
        <nav aria-label="Footer" className="grid gap-2 text-sm">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            {t("navHome")}
          </Link>
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
            {t("navDashboard")}
          </Link>
          <Link to="/knowledge" className="text-muted-foreground hover:text-foreground">
            {t("navLibrary")}
          </Link>
        </nav>
        <nav aria-label="Help" className="grid gap-2 text-sm">
          <Link to="/faq" className="text-muted-foreground hover:text-foreground">
            {t("navFaq")}
          </Link>
          <Link to="/about" className="text-muted-foreground hover:text-foreground">
            {t("navAbout")}
          </Link>
          <Link to="/contact" className="text-muted-foreground hover:text-foreground">
            {t("navContact")}
          </Link>
        </nav>
      </div>
      <p className="border-t px-4 py-4 text-center text-xs text-muted-foreground">
        This result is a guide only. Ask a local plant expert before using any chemical.
      </p>
    </footer>
  );
}
