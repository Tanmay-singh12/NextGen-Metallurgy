import React, { useEffect, useRef } from "react";
import { createMetallurgyScene } from "./metallurgyScene";

// Owns the Three.js lifecycle: mount, animate, pause when off-screen or
// tab is hidden, handle resize/pointer, and fully dispose on unmount.
// This file imports "three" and is only ever reached via React.lazy, so
// the ~150KB(gzip) three.js chunk never blocks the initial page load.
export default function MetallurgyBackground3D({ mobile }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let scene;
    try {
      scene = createMetallurgyScene(canvas, { mobile });
    } catch {
      // WebGL unavailable or failed to initialize — silently render nothing;
      // the static fallback above this component's suspense boundary covers it.
      return;
    }

    let rafId = null;
    let running = false;

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      scene.resize(clientWidth, clientHeight);
    };
    resize();

    const loop = () => {
      scene.render();
      rafId = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    };

    start();

    // Pause the render loop when the tab is hidden or the hero has
    // scrolled out of view — keeps GPU/CPU usage near zero when idle.
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0.01 }
    );
    observer.observe(container);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // Subtle desktop-only parallax from pointer position; skipped on touch
    // devices where mousemove doesn't represent intentional input.
    const onPointerMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      scene.setPointer(x, -y);
    };
    if (!mobile) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
      resizeObserver.disconnect();
      if (!mobile) window.removeEventListener("pointermove", onPointerMove);
      scene.dispose();
    };
  }, [mobile]);

  return (
    <div ref={containerRef} className="hero-bg-canvas-wrap">
      <canvas ref={canvasRef} className="hero-bg-canvas" />
    </div>
  );
}
