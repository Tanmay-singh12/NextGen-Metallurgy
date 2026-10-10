import React from "react";
import { SectionHead } from "../SectionHead";
import { faculty } from "../../data/faculty";
import "./Faculty.css";

export default function Faculty() {
  return (
    <section className="faculty wrap" id="faculty">
      <SectionHead
        eyebrow="Our Department"
        title={
          <>
            The faculty <em>behind the programme.</em>
          </>
        }
      >
        Mentors from the Department of Metallurgical & Materials Engineering
        who shape, guide and show up for this symposium every year.
      </SectionHead>

      <div className="faculty-grid">
        {faculty.map((f) => (
          <article className="faculty-card" key={f.name}>
            <div className="faculty-photo">
              <img src={f.image} alt={f.name} loading="lazy" />
            </div>
            <div className="faculty-meta">
              <h3>{f.name}</h3>
              <p>{f.role}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
