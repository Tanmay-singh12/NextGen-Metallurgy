import React, { useEffect, useState } from "react";

import Navbar from "../components/Navbar/Navbar";
import Hero, { HeroIntro } from "../components/Hero/Hero";
import About from "../components/About/About";
import OurVoice from "../components/OurVoice/OurVoice";
import Faculty from "../components/Faculty/Faculty";
import Schedule from "../components/Schedule/Schedule";
import Speakers from "../components/Speakers/Speakers";
import Gallery from "../components/Gallery/Gallery";
import Lightbox from "../components/Gallery/Lightbox";
import Team from "../components/Team/Team";
import Partners from "../components/Partners/Partners";
import Contact from "../components/Contact/Contact";
import Footer from "../components/Footer/Footer";

import SymposiumHeader from "../components/SymposiumHeader/SymposiumHeader";
import HeroBackground from "../components/HeroBackground/HeroBackground";

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
    setAbstractRegistrationId(null);
  };

  // Drive the top scroll-progress bar via a CSS variable (cheaper than a
  // React state update on every scroll frame).
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      h.style.setProperty("--scroll-progress", pct + "%");
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        if (e.key === "Escape") {
          setLightbox(null);
        }

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
      <div className="scroll-progress" aria-hidden="true"></div>

      <Navbar
        menu={menu}
        setMenu={setMenu}
        jump={jump}
        onRegister={openRegistration}
      />

      <main id="top">
        {/* SymposiumHeader + Hero share one continuous dark/animated
           banner (single background behind both), so the logo, title
           and headline all sit on the same surface rather than two
           separately-colored sections. */}
        <div className="top-banner">
          <HeroBackground />
          <SymposiumHeader />
          <Hero
            jump={jump}
            onRegister={openRegistration}
          />
        </div>

        <HeroIntro />

        <About />

        <Speakers />

        <Schedule />

        <OurVoice />

        <Faculty />

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
        onAbstractSubmit={openAbstractSubmission}
      />

      <AbstractSubmissionModal
        isOpen={abstractOpen}
        onClose={closeAbstractSubmission}
        registrationId={abstractRegistrationId}
      />
    </>
  );
}