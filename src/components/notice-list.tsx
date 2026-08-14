import { ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Notice } from "@/lib/notifications";

const tone: Record<Notice["tone"], string> = {
  danger: "border-destructive/50 bg-destructive/10",
  warn: "border-amber/50 bg-amber/10",
  info: "border-primary/30 bg-primary/5",
  good: "border-fern/50 bg-fern/10",
};

export function NoticeList({ notices }: { notices: Notice[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldCheck className="size-5 text-primary" aria-hidden="true" /> Alerts for you
          {notices.length > 0 && <Badge variant="secondary">{notices.length}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {notices.length === 0 && (
          <p className="text-sm text-muted-foreground">Nothing needs your attention right now.</p>
        )}
        {notices.map((notice) => {
          const body = (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-foreground">{notice.title}</p>
                <Badge variant={notice.priority === "High" ? "destructive" : "secondary"}>
                  {notice.priority}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{notice.detail}</p>
            </>
          );
          return notice.link ? (
            <Link
              key={notice.id}
              to={notice.link}
              className={`block rounded-xl border p-3 transition-colors hover:bg-accent/40 ${tone[notice.tone]}`}
            >
              {body}
            </Link>
          ) : (
            <div key={notice.id} className={`rounded-xl border p-3 ${tone[notice.tone]}`}>
              {body}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
