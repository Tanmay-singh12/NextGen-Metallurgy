import React from 'react';
import { Atom } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer>
      <div className="footer-brand">
        <span className="brand-mark">
          <span className="mark-orbit orbit-a"></span>
          <span className="mark-orbit orbit-b"></span>
          <Atom size={20} />
        </span>
        METALLUM <small>MME · 2026</small>
      </div>
      <p>Built around ideas worth sharing.</p>
      <div>
        <a href="#top">Instagram</a>
        <a href="#top">LinkedIn</a>
        <a href="#top">© 2026 Metallum</a>
      </div>
    </footer>
  );
}
