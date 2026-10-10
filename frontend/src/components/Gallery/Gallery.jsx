import React, { useRef, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHead } from "../SectionHead";
import { gallery } from "../../data/gallery";
import "./Gallery.css";

const PAGE_SIZE = 3;
const PAGE_COUNT = Math.ceil(gallery.length / PAGE_SIZE);

export default function Gallery({ onSelect }) {
  const [page, setPage] = useState(0);
  const touch = useRef({ x: 0, active: false });

  const goTo = (p) => setPage(((p % PAGE_COUNT) + PAGE_COUNT) % PAGE_COUNT);
  const next = () => goTo(page + 1);
  const prev = () => goTo(page - 1);

  const onTouchStart = (e) => {
    touch.current = { x: e.touches[0].clientX, active: true };
  };
  const onTouchEnd = (e) => {
    if (!touch.current.active) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    if (dx < -40) next();
    else if (dx > 40) prev();
    touch.current.active = false;
  };

  return (
    <section className="gallery wrap" id="gallery">
      <div className="gallery-head">
        <SectionHead
          eyebrow="A living archive"
          title={<>See what <em>happens next.</em></>}
        >
          The moments between the moments, gathered from our community.
        </SectionHead>

        <div className="gallery-nav" role="group" aria-label="Gallery pages">
          <button aria-label="Previous photos" onClick={prev}>
            <ChevronLeft size={18} />
          </button>
          <span className="gallery-dots">
            {Array.from({ length: PAGE_COUNT }).map((_, i) => (
              <i key={i} className={i === page ? "on" : ""} />
            ))}
          </span>
          <button aria-label="Next photos" onClick={next}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        className="gallery-viewport"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="gallery-track"
          style={{ transform: `translateX(-${page * 100}%)` }}
        >
          {Array.from({ length: PAGE_COUNT }).map((_, p) => (
            <div className="gallery-page" key={p}>
              {gallery.slice(p * PAGE_SIZE, p * PAGE_SIZE + PAGE_SIZE).map((item, i) => {
                const globalIndex = p * PAGE_SIZE + i;
                return (
                  <button
                    className="gallery-tile"
                    key={item.id}
                    onClick={() => onSelect(globalIndex)}
                  >
                    <img src={item.img} alt={item.caption} loading="lazy" />
                    <span className="gallery-tile-overlay">
                      <span>{item.caption}</span>
                      <ArrowUpRight size={18} />
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
