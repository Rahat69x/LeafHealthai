import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLang } from "@/lib/i18n";

const TITLE = "Contact us | LeafCheck";
const DESCRIPTION =
  "Send a note to the LeafCheck team about a wrong result, a missing plant, or an idea.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Please write your name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      toast.error("Please write a correct email address.");
      return;
    }
    if (message.trim().length < 10) {
      toast.error("Please write a little more in your message.");
      return;
    }
    toast.success("Thank you. Your message is saved on this device and we will read it.");
    setName("");
    setEmail("");
    setMessage("");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        {t("navContact")}
      </h1>
      <p className="mt-3 text-base text-muted-foreground">
        Found a wrong result or a missing plant? Tell us and we will improve it.
      </p>

      <form
        onSubmit={submit}
        className="mt-8 space-y-4 rounded-3xl border bg-card p-5 shadow-sm sm:p-7"
        noValidate
      >
        <div className="space-y-2">
          <Label htmlFor="contact-name">Your name</Label>
          <Input
            id="contact-name"
            value={name}
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
            className="min-h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            type="email"
            value={email}
            maxLength={255}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-message">Message</Label>
          <Textarea
            id="contact-message"
            value={message}
            maxLength={1000}
            rows={5}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <Button type="submit" className="min-h-11 w-full sm:w-auto">
          <Leaf aria-hidden="true" /> Send message
        </Button>
      </form>

      <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Leaf className="size-4" aria-hidden="true" /> You can also reach us at hello@leafcheck.app
      </p>
    </div>
  );
}
