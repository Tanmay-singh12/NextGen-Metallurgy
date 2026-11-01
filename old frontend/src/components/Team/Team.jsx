import React from 'react';
import { SectionHead } from '../SectionHead';
import TeamCard from './TeamCard';
import { team } from '../../data/team';
import './Team.css';

export default function Team() {
  return (
    <section className="team section-tint" id="team">
      <div className="wrap">
        <SectionHead eyebrow="Our people" title={<>Made by a small, <em>mighty team.</em></>}>
          Students from the Department of Metallurgical & Materials Engineering, with a healthy obsession for good questions.
        </SectionHead>
        <div className="team-grid">
          {team.map((t, i) => <TeamCard member={t} index={i} key={t.name} />)}
        </div>
      </div>
    </section>
  );
}
