import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import './Feature.css';

export default function Feature({ jump }) {
  return (
    <section className="feature wrap mobile-hide-image">
      <div className="feature-art">
        <div className="feature-ring"></div>
        <div className="feature-ball"></div>
        <p>Featured<br />experience</p>
      </div>
      <div className="feature-copy">
        <p className="eyebrow">A signature experience</p>
        <h2>The Alloy<br /><em>Challenge.</em></h2>
        <p>Not just a competition. A live material brief, expert feedback and a room full of people who care about the answer.</p>
        <div className="feature-info">
          <span>13 OCT · 03:30 PM</span>
          <span>INNOVATION STUDIO</span>
        </div>
        <button className="dark-button" onClick={() => jump('contact')}>Get the brief <ArrowUpRight size={17} /></button>
      </div>
    </section>
  );
}
