import React from 'react';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import './Hero.css';

export default function Hero({ jump }) {
  return (
    <>
      <section className="hero">
        <div className="grain"></div>
        <div className="hero-copy">
          <p className="eyebrow">National materials conference · 12—14 Oct</p>
          <h1>The materials<br /><i>that move</i> us.</h1>
          <p className="hero-text">A three-day conversation between students, researchers and industry—exploring the systems, metals and ideas that shape a more resilient world.</p>
          <div className="hero-actions">
            <button className="register" onClick={() => jump('contact')}>Reserve your place <ArrowUpRight size={17} /></button>
            <button className="text-button" onClick={() => jump('about')}>Explore Metallum <ArrowRight size={17} /></button>
          </div>
        </div>
        <figure className="hero-art hero-sculpture">
          <div className="sculpture-glow"></div>
          <img src="/assets/metallum-sculpture.png" alt="Floating teal glass crystal lattice, silver ribbon and copper sphere" />
          <figcaption>Metallum / a study in motion</figcaption>
        </figure>
        <div className="scroll-note">SCROLL TO DISCOVER <span></span></div>
      </section>
      <section className="intro">
        <p>Hosted by the Department of Metallurgical & Materials Engineering</p>
        <div className="stats">
          <div><b>600<span>+</span></b><small>curious minds</small></div>
          <div><b>18</b><small>voices on stage</small></div>
          <div><b>12</b><small>hands-on sessions</small></div>
          <div><b>08</b><small>institutions together</small></div>
        </div>
      </section>
    </>
  );
}
