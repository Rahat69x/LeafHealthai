import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LANGS, useLang } from "@/lib/i18n";

export function LanguageSelect() {
  const { lang, setLang, t } = useLang();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="size-10 rounded-full shadow-sm"
          aria-label={t("language")}
        >
          <Languages className="size-4.5" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t("language")}</DropdownMenuLabel>
        {LANGS.map((item) => (
          <DropdownMenuItem
            key={item.code}
            onClick={() => setLang(item.code)}
            className={
              lang === item.code
                ? "font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                : ""
            }
          >
            {item.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <p className="px-2.5 py-1 text-[11px] text-muted-foreground">{t("langNote")}</p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
