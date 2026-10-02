import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SectionHead } from '../SectionHead';
import { gallery } from '../../data/gallery';
import './Gallery.css';

export default function Gallery({ onSelect }) {
  return (
    <section className="gallery wrap" id="gallery">
      <SectionHead eyebrow="A living archive" title={<>See what <em>happens next.</em></>}>
        The moments between the moments, gathered from our community.
      </SectionHead>
      <div className="masonry">
        {gallery.map(([c, t], i) => (
          <button className={'gallery-tile ' + c} onClick={() => onSelect(i)} key={c}>
            <span>{t}</span>
            <ArrowUpRight size={19} />
          </button>
        ))}
      </div>
    </section>
  );
}
