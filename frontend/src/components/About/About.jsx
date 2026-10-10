import React from 'react';
import {
  FlaskConical,
  Handshake,
  Users,
  Sparkles,
  Calendar,
  MapPin,
  Layers,
  Mic,
  Wrench,
  PenTool,
} from 'lucide-react';
import { SectionHead } from '../SectionHead';
import './About.css';

// Pulled straight from the Coalescence 2026 brochure — kept as short,
// scannable facts/cards rather than paragraphs.
const facts = [
  { icon: Calendar, label: '16–18 Oct 2026', sub: 'Three-day symposium' },
  { icon: MapPin, label: 'VNIT Nagpur', sub: 'Dept. of Metallurgical & Materials Engg.' },
  { icon: Layers, label: 'Connect · Learn · Create', sub: 'The three-day arc' },
  { icon: Users, label: 'Students · Academics · Industry', sub: 'Alumni & founders too' },
];

const days = [
  {
    tag: '01',
    name: 'Connect',
    icon: Mic,
    items: [
      'Inaugural Ceremony',
      'Keynote Talks',
      'Guest Speakers',
      'Quiz Competition',
      'Materials Demonstration Show',
    ],
  },
  {
    tag: '02',
    name: 'Learn',
    icon: Wrench,
    items: [
      'Hands-on Workshops',
      'Industry Panel',
      'Online Guest Lectures',
    ],
  },
  {
    tag: '03',
    name: 'Create',
    icon: PenTool,
    items: [
      'Materials Pictionary',
      'Materials Shark Tank',
      'Technical Seminars',
      'Prize Distributions',
    ],
  },
];

const pillars = [
  { icon: Sparkles, title: 'Share expertise', text: 'Visionary speakers pass on what they know.' },
  { icon: Users, title: 'Meet emerging talent', text: 'Industry leaders discover brilliant new talent.' },
  { icon: Handshake, title: 'Support materials innovation', text: 'Students forge their path in modern materials engineering.' },
];

export default function About() {
  return (
    <section className="about-section" id="about">
      <div className="about wrap">
        <div className="about-visual mobile-hide-image">
          <img
            className="about-photo"
            src="/assets/about2.png"
            alt="Students and researchers collaborating in a materials lab"
          />
          {/* <div className="visual-card"><FlaskConical /><p>Curiosity, made tangible.</p></div> */}
          <div className="about-caption">/ 01<br /><b>DISCOVER</b></div>
        </div>
        <div className="about-copy ary">
          <SectionHead eyebrow="About the Symposium" title={<>Where materials <em>meet opportunity.</em></>}>
            Coalescence 2026 brings undergraduate and postgraduate students, academics, industry
            professionals, alumni and founders together around the evolving world of metallurgical and
            materials engineering — forging connections across materials, research and industry.
          </SectionHead>
          <p className="body-copy">
            Talks, seminars, workshops and challenges open up space for knowledge exchange, career
            insight and new connections — built for students, researchers and professionals in
            materials innovation.
          </p>

          <div className="fact-strip reveal">
            {facts.map((f) => (
              <div className="fact" key={f.label}>
                <f.icon size={16} />
                <div>
                  <b>{f.label}</b>
                  <span>{f.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap engage-wrap">
        <p className="engage-eyebrow">Three days. Many ways to engage.</p>
        <h3 className="engage-title">
          Explore the conversations, challenges and experiences shaping
          Coalescence 2026.
        </h3>

        {/* Horizontally scrollable on every width — a deliberate scroll
           affordance for a lot of programme content in a small footprint,
           with snap-to-card so it never stops mid-card. */}
        <div className="day-scroller reveal">
          {days.map((d) => (
            <article className="day-card" key={d.tag}>
              <div className="day-card-top">
                <span className="day-tag">{d.tag}</span>
                <d.icon size={20} />
              </div>
              <h4>{d.name}</h4>
              <ul>
                {d.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>

      <div className="wrap">
        <div className="pillars reveal">
          {pillars.map((p) => (
            <div className="pillar" key={p.title}>
              <p.icon />
              <b>{p.title}</b>
              <span>{p.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
