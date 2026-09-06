/* eslint-disable react/no-unknown-property */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Landing.scss";
import DakshaTitle from "../assets/dakshafont.png";
import HeroBG from "../assets/dakshaBG.jpg";
import PanBG from "../assets/bg2.jpg";

const SNAP_MS = 720;

function Landing() {
  const [isRevealed, setIsRevealed] = useState(false);
  const rootRef = useRef(null);
  const pinRef = useRef(null);

  useEffect(() => {
    setIsRevealed(true);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const pin = pinRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const doc = document.documentElement;
    const shift = root.querySelector(".bg-shift");

    if (reduceMotion) {
      doc.style.setProperty("--daksha-progress", "1");
      return () => doc.style.removeProperty("--daksha-progress");
    }

    doc.setAttribute("data-landing-scroll", "");
    doc.dataset.landingView = "hero";
    doc.style.setProperty("--daksha-progress", "0");

    let atInfo = false;
    let snapping = false;
    let touchY = null;
    let snapTimer = 0;

    const endSnap = () => {
      snapping = false;
      root.classList.remove("is-snapping");
    };

    const setView = (info) => {
      if (snapping || info === atInfo) return;
      snapping = true;
      atInfo = info;
      root.classList.add("is-snapping");
      root.classList.toggle("is-info", info);
      doc.dataset.landingView = info ? "info" : "hero";
      doc.style.setProperty("--daksha-progress", info ? "1" : "0");
      window.clearTimeout(snapTimer);
      snapTimer = window.setTimeout(endSnap, SNAP_MS + 40);
    };

    const onShiftEnd = (e) => {
      if (e.target !== shift || e.propertyName !== "transform") return;
      window.clearTimeout(snapTimer);
      endSnap();
    };

    const onWheel = (e) => {
      e.preventDefault();
      if (e.deltaY > 0) setView(true);
      else if (e.deltaY < 0) setView(false);
    };

    const onTouchStart = (e) => {
      const insideInfo = e.target.closest(".info-panel");
      if (insideInfo && insideInfo.scrollHeight > insideInfo.clientHeight) {
        touchY = null;
        return;
      }
      touchY = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      if (touchY == null) return;
      if (Math.abs(touchY - e.touches[0].clientY) > 16 && e.cancelable) {
        // Prevent accidental browser pull-to-refresh on the hero screen
        if (!atInfo) {
          e.preventDefault();
        }
      }
    };

    const onTouchEnd = (e) => {
      if (touchY == null) return;
      const dy = touchY - e.changedTouches[0].clientY;
      touchY = null;
      if (dy > 28) setView(true);
      else if (dy < -28) setView(false);
    };

    const onPinClick = (e) => {
      if (atInfo) return;
      if (e.target.closest("a, button, .dates-row, .section-info")) return;
      setView(true);
    };

    shift?.addEventListener("transitionend", onShiftEnd);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    pin?.addEventListener("click", onPinClick);
    return () => {
      window.clearTimeout(snapTimer);
      shift?.removeEventListener("transitionend", onShiftEnd);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      pin?.removeEventListener("click", onPinClick);
      doc.style.removeProperty("--daksha-progress");
      doc.removeAttribute("data-landing-scroll");
      doc.removeAttribute("data-landing-view");
    };
  }, [isRevealed]);

  return (
    <main className={`landing ${isRevealed ? "landing--revealed" : ""}`}>
      <div className="landing-scroll-root" ref={rootRef}>
        <div className="bg-pin" ref={pinRef}>

          <div className="bg-shift">
            <img src={HeroBG} alt="" className="bg-img bg-img--hero" fetchPriority="high" />
            <img src={PanBG} alt="" className="bg-img bg-img--pan" loading="lazy" decoding="async" />
          </div>

          <div className="bg-overlay bg-overlay--left" />
          <div className="bg-overlay bg-overlay--right" />
          <div className="bg-overlay bg-overlay--top" />
          <div className="bg-pan-fade" aria-hidden="true" />

          <section className="section-hero" aria-label="Daksha'26">
            <div className="hero-layer">
              <div className="corner-text top-left anim-fade-in-down">
                <p>ഗവ. എഞ്ചിനീയറിംഗ് കോളേജ്</p>
                <p>പാലക്കാട്</p>
              </div>


              <div className="corner-text bottom-right anim-fade-in-right">
                <span className="red-text">SECULAR</span> COLLEGE UNION
              </div>

              <div className="scroll-hint anim-fade-in-up">
                <div className="scroll-hint__line" />
              </div>

              <div className="hero-vline anim-vline" aria-hidden="true" />
            </div>
          </section>

          {/* Title block: Daksha logo + tagline + dates (mobile stacks these vertically) */}
          <div className="hero-title-block">
            <div className="left-title anim-reveal-left">
              <div className="title-fly">
                <img src={DakshaTitle} alt="Daksha'26" className="title-png" />
              </div>
              <p className="title-tagline anim-fade-in-up-delayed">Annual Arts &amp; Cultural Fest</p>
            </div>
            <div className="bottom-left-dates anim-fade-in-up">
              <div className="dates-row">
                <span tabIndex={0}>22</span>
                <span tabIndex={0}>23</span>
                <span tabIndex={0}>24</span>
              </div>
              <div className="month-row">
                <span className="red-text">S E P</span> T E M B E R
              </div>
            </div>
          </div>

          <section className="section-info" id="info" aria-label="About Daksha'26">
            <div className="info-panel">
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
                <Link to="/guidelines" className="info-link" style={{ "--link-delay": "0" }}>
                  <span className="info-link__number">01</span>
                  <span className="info-link__label">Guidelines</span>
                  <span className="info-link__arrow">→</span>
                </Link>

                <Link to="/events" className="info-link" style={{ "--link-delay": "1" }}>
                  <span className="info-link__number">02</span>
                  <span className="info-link__label">Events</span>
                  <span className="info-link__arrow">→</span>
                </Link>

                <Link to="/board" className="info-link" style={{ "--link-delay": "2" }}>
                  <span className="info-link__number">03</span>
                  <span className="info-link__label">Leader Board</span>
                  <span className="info-link__arrow">→</span>
                </Link>
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
