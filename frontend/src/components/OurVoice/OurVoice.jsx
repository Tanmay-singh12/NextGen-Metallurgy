import React from "react";
import { Quote } from "lucide-react";
import { SectionHead } from "../SectionHead";
import { voices } from "../../data/voices";
import "./OurVoice.css";

export default function OurVoice() {
  return (
    <section className="our-voice section-tint wrap" id="our-voice">
      <SectionHead
        eyebrow="Our Voice"
        title={
          <>
            Said by the people <em>behind it.</em>
          </>
        }
      >
        A few honest lines from the faculty and students who put this
        symposium together.
      </SectionHead>

      <div className="voice-grid">
        {voices.map((v) => (
          <figure className="voice-card" key={v.name}>
            <Quote className="voice-mark" size={22} />
            <blockquote>{v.quote}</blockquote>
            <figcaption>
              <b>{v.name}</b>
              <span>{v.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
