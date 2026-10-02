import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Hero from '../components/Hero/Hero';
import About from '../components/About/About';
import Events from '../components/Events/Events';
import Feature from '../components/Feature/Feature';
import Schedule from '../components/Schedule/Schedule';
import Speakers from '../components/Speakers/Speakers';
import Gallery from '../components/Gallery/Gallery';
import Lightbox from '../components/Gallery/Lightbox';
import Team from '../components/Team/Team';
import Partners from '../components/Partners/Partners';
import Contact from '../components/Contact/Contact';
import Footer from '../components/Footer/Footer';
import { gallery } from '../data/gallery';

export default function Home() {
  const [menu, setMenu] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  // Fade sections in as they scroll into view.
  useEffect(() => {
    const obs = new IntersectionObserver(
      (els) => els.forEach(e => e.isIntersecting && e.target.classList.add('show')),
      { threshold: .08 }
    );
    document.querySelectorAll('.reveal').forEach(e => obs.observe(e));
    return () => obs.disconnect();
  }, []);

  // Keyboard navigation for the open lightbox.
  useEffect(() => {
    const fn = (e) => {
      if (lightbox !== null) {
        if (e.key === 'Escape') setLightbox(null);
        if (e.key === 'ArrowRight') setLightbox((lightbox + 1) % gallery.length);
        if (e.key === 'ArrowLeft') setLightbox((lightbox - 1 + gallery.length) % gallery.length);
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [lightbox]);

  const jump = (x) => {
    setMenu(false);
    document.getElementById(x.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Navbar menu={menu} setMenu={setMenu} jump={jump} />
      <main id="top">
        <Hero jump={jump} />
        <About />
        <Events jump={jump} />
        <Feature jump={jump} />
        <Schedule />
        <Speakers />
        <Gallery onSelect={setLightbox} />
        <Team />
        <Partners />
        <Contact />
      </main>
      <Footer />
      {lightbox !== null && (
        <Lightbox
          item={gallery[lightbox]}
          onClose={() => setLightbox(null)}
          onPrev={() => setLightbox((lightbox - 1 + gallery.length) % gallery.length)}
          onNext={() => setLightbox((lightbox + 1) % gallery.length)}
        />
      )}
    </>
  );
}
