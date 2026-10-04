import React from "react";
import {
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import "./Contact.css";



export default function Contact({ onRegister }) {
  return (
    <section className="contact" id="contact">
      <div className="wrap contact-grid">
        <div>
          <p className="eyebrow">Get in touch</p>

          <h2>
            Questions?
            <br />
            <em>Let's talk.</em>
          </h2>

          <p>
            For conference-related queries, reach out to
            the Department of Metallurgical & Materials
            Engineering.
          </p>

          <ul>
            <li>
              <Mail />
              metallum@mme.edu.in
            </li>

            <li>
              <Phone />
              +91 98200 20426
            </li>

            <li>
              <MapPin />
              Department of MME, India
            </li>
          </ul>
        </div>

        <div className="contact-info">
          <p className="eyebrow">Symposium Registration</p>

          <h3>Ready to join us?</h3>

          <p>
            Registration for the Symposium is free.
            Secure your place using the registration
            button.
          </p>

          <button
            className="register"
            onClick={onRegister}
          >
            Register for Symposium
          </button>
        </div>
      </div>
    </section>
  );
}