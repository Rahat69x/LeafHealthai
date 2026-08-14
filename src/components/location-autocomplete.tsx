import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Droplet, Leaf, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  highlightParts,
  mergeSuggestions,
  searchLocal,
  searchRemote,
  toPlace,
  type Suggestion,
} from "@/lib/place-search";
import { POPULAR_PLACES, loadRecentPlaces, rememberPlace } from "@/lib/recent-places";
import type { LocalPlace } from "@/lib/bd-places";
import { currentPosition, placeFromCoords, type Place } from "@/lib/weather";

export function LocationAutocomplete({
  onSelect,
  placeholder = "Search city, district or upazila…",
  label = "Search your location",
  disabled = false,
  className,
}: {
  onSelect: (place: Place, local?: LocalPlace) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}) {
  const inputId = useId();
  const listId = `${inputId}-list`;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recent, setRecent] = useState<Suggestion[]>([]);
  const [locating, setLocating] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setRecent(loadRecentPlaces()), []);

  const local = useMemo(() => (query.trim() ? searchLocal(query) : []), [query]);
  const typing = query.trim().length > 0;

  /** With an empty box we still offer something useful: recent, then popular. */
  const idleItems = useMemo(() => {
    const seen = new Set(recent.map((item) => item.name));
    return [...recent, ...POPULAR_PLACES.filter((item) => !seen.has(item.name))].slice(0, 8);
  }, [recent]);

  const visible = typing ? items : idleItems;

  // Instant local answers, then the wider service once typing pauses.
  useEffect(() => {
    const text = query.trim();
    if (!text) {
      setItems([]);
      setSearched(false);
      setLoading(false);
      return;
    }
    setItems(local);
    setActive(local.length > 0 ? 0 : -1);
    if (text.length < 2) {
      setSearched(true);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const remote = await searchRemote(text, controller.signal);
        const merged = mergeSuggestions(local, remote);
        setItems(merged);
        setActive(merged.length > 0 ? 0 : -1);
      } catch {
        /* keep whatever the local list found */
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setSearched(true);
        }
      }
    }, 180);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, local]);

  // Close when the click lands outside the box.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const choose = useCallback(
    (item: Suggestion) => {
      setQuery(item.name);
      setOpen(false);
      setActive(-1);
      setRecent(rememberPlace({ ...item, id: `recent:${item.name}:${item.country}` }));
      inputRef.current?.blur();
      onSelect(toPlace(item), item.local);
    },
    [onSelect],
  );

  const useGps = useCallback(async () => {
    setLocating(true);
    try {
      const position = await currentPosition();
      const place = await placeFromCoords(position.coords.latitude, position.coords.longitude);
      setQuery(place.name);
      setOpen(false);
      onSelect(place);
    } catch {
      /* the user can still type a location */
    } finally {
      setLocating(false);
    }
  }, [onSelect]);

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!visible.length) return;
      event.preventDefault();
      setOpen(true);
      setActive((current) => {
        const next = event.key === "ArrowDown" ? current + 1 : current - 1;
        if (next < 0) return visible.length - 1;
        if (next >= visible.length) return 0;
        return next;
      });
      return;
    }
    if (event.key === "Enter") {
      const item = visible[active] ?? visible[0];
      if (open && item) {
        event.preventDefault();
        choose(item);
      }
    }
  }

  const showList = open && (typing || idleItems.length > 0);
  const empty = showList && typing && !loading && searched && items.length === 0;

  return (
    <div ref={boxRef} className={cn("relative", className)}>
      <label htmlFor={inputId} className="mb-1 block text-xs font-semibold text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <Leaf
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          id={inputId}
          ref={inputRef}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
          aria-describedby={`${inputId}-hint`}
          disabled={disabled}
          value={query}
          placeholder={placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="min-h-11 w-full rounded-xl border bg-background py-2 pl-9 pr-20 text-sm text-foreground shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        />
        <span className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {loading && (
            <Leaf className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />
          )}
          <button
            type="button"
            onClick={useGps}
            disabled={disabled || locating}
            aria-label="Use my current location"
            title="Use my current location"
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          >
            {locating ? (
              <Leaf className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Droplet className="size-4" aria-hidden="true" />
            )}
          </button>
        </span>
      </div>
      <p id={`${inputId}-hint`} className="sr-only">
        Type at least one letter, then use the up and down arrow keys to move through suggestions
        and Enter to pick one. The button on the right uses your device location.
      </p>
      <span aria-live="polite" className="sr-only">
        {showList
          ? loading
            ? "Searching locations"
            : `${visible.length} suggestions available`
          : ""}
      </span>

      {showList && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-xl border bg-popover p-1 shadow-lg">
          {!typing && (
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {recent.length > 0 ? "Recent and popular" : "Popular farming districts"}
            </p>
          )}
          <ul id={listId} role="listbox" aria-label="Location suggestions">
            {visible.map((item, index) => {
              const parts = highlightParts(item.name, query);
              const isRecent = !typing && item.id.startsWith("recent:");
              const Icon = !typing ? (isRecent ? Droplet : ShieldCheck) : Droplet;
              return (
                <li
                  key={item.id}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    choose(item);
                  }}
                  onMouseEnter={() => setActive(index)}
                  className={cn(
                    "flex cursor-pointer items-start gap-2 rounded-lg px-3 py-2 text-sm",
                    index === active ? "bg-accent text-accent-foreground" : "text-foreground",
                  )}
                >
                  <Icon
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {parts.map((part, i) =>
                        part.hit ? (
                          <mark key={i} className="bg-transparent font-bold text-primary">
                            {part.text}
                          </mark>
                        ) : (
                          <span key={i}>{part.text}</span>
                        ),
                      )}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.detail}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
          {empty && (
            <p className="px-3 py-3 text-sm text-muted-foreground">
              No results found. Try a district name such as “Bogura”.
            </p>
          )}
          {loading && items.length === 0 && typing && (
            <p className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
              <Leaf className="size-4 animate-spin" aria-hidden="true" /> Searching…
            </p>
          )}
        </div>
      )}
    </div>
  );
}
