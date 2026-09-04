import React, { useEffect, useRef, useState } from "react";
import "./Landing.scss";
import DakshaTitle from "../assets/dakshafont.png";
import HeroBG   from "../assets/dakshaBG.jpg";
import PanBG    from "../assets/bg2.png";

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

          {/*
           * ── Horizontal canvas: [dakshaBG | bg2] side-by-side ──
           * .bg-shift is 200vw wide and pans LEFT as --progress rises,
           * creating a vertical-scroll → horizontal-travel effect.
           */}
          <div className="bg-shift">
            <img src={HeroBG} alt="" className="bg-img bg-img--hero" fetchPriority="high" />
            <img src={PanBG}  alt="" className="bg-img bg-img--pan" />
          </div>

          {/* ── Gradient overlays ── */}
          <div className="bg-overlay bg-overlay--left" />
          <div className="bg-overlay bg-overlay--right" />
          <div className="bg-overlay bg-overlay--top" />

          {/* ── Noise grain texture ── */}
          <div className="bg-grain" aria-hidden="true" />

          {/* ── HERO SECTION ── */}
          <section className="section-hero" aria-label="Daksha'26">
            <div className="hero-layer">

              {/* College name — top left */}
              <div className="corner-text top-left anim-fade-in-down">
                <p>ഗവ. എഞ്ചിനീയറിംഗ് കോളേജ്</p>
                <p>പാലക്കാട്</p>
              </div>

              {/* Dates — bottom left */}
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

              {/* College union — bottom right */}
              <div className="corner-text bottom-right anim-fade-in-right">
                <span className="red-text">SECULAR</span> COLLEGE UNION
              </div>

              {/* Scroll hint */}
              <div className="scroll-hint anim-fade-in-up">
                <div className="scroll-hint__line" />
              </div>

              {/* Decorative vertical rule */}
              <div className="hero-vline anim-vline" aria-hidden="true" />
            </div>
          </section>

          {/* ── TITLE FLY ── */}
          <div className="left-title anim-reveal-left">
            <div className="title-fly" ref={titleRef}>
              <img src={DakshaTitle} alt="Daksha'26" className="title-png" />
            </div>
            <p className="title-tagline anim-fade-in-up-delayed">Annual Arts &amp; Cultural Fest</p>
          </div>

          {/* ── INFO SECTION ── */}
          <section className="section-info" id="info" aria-label="About Daksha'26">
            <div className="info-panel">

              {/* Red accent bar */}
              <div className="info-accent-bar" />

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
                  style={{ "--link-delay": "0" }}
                >
                  <span className="info-link__number">01</span>
                  <span className="info-link__label">Guidelines</span>
                  <span className="info-link__arrow">→</span>
                </a>

                <a href="/events" className="info-link" style={{ "--link-delay": "1" }}>
                  <span className="info-link__number">02</span>
                  <span className="info-link__label">Events</span>
                  <span className="info-link__arrow">→</span>
                </a>

                <a href="/board" className="info-link" style={{ "--link-delay": "2" }}>
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
