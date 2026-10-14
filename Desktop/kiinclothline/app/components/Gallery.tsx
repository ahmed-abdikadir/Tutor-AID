"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Suit } from "@/app/lib/site";

export default function Gallery({ suits }: { suits: Suit[] }) {
  const categories = ["All", ...new Set(suits.map((s) => s.category))];
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState<Suit | null>(null);
  const [loaded, setLoaded] = useState<string[]>([]);
  const [failed, setFailed] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(4);
  const touchStart = useRef<number | null>(null);
  const filtered = suits.filter((s) => filter === "All" || s.category === filter);
  const shown = filtered.slice(0, visibleCount);
  const activeIndex = active ? filtered.findIndex((s) => s === active) : -1;
  const move = useCallback((delta: number) => {
    if (activeIndex >= 0 && filtered.length > 1) setActive(filtered[(activeIndex + delta + filtered.length) % filtered.length]);
  }, [activeIndex, filtered]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowLeft") move(-1);
      if (e.key === "ArrowRight") move(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, move]);

  return (
    <>
      <div className="filters-wrap"><div className="filters" role="group" aria-label="Filter suits">
        {categories.map((c) => (
          <button key={c} type="button" className={c === filter ? "active" : ""} aria-pressed={c === filter} onClick={() => { setFilter(c); setVisibleCount(4); }}>
            {c}
          </button>
        ))}
      </div></div>
      <div className="gallery">
        {shown.map((s) => (
          <button key={s.image} type="button" className="suit" onClick={() => setActive(s)}>
            <div className={`suit__img${loaded.includes(s.image) ? " is-loaded" : ""}${failed.includes(s.image) ? " is-failed" : ""}`}>
              {failed.includes(s.image) ? <span>Image unavailable</span> : <Image src={s.image} alt={`${s.title}. ${s.description}`} fill sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 25vw" onLoad={() => setLoaded((value) => value.includes(s.image) ? value : [...value, s.image])} onError={() => setFailed((value) => value.includes(s.image) ? value : [...value, s.image])} />}
            </div>
            <div className="suit__info">
              <span className="suit__tag">{s.category}</span>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
            </div>
          </button>
        ))}
      </div>
      {filtered.length === 0 && <p className="gallery__empty">No suits in this category yet. Please check another filter.</p>}
      {visibleCount < filtered.length && <div className="gallery__more"><button className="btn btn--ghost" type="button" onClick={() => setVisibleCount((count) => count + 4)}>Load more</button></div>}
      <div className="collection__cta"><a href="#booking" className="btn">Book a Fitting</a></div>
      {active && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={active.title} onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }} onTouchEnd={(e) => { if (touchStart.current !== null && Math.abs(e.changedTouches[0].clientX - touchStart.current) > 48) move(e.changedTouches[0].clientX < touchStart.current ? 1 : -1); touchStart.current = null; }} onClick={() => setActive(null)}>
          <button className="lightbox__close" aria-label="Close">&times;</button>
          <button className="lightbox__nav lightbox__nav--prev" aria-label="Previous look" onClick={(e) => { e.stopPropagation(); move(-1); }}>‹</button>
          <div className="lightbox__img" onClick={(e) => e.stopPropagation()}>
            <Image src={active.image} alt={active.title} fill sizes="90vw" priority />
          </div>
          <p className="lightbox__caption">
            <strong>{active.title}</strong>: {active.description}
          </p>
          <div className="lightbox__actions">
            <a
              className="btn"
              href="#booking"
              onClick={(event) => {
                event.stopPropagation();
                window.dispatchEvent(new CustomEvent("kiin:suit-selected", {
                  detail: { title: active.title, category: active.category },
                }));
                setActive(null);
              }}
            >
              Ask about this style
            </a>
          </div>
          <button className="lightbox__nav lightbox__nav--next" aria-label="Next look" onClick={(e) => { e.stopPropagation(); move(1); }}>›</button>
        </div>
      )}
    </>
  );
}
