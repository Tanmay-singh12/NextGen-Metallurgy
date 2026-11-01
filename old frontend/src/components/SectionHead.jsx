import React from 'react';

// Wraps its children in the scroll-reveal animation class used across the page.
export function Reveal({ children, className = '' }) {
  return <div className={'reveal ' + className}>{children}</div>;
}

// Shared eyebrow + title + optional lead paragraph used at the top of most sections.
export function SectionHead({ eyebrow, title, children }) {
  return (
    <Reveal className="section-head">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {children && <p className="lead">{children}</p>}
    </Reveal>
  );
}
