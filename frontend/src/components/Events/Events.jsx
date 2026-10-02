import React, { useState } from 'react';
import { SectionHead } from '../SectionHead';
import EventCard from './EventCard';
import { events } from '../../data/events';
import './Events.css';

const cats = ['All', 'Panel', 'Workshop', 'Seminar', 'Competition'];

export default function Events({ jump }) {
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? events : events.filter(e => e.type === filter);

  return (
    <section className="events section-tint" id="events">
      <div className="wrap">
        <SectionHead eyebrow="The programme" title={<>Find your <em>spark.</em></>}>
          A considered mix of conversation, experimentation and friendly competition.
        </SectionHead>
        <div className="filters" role="tablist">
          {cats.map(c => (
            <button key={c} className={filter === c ? 'selected' : ''} onClick={() => setFilter(c)}>{c}</button>
          ))}
        </div>
        <div className="event-grid">
          {filtered.map(e => <EventCard event={e} jump={jump} key={e.title} />)}
        </div>
      </div>
    </section>
  );
}
