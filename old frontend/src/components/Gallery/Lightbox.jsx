import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Lightbox({ item, onClose, onPrev, onNext }) {
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Gallery image">
      <button className="close" onClick={onClose} aria-label="Close gallery"><X /></button>
      <button className="prev" onClick={onPrev} aria-label="Previous"><ChevronLeft /></button>
      <div className={'lightbox-art ' + item[0]}><p>{item[1]}</p></div>
      <button className="next" onClick={onNext} aria-label="Next"><ChevronRight /></button>
    </div>
  );
}
