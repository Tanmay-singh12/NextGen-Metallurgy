import React from 'react';
import { sponsors } from '../../data/sponsors';
import './Partners.css';

export default function Partners() {
  return (
    <section className="partners wrap">
      <p className="eyebrow">Made possible with</p>
      <div>
        {sponsors.map((s, i) => (
          <b key={i}>
            {s.main}
            {s.suffix && <span>{s.suffix}</span>}
            {s.italic && <i>{s.italic}</i>}
          </b>
        ))}
      </div>
    </section>
  );
}
