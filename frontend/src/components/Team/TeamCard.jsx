import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function TeamCard({ member, index }) {
  return (
    <article className="team-card">
      <div className={'team-avatar t' + index}>{member.initials}</div>
      <h3>{member.name}</h3>
      <p>{member.role}</p>
      <a href="#contact" aria-label={'Contact ' + member.name}><ArrowUpRight size={17} /></a>
    </article>
  );
}
