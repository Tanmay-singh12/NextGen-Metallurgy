import React, { Suspense, lazy, useEffect, useState } from "react";
import HeroBackgroundFallback from "./HeroBackgroundFallback";
import "./HeroBackground.css";

// The Three.js-importing component lives in its own chunk; it is only
// fetched when we've decided the animated version should actually run.
const MetallurgyBackground3D = lazy(() => import("./MetallurgyBackground3D"));

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export default function HeroBackground() {
  const [canAnimate, setCanAnimate] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const widthQuery = window.matchMedia("(max-width: 820px)");

    const evaluate = () => {
      setMobile(widthQuery.matches);
      setCanAnimate(!motionQuery.matches && supportsWebGL());
    };
    evaluate();

    // React live if the person changes their OS motion setting or resizes
    // across the mobile/desktop breakpoint while the tab is open.
    motionQuery.addEventListener("change", evaluate);
    widthQuery.addEventListener("change", evaluate);
    return () => {
      motionQuery.removeEventListener("change", evaluate);
      widthQuery.removeEventListener("change", evaluate);
    };
  }, []);

  return (
    <div className="hero-bg" aria-hidden="true">
      {canAnimate ? (
        <Suspense fallback={<HeroBackgroundFallback />}>
          <MetallurgyBackground3D mobile={mobile} />
        </Suspense>
      ) : (
        <HeroBackgroundFallback />
      )}
    </div>
  );
}
