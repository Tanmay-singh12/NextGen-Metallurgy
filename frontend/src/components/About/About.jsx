import React from 'react';
import { FlaskConical, Sparkles, Leaf, UsersRound } from 'lucide-react';
import { SectionHead } from '../SectionHead';
import './About.css';

export default function About() {
  return (
    <section className="about wrap" id="about">
      <div className="about-visual">
        <div className="visual-card"><FlaskConical /><p>Curiosity, made tangible.</p></div>
        <div className="metal-disc"></div>
        <div className="about-caption">/ 01<br /><b>DISCOVER</b></div>
      </div>
      <div className="about-copy">
        <SectionHead eyebrow="About the conference" title={<>Where deep research meets <em>real possibility.</em></>}>
          Metallum is our annual meeting point for material thinkers. It brings the lab, the classroom and the shop floor into one purposeful conversation.
        </SectionHead>
        <p className="body-copy">We are building a programme that is thoughtful, practical and unafraid of hard questions. Come to learn from people doing the work—and leave with collaborators for what comes next.</p>
        <div className="mission">
          <div><Sparkles /><b>Innovation</b><span>Ideas ready to be tested.</span></div>
          <div><Leaf /><b>Sustainability</b><span>Progress with perspective.</span></div>
          <div><UsersRound /><b>Collaboration</b><span>Better, together.</span></div>
        </div>
      </div>
    </section>
  );
}
