import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  boxFromPoints,
  boxStyle,
  clampBox,
  moveBox,
  pointerToNorm,
  resizeBox,
  type NormBox,
} from "@/lib/annotation-geometry";

export type EditableBox = { id: string; box: NormBox; colour: string; label: string };

type Handle = { left?: boolean; right?: boolean; top?: boolean; bottom?: boolean };

const HANDLES: { key: string; handle: Handle; className: string; cursor: string }[] = [
  {
    key: "tl",
    handle: { top: true, left: true },
    className: "-left-1.5 -top-1.5",
    cursor: "nwse-resize",
  },
  {
    key: "tr",
    handle: { top: true, right: true },
    className: "-right-1.5 -top-1.5",
    cursor: "nesw-resize",
  },
  {
    key: "bl",
    handle: { bottom: true, left: true },
    className: "-left-1.5 -bottom-1.5",
    cursor: "nesw-resize",
  },
  {
    key: "br",
    handle: { bottom: true, right: true },
    className: "-right-1.5 -bottom-1.5",
    cursor: "nwse-resize",
  },
];

/**
 * Editable marker layer. Every box lives in 0-1 image units and is clamped so
 * no part of it can leave the picture, on mouse or touch. Sits inside an
 * AnnotationSurface, which already clips to the displayed photo.
 */
export function BoxEditor({
  boxes,
  onChange,
  selectedId,
  onSelect,
  surface,
}: {
  boxes: EditableBox[];
  onChange: (next: EditableBox[]) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  surface: HTMLElement | null;
}) {
  const drag = useRef<
    | { kind: "move"; id: string; start: { x: number; y: number }; box: NormBox }
    | { kind: "resize"; id: string; handle: Handle; start: { x: number; y: number }; box: NormBox }
    | { kind: "draw"; start: { x: number; y: number } }
    | null
  >(null);
  const [draft, setDraft] = useState<NormBox | null>(null);
  const boxesRef = useRef(boxes);
  boxesRef.current = boxes;

  const rect = useCallback(() => surface?.getBoundingClientRect() ?? null, [surface]);

  const apply = useCallback(
    (id: string, box: NormBox) => {
      onChange(boxesRef.current.map((item) => (item.id === id ? { ...item, box } : item)));
    },
    [onChange],
  );

  useEffect(() => {
    if (!surface) return;

    function move(event: PointerEvent) {
      const state = drag.current;
      if (!state) return;
      const point = pointerToNorm(event, rect());
      if (!point) return;
      event.preventDefault();
      if (state.kind === "move") {
        apply(state.id, moveBox(state.box, point.x - state.start.x, point.y - state.start.y));
      } else if (state.kind === "resize") {
        apply(
          state.id,
          resizeBox(state.box, state.handle, point.x - state.start.x, point.y - state.start.y),
        );
      } else {
        setDraft(boxFromPoints(state.start, point));
      }
    }

    function up(event: PointerEvent) {
      const state = drag.current;
      drag.current = null;
      if (state?.kind === "draw") {
        const point = pointerToNorm(event, rect());
        const box = point ? boxFromPoints(state.start, point) : null;
        setDraft(null);
        if (box && box.w > 0.03 && box.h > 0.03) {
          const id = `manual-${Date.now()}`;
          onChange([
            ...boxesRef.current,
            { id, box, colour: "#2563eb", label: `${boxesRef.current.length + 1}` },
          ]);
          onSelect(id);
        }
      }
    }

    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [surface, rect, apply, onChange, onSelect]);

  const startDraw = useCallback(
    (event: React.PointerEvent) => {
      if (event.target !== event.currentTarget) return;
      const point = pointerToNorm(event.nativeEvent, rect(), { clampInside: false });
      if (!point) return; // clicks outside the picture are ignored
      onSelect(null);
      drag.current = { kind: "draw", start: point };
    },
    [rect, onSelect],
  );

  const nudge = useCallback(
    (id: string, dx: number, dy: number) => {
      const found = boxesRef.current.find((item) => item.id === id);
      if (found) apply(id, moveBox(found.box, dx, dy));
    },
    [apply],
  );

  const list = useMemo(() => boxes.map((item) => ({ ...item, box: clampBox(item.box) })), [boxes]);

  return (
    <div
      className="pointer-events-auto absolute inset-0 touch-none"
      onPointerDown={startDraw}
      role="application"
      aria-label="Edit the leaf marks. Drag to move, use the corners to resize, press Delete to remove."
    >
      {list.map((item) => {
        const selected = item.id === selectedId;
        return (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            aria-label={`Mark ${item.label}`}
            aria-pressed={selected}
            onPointerDown={(event) => {
              event.stopPropagation();
              const point = pointerToNorm(event.nativeEvent, rect());
              if (!point) return;
              onSelect(item.id);
              drag.current = { kind: "move", id: item.id, start: point, box: item.box };
            }}
            onKeyDown={(event) => {
              const step = event.shiftKey ? 0.05 : 0.01;
              if (event.key === "ArrowLeft") nudge(item.id, -step, 0);
              else if (event.key === "ArrowRight") nudge(item.id, step, 0);
              else if (event.key === "ArrowUp") nudge(item.id, 0, -step);
              else if (event.key === "ArrowDown") nudge(item.id, 0, step);
              else if (event.key === "Delete" || event.key === "Backspace")
                onChange(boxesRef.current.filter((entry) => entry.id !== item.id));
              else if (event.key === "Enter" || event.key === " ") onSelect(item.id);
              else return;
              event.preventDefault();
            }}
            className={`absolute cursor-move rounded-md border-2 touch-none ${selected ? "ring-2 ring-primary ring-offset-1" : ""}`}
            style={{ ...boxStyle(item.box), borderColor: item.colour }}
          >
            <span
              className="pointer-events-none absolute left-0 top-0 rounded-br-md rounded-tl-sm px-1.5 text-xs font-bold text-white"
              style={{ backgroundColor: item.colour }}
            >
              {item.label}
            </span>
            {selected &&
              HANDLES.map((handle) => (
                <span
                  key={handle.key}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    const point = pointerToNorm(event.nativeEvent, rect());
                    if (!point) return;
                    drag.current = {
                      kind: "resize",
                      id: item.id,
                      handle: handle.handle,
                      start: point,
                      box: item.box,
                    };
                  }}
                  className={`absolute size-3 rounded-full border-2 border-background bg-primary ${handle.className}`}
                  style={{ cursor: handle.cursor }}
                  aria-hidden="true"
                />
              ))}
          </div>
        );
      })}
      {draft && (
        <div
          className="pointer-events-none absolute rounded-md border-2 border-dashed border-primary bg-primary/10"
          style={boxStyle(draft)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
