import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

/**
 * Wraps a photo and gives its markers a canvas that matches the *displayed*
 * picture exactly — not the padded box around it. Photos are shown with
 * `object-contain`, so a tall photo in a wide frame leaves empty bars on the
 * sides. Positioning markers against the frame would push them onto those bars
 * (i.e. outside the picture). We measure the real picture area and place the
 * overlay on top of it, clipped, so a marker can never escape the image.
 */
export function AnnotationSurface({
  src,
  alt,
  className = "",
  imgClassName = "",
  children,
  overlayRef,
  onOverlayPointerDown,
  loading,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  children?: ReactNode;
  overlayRef?: (node: HTMLDivElement | null) => void;
  onOverlayPointerDown?: (event: React.PointerEvent<HTMLDivElement>) => void;
  loading?: "lazy" | "eager";
}) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [area, setArea] = useState({ left: 0, top: 0, width: 0, height: 0 });

  const measure = useCallback(() => {
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!frame || !img) return;
    const frameRect = frame.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();
    const boxW = imgRect.width;
    const boxH = imgRect.height;
    const natW = img.naturalWidth || boxW;
    const natH = img.naturalHeight || boxH;
    if (boxW <= 0 || boxH <= 0 || natW <= 0 || natH <= 0) return;
    // object-contain: the picture is scaled to fit inside the element box.
    const scale = Math.min(boxW / natW, boxH / natH);
    const drawnW = natW * scale;
    const drawnH = natH * scale;
    setArea({
      left: imgRect.left - frameRect.left + (boxW - drawnW) / 2,
      top: imgRect.top - frameRect.top + (boxH - drawnH) / 2,
      width: drawnW,
      height: drawnH,
    });
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure, src]);

  useEffect(() => {
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!frame || !img) return;
    // Re-measure on window resize, zoom, layout changes and image swaps.
    const observer = new ResizeObserver(() => measure());
    observer.observe(frame);
    observer.observe(img);
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    const visual = window.visualViewport;
    visual?.addEventListener("resize", measure);
    visual?.addEventListener("scroll", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
      visual?.removeEventListener("resize", measure);
      visual?.removeEventListener("scroll", measure);
    };
  }, [measure]);

  return (
    <div ref={frameRef} className={`relative overflow-hidden ${className}`}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={loading}
        onLoad={measure}
        className={`block object-contain ${imgClassName}`}
      />
      <div
        ref={overlayRef}
        onPointerDown={onOverlayPointerDown}
        className="pointer-events-none absolute overflow-hidden"
        style={{
          left: `${area.left}px`,
          top: `${area.top}px`,
          width: `${area.width}px`,
          height: `${area.height}px`,
          // Markers are clipped to the picture, never the padded frame.
          contain: "paint",
        }}
      >
        {area.width > 0 ? children : null}
      </div>
    </div>
  );
}
