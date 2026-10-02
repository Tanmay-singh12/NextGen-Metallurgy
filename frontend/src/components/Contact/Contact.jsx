import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Quote } from 'lucide-react';
import './Contact.css';

export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <section className="contact" id="contact">
      <div className="wrap contact-grid">
        <div>
          <p className="eyebrow">Save your seat</p>
          <h2>Bring your<br /><em>curiosity.</em></h2>
          <p>Registration opens soon. Share your details and the team will send the full programme when it is ready.</p>
          <ul>
            <li><Mail /> metallum@mme.edu.in</li>
            <li><Phone /> +91 98200 20426</li>
            <li><MapPin /> Department of MME, India</li>
          </ul>
        </div>
        <form onSubmit={e => { e.preventDefault(); setSent(true); }}>
          {sent ? (
            <div className="success">
              <Quote />
              <h3>You’re on the list.</h3>
              <p>We’ll be in touch with the programme soon.</p>
            </div>
          ) : (
            <>
              <label>Your name<input required placeholder="What should we call you?" /></label>
              <label>Email address<input type="email" required placeholder="you@example.com" /></label>
              <label>Phone number<input type="tel" placeholder="Optional" /></label>
              <label>Anything you’d like to ask?<textarea placeholder="Tell us what you're looking for"></textarea></label>
              <button className="register">Send enquiry <Send size={16} /></button>
            </>
          )}
        </form>
      </div>
    </section>
  );
}
