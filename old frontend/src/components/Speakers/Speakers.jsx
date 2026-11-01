import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SectionHead } from '../SectionHead';
import { speakers } from '../../data/speakers';
import './Speakers.css';

export default function Speakers() {
  return (
    <section className="speakers dark-section">
      <div className="wrap">
        <SectionHead eyebrow="Meet the voices" title={<>People with a point of <em>view.</em></>}>
          A diverse group of researchers, makers and leaders shaping material futures.
        </SectionHead>
        <div className="speaker-grid">
          {speakers.map(s => (
            <article className="speaker" key={s.name}>
              <div className={'avatar ' + s.tone}>{s.initials}<span></span></div>
              <div><h3>{s.name}</h3><p>{s.role}<br />{s.org}</p></div>
              <button aria-label={'View ' + s.name}><ArrowUpRight size={16} /></button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
