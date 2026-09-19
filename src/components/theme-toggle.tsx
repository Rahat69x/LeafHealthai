import { Moon, Sun, Monitor } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLang } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useLang();

  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="size-10 rounded-full shadow-sm"
          aria-label={t("theme")}
        >
          <Icon className="size-4.5" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={
            theme === "light"
              ? "font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
              : ""
          }
        >
          <Sun className="mr-2 size-4" aria-hidden="true" /> {t("light")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={
            theme === "dark"
              ? "font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
              : ""
          }
        >
          <Moon className="mr-2 size-4" aria-hidden="true" /> {t("dark")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={
            theme === "system"
              ? "font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
              : ""
          }
        >
          <Monitor className="mr-2 size-4" aria-hidden="true" /> {t("system")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
