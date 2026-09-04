import { useState, useEffect, useCallback } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";

import "./Navbar.scss";
import DakshaLogo from "../assets/dakshafont.png";

// Navigation items — update hrefs/routes as needed
const NAV_LINKS = [
  { label: "Home",         to: "/" },
  { label: "Events",       to: "/events" },
  { label: "Leader Board", to: "/board" },
];

function Navbar() {
  const [isMenuOpen,  setIsMenuOpen]  = useState(false);
  const [isScrolled,  setIsScrolled]  = useState(false);
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  // ── Close helpers ──────────────────────────────────────────
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const toggleMenu = useCallback(() => setIsMenuOpen((v) => !v), []);

  // ── Lock body scroll when mobile menu is open ─────────────
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // ── ESC key closes mobile menu ─────────────────────────────
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && isMenuOpen) closeMenu();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen, closeMenu]);

  // ── Scroll-aware navbar ────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const vh      = window.innerHeight;
      setIsScrolled(scrollY > vh * 0.12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLandingPage]);

  return (
    <header
      className={[
        "navbar",
        isLandingPage ? "navbar--landing" : "",
        isScrolled ? "navbar--scrolled" : "",
      ].filter(Boolean).join(" ")}
    >
      <div className="navbar__container">

        {/* ── Logo (visible only when scrolled) ─────────────── */}
        <Link
          to="/"
          className={`navbar__logo${(!isLandingPage || isScrolled) ? " navbar__logo--visible" : ""}`}
          aria-label="Daksha'26 — Home"
          onClick={closeMenu}
        >
          <img
            src={DakshaLogo}
            alt="Daksha'26"
            className="navbar__logo-img"
            id="daksha-nav-logo"
          />
        </Link>

        {/* ── Desktop navigation links ──────────────────────── */}
        <nav className="navbar__nav" aria-label="Main navigation">
          <ul className="navbar__links">
            {NAV_LINKS.map(({ label, to }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `navbar__link${isActive ? " navbar__link--active" : ""}`
                  }
                  end={to === "/"}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── CTA button ────────────────────────────────────── */}
        <Link to="/events" className="navbar__cta">
          Register
        </Link>

        {/* ── Mobile hamburger ──────────────────────────────── */}
        <button
          type="button"
          className={`navbar__hamburger${isMenuOpen ? " navbar__hamburger--open" : ""}`}
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          <span className="navbar__hamburger-bar" />
          <span className="navbar__hamburger-bar" />
        </button>
      </div>

      {/* ── Mobile menu overlay ─────────────────────────────── */}
      <div
        id="mobile-menu"
        className={`navbar__mobile-menu${isMenuOpen ? " navbar__mobile-menu--open" : ""}`}
        aria-hidden={!isMenuOpen}
      >
        {/* Mobile menu logo */}
        <img src={DakshaLogo} alt="Daksha'26" className="navbar__mobile-logo" />

        <nav aria-label="Mobile navigation">
          <ul className="navbar__mobile-links">
            {NAV_LINKS.map(({ label, to }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `navbar__mobile-link${isActive ? " navbar__mobile-link--active" : ""}`
                  }
                  onClick={closeMenu}
                  end={to === "/"}
                  tabIndex={isMenuOpen ? 0 : -1}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          to="/events"
          className="navbar__mobile-cta"
          onClick={closeMenu}
          tabIndex={isMenuOpen ? 0 : -1}
        >
          Register
        </Link>
      </div>
    </header>
  );
}

export default Navbar;
