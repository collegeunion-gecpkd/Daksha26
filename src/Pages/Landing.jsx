import React, { useEffect, useRef, useState } from "react";
import "./Landing.scss";
import DakshaTitle from "../assets/dakshafont.png";
import HeroBG from "../assets/dakshaBG.jpg";

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

function Landing() {
  const [isRevealed, setIsRevealed] = useState(false);
  const rootRef = useRef(null);
  const titleRef = useRef(null);
  const homeRect = useRef(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const t = setTimeout(() => setIsRevealed(true), 50);
      return () => clearTimeout(t);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const title = titleRef.current;
    if (!root || !title) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const doc = document.documentElement;
    doc.setAttribute("data-landing-scroll", "");

    const cacheHome = () => {
      const prev = title.style.transform;
      title.style.transform = "none";
      homeRect.current = title.getBoundingClientRect();
      title.style.transform = prev;
    };

    let frame = 0;
    const apply = () => {
      frame = 0;
      const progress = Math.max(0, Math.min(1, window.scrollY / window.innerHeight));
      root.style.setProperty("--progress", String(progress));
      doc.style.setProperty("--daksha-progress", String(progress));
      root.classList.toggle("is-info-interactive", progress > 0.4);
      root.classList.toggle("is-panning", progress > 0.02);

      if (reduceMotion) {
        title.style.transform = "none";
        return;
      }

      if (progress === 0 || !homeRect.current) cacheHome();
      const home = homeRect.current;
      const logo = document.getElementById("daksha-nav-logo");
      if (!home || !logo || home.width < 8) return;

      const dest = logo.getBoundingClientRect();
      if (dest.width < 8) return;

      const p = easeOutCubic(progress);
      const scale = dest.height / home.height;
      const tx = dest.left - home.left;
      const ty = dest.top - home.top;
      title.style.transform = `translate3d(${tx * p}px, ${ty * p}px, 0) scale(${1 + (scale - 1) * p})`;
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(apply);
    };

    const onResize = () => {
      cacheHome();
      onScroll();
    };

    cacheHome();
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      doc.style.removeProperty("--daksha-progress");
      doc.removeAttribute("data-landing-scroll");
      title.style.transform = "none";
    };
  }, [isRevealed]);

  return (
    <main className={`landing ${isRevealed ? "landing--revealed" : ""}`}>
      <div className="landing-scroll-root" ref={rootRef}>
        <div className="bg-pin">
          <div className="bg-shift">
            <img src={HeroBG} alt="" className="bg-img" fetchPriority="high" />
          </div>
          <div className="bg-overlay bg-overlay--left" />
          <div className="bg-overlay bg-overlay--right" />

          <section className="section-hero" aria-label="Daksha'26">
            <div className="hero-layer">
              <div className="corner-text top-left anim-fade-in-down">
                <p>ഗവ. എഞ്ചിനീയറിംഗ് കോളേജ്</p>
                <p>പാലക്കാട്</p>
              </div>

              <div className="bottom-left-dates anim-fade-in-up">
                <div className="dates-row">
                  <span>22</span>
                  <span>23</span>
                  <span>24</span>
                </div>
                <div className="month-row">
                  <span className="red-text">S E P</span> T E M B E R
                </div>
              </div>

              <div className="corner-text bottom-right anim-fade-in-right">
                <span className="red-text">SECULAR</span> COLLEGE UNION
              </div>

              <div className="scroll-hint anim-fade-in-up">
                <div className="scroll-hint__line" />
              </div>
            </div>
          </section>

          <div className="left-title anim-reveal-left">
            <div className="title-fly" ref={titleRef}>
              <img src={DakshaTitle} alt="Daksha'26" className="title-png" />
            </div>
          </div>

          <section className="section-info" id="info" aria-label="About Daksha'26">
            <div className="info-panel">
              <div className="info-desc">
                <p className="info-tagline">The Annual Arts &amp; Cultural Fest of</p>
                <p className="info-college">Government Engineering College, Palakkad</p>
                <p className="info-body">
                  Three days of art, culture, music, and competition — where creativity
                  meets tradition and talent finds its stage.
                </p>
              </div>

              <nav className="info-links" aria-label="Quick links">
                <a
                  href="https://drive.google.com/file/d/18av_nSavGaPboWRiNu1ACp-oZCtJ5x4O/view?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="info-link"
                >
                  <span className="info-link__number">01</span>
                  <span className="info-link__label">Guidelines</span>
                  <span className="info-link__arrow">→</span>
                </a>

                <a href="/events" className="info-link">
                  <span className="info-link__number">02</span>
                  <span className="info-link__label">Events</span>
                  <span className="info-link__arrow">→</span>
                </a>

                <a href="/board" className="info-link">
                  <span className="info-link__number">03</span>
                  <span className="info-link__label">Leader Board</span>
                  <span className="info-link__arrow">→</span>
                </a>
              </nav>

              <div className="info-footer">
                <span className="red-text">SECULAR</span> COLLEGE UNION
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Landing;
