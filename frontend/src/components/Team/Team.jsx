import React, { useRef, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHead } from "../SectionHead";
import { team } from "../../data/team";
import "./Team.css";

const N = team.length;

// Shortest signed distance from `active` to index `i` around a circle of
// size N (e.g. for N=9, i two steps ahead of active is +2, two steps
// behind is -2, never +7).
function circularDelta(i, active) {
  let d = i - active;
  if (d > N / 2) d -= N;
  if (d < -N / 2) d += N;
  return d;
}

function cardStyle(delta) {
  const abs = Math.abs(delta);

  if (abs > 2) {
    const far = (delta > 0 ? 1 : -1) * 640;
    return {
      transform: `translateX(${far}px) scale(.5)`,
      opacity: 0,
      zIndex: 0,
      pointerEvents: "none",
    };
  }

  const translate = delta * 58; // % of card width, via CSS var below
  const scale = abs === 0 ? 1.12 : abs === 1 ? 0.86 : 0.68;
  const rotateY = abs === 0 ? 0 : delta > 0 ? -22 : 22;
  const opacity = abs === 0 ? 1 : abs === 1 ? 0.85 : 0.4;

  return {
    transform: `translateX(${translate}%) scale(${scale}) rotateY(${rotateY}deg)`,
    opacity,
    zIndex: 10 - abs,
    pointerEvents: abs > 1 ? "none" : "auto",
  };
}

export default function Team() {
  const [active, setActive] = useState(0);
  const touch = useRef({ x: 0, active: false });

  const go = (i) => setActive(((i % N) + N) % N);
  const next = () => go(active + 1);
  const prev = () => go(active - 1);

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
    <section className="team section-tint" id="team">
      <div className="wrap">
        <div className="team-head">
          <SectionHead
            eyebrow="Our people"
            title={<>Made by a small, <em>mighty team.</em></>}
          >
            Students from the Department of Metallurgical & Materials
            Engineering, with a healthy obsession for good questions.
          </SectionHead>

          <div className="team-nav" role="group" aria-label="Team carousel">
            <button aria-label="Previous team member" onClick={prev}>
              <ChevronLeft size={18} />
            </button>
            <button aria-label="Next team member" onClick={next}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div
          className="team-carousel"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {team.map((member, i) => {
            const delta = circularDelta(i, active);
            const isActive = delta === 0;

            return (
              <article
                className={"team-card" + (isActive ? " is-active" : "")}
                key={member.name}
                style={cardStyle(delta)}
                aria-hidden={Math.abs(delta) > 1}
                onClick={() => !isActive && go(i)}
              >
                <div className="team-photo">
                  <img src={member.image} alt={member.name} loading="lazy" />
                </div>
                <div className="team-meta">
                  <h3>{member.name}</h3>
                  <p>{member.role}</p>
                  <a
                    href="#contact"
                    aria-label={"Contact " + member.name}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ArrowUpRight size={15} />
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        <div className="team-dots">
          {team.map((m, i) => (
            <i
              key={m.name}
              className={i === active ? "on" : ""}
              onClick={() => go(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
