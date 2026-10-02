import React from 'react';
import { ArrowUpRight, ArrowRight, CalendarDays, MapPin, Clock3 } from 'lucide-react';

export default function EventCard({ event, jump }) {
  return (
    <article className={'event-card ' + event.color}>
      <div className="card-top"><span>{event.type}</span><ArrowUpRight size={20} /></div>
      <div className="event-icon"><span></span></div>
      <h3>{event.title}</h3>
      <p>{event.text}</p>
      <div className="event-meta">
        <span><CalendarDays /> {event.date}</span>
        <span><Clock3 /> {event.time}</span>
        <span><MapPin /> {event.place}</span>
      </div>
      <button onClick={() => jump('contact')}>Join session <ArrowRight size={15} /></button>
    </article>
  );
}
