
import React, { useEffect, useState } from "react";

import Navbar from "../components/Navbar/Navbar";
import Hero from "../components/Hero/Hero";
import About from "../components/About/About";
import Events from "../components/Events/Events";
import Feature from "../components/Feature/Feature";
import Schedule from "../components/Schedule/Schedule";
import Speakers from "../components/Speakers/Speakers";
import Gallery from "../components/Gallery/Gallery";
import Lightbox from "../components/Gallery/Lightbox";
import Team from "../components/Team/Team";
import Partners from "../components/Partners/Partners";
import Contact from "../components/Contact/Contact";
import Footer from "../components/Footer/Footer";

import RegistrationModal from "../components/RegistrationModal/RegistrationModal";
import AbstractSubmissionModal from "../components/abstract/AbstractSubmissionModal";

import { gallery } from "../data/gallery";

export default function Home() {
  const [menu, setMenu] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [abstractOpen, setAbstractOpen] = useState(false);
  const [abstractRegistrationId, setAbstractRegistrationId] =
    useState(null);

  const openAbstractSubmission = (registrationId) => {
    setRegistrationOpen(false);
    setAbstractRegistrationId(registrationId);
    setAbstractOpen(true);
  };


  const closeAbstractSubmission = () => {
    setAbstractOpen(false);
    setAbstractRegistrationId("");
  };

  // Fade sections in as they scroll into view.
  useEffect(() => {
    const obs = new IntersectionObserver(
      (els) =>
        els.forEach(
          (e) =>
            e.isIntersecting &&
            e.target.classList.add("show")
        ),
      { threshold: 0.08 }
    );

    document
      .querySelectorAll(".reveal")
      .forEach((e) => obs.observe(e));

    return () => obs.disconnect();
  }, []);

  // Keyboard navigation for the open lightbox.
  useEffect(() => {
    const fn = (e) => {
      if (lightbox !== null) {
        if (e.key === "Escape") setLightbox(null);

        if (e.key === "ArrowRight") {
          setLightbox(
            (lightbox + 1) % gallery.length
          );
        }

        if (e.key === "ArrowLeft") {
          setLightbox(
            (lightbox - 1 + gallery.length) %
            gallery.length
          );
        }
      }
    };

    window.addEventListener("keydown", fn);

    return () =>
      window.removeEventListener("keydown", fn);
  }, [lightbox]);

  const jump = (x) => {
    setMenu(false);

    document
      .getElementById(x.toLowerCase())
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  const openRegistration = () => {
    setMenu(false);
    setRegistrationOpen(true);
  };

  const closeRegistration = () => {
    setRegistrationOpen(false);
  };

  return (
    <>
      <Navbar
        menu={menu}
        setMenu={setMenu}
        jump={jump}
        onRegister={openRegistration}
      />

      <main id="top">
        <Hero
          jump={jump}
          onRegister={openRegistration}
        />



        <About />

        <Events jump={jump} />

        <Feature jump={jump} />

        <Schedule />

        <Speakers />

        <Gallery onSelect={setLightbox} />

        <Team />

        <Partners />

        <Contact onRegister={openRegistration} />
      </main>

      <Footer />

      {lightbox !== null && (
        <Lightbox
          item={gallery[lightbox]}
          onClose={() => setLightbox(null)}
          onPrev={() =>
            setLightbox(
              (lightbox - 1 + gallery.length) %
              gallery.length
            )
          }
          onNext={() =>
            setLightbox(
              (lightbox + 1) % gallery.length
            )
          }


        />
      )}

      <RegistrationModal
  isOpen={registrationOpen}
  onClose={closeRegistration}
  onAbstractSubmit={(registrationId) => {
    console.log("ABSTRACT BUTTON CLICKED:", registrationId);

    setRegistrationOpen(false);
    setAbstractRegistrationId(registrationId);
    setAbstractOpen(true);
  }}
/>
      <AbstractSubmissionModal
        isOpen={abstractOpen}
        onClose={closeAbstractSubmission}
        registrationId={abstractRegistrationId}
      />

      {/* {registrationOpen && (
        <div
          className="registration-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Conference registration"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeRegistration();
            }
          }}
        >
          <div className="registration-modal-content">
            <button
              type="button"
              className="registration-modal-close"
              onClick={closeRegistration}
              aria-label="Close registration"
            >
              ×
            </button>

            <Contact />
          </div>
        </div>
      )} */}
    </>
  );
}
