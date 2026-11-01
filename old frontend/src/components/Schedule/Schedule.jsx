import React, { useState } from 'react';
import { SectionHead } from '../SectionHead';
import { schedule } from '../../data/schedule';
import './Schedule.css';

const dayLabels = ['16 Oct · Day one', '17 Oct · Day two', '18 Oct · Day three'];

export default function Schedule() {
  const [day, setDay] = useState(0);

  return (
    <section className="schedule wrap" id="schedule">
      <SectionHead eyebrow="Three days, one shared future" title={<>Make time for the <em>good stuff.</em></>}>
        Move at your own pace. Save the sessions that make you curious.
      </SectionHead>
      <div className="day-tabs">
        {dayLabels.map((d, i) => (
          <button key={d} onClick={() => setDay(i)} className={day === i ? 'active' : ''}>{d}</button>
        ))}
      </div>
      <div className="timeline">
        {schedule[day].map(x => (
          <div className="slot" key={x.time}>
            <time>{x.time}</time>
            <i></i>
            <div>
              <span>{x.kind}</span>
              <h3>{x.title}</h3>
              <p>{x.meta}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
