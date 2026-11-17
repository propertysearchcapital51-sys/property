
import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Menu,
  X,
  ArrowUpRight,
  Globe,
  ChevronDown,
  Check,
} from "lucide-react";

import { useLanguage } from "../context/LanguageContext";
import "./Header.css";

const languages = [
  { code: "en", label: "English", native: "English" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
];

function Header() {
  const [open, setOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  const languageRef = useRef(null);

  const { language, setLanguage, t } = useLanguage();

  const selectedLanguage =
    languages.find((item) => item.code === language) || languages[0];

  useEffect(() => {
    let previousScroll = window.scrollY;

    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll < 80) {
        setHidden(false);
      } else if (currentScroll > previousScroll) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      previousScroll = currentScroll;
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close language dropdown when clicking outside.
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        languageRef.current &&
        !languageRef.current.contains(event.target)
      ) {
        setLanguageOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, []);

  const closeMenus = () => {
    setOpen(false);
    setLanguageOpen(false);
  };

  const handleLanguageChange = (languageCode) => {
    setLanguage(languageCode);
    setLanguageOpen(false);
    setOpen(false);
  };

  const navLinks = [
    { name: t("home"), path: "/" },
    { name: t("about"), path: "/about-us" },
    { name: t("properties"), path: "/properties" },
    { name: "Blog", path: "/blog" },
    { name: t("contact"), path: "/contact" },
  ];

  return (
    <header className={`site-header ${hidden ? "header-hidden" : ""}`}>
      <div className="header-container">

        {/* BRAND LOGO AND COMPANY NAME */}
        <Link
          to="/"
          className="brand"
          onClick={closeMenus}
          aria-label="Property Search Capital home"
        >
          <img
            src="/logo.webp"
            alt="Property Search Capital logo"
            className="brand-logo"
          />

          <span className="brand-copy">
            <strong>PROPERTY SEARCH</strong>
            <small>CAPITAL</small>
            <span className="brand-tagline">
              FIND YOUR PERFECT LAND
            </span>
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="desktop-nav" aria-label="Main navigation">
          {navLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              onClick={closeMenus}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* HEADER ACTIONS */}
        <div className="header-actions">

          {/* LANGUAGE SELECTOR */}
          <div className="language-wrapper" ref={languageRef}>
            <button
              className={`language-button ${
                languageOpen ? "language-button-active" : ""
              }`}
              type="button"
              onClick={() => {
                setLanguageOpen((previous) => !previous);
                setOpen(false);
              }}
              aria-expanded={languageOpen}
              aria-haspopup="true"
              aria-label="Choose website language"
            >
              <Globe size={17} />

              <span className="language-current">
                {selectedLanguage.native}
              </span>

              <ChevronDown
                size={15}
                className={languageOpen ? "chevron-rotated" : ""}
              />
            </button>

            {languageOpen && (
              <div className="language-dropdown" role="menu">
                <div className="language-dropdown-heading">
                  Select Language
                </div>

                {languages.map((item) => (
                  <button
                    type="button"
                    role="menuitem"
                    key={item.code}
                    className={`language-option ${
                      language === item.code ? "selected" : ""
                    }`}
                    onClick={() => handleLanguageChange(item.code)}
                  >
                    <span className="language-option-copy">
                      <strong>{item.native}</strong>
                      <small>{item.label}</small>
                    </span>

                    {language === item.code && (
                      <Check size={17} className="language-check" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ENQUIRY BUTTON */}
          <Link
            to="/contact"
            className="header-cta"
            onClick={closeMenus}
          >
            <span>{t("enquire")}</span>
            <ArrowUpRight size={17} />
          </Link>

          {/* MOBILE MENU BUTTON */}
          <button
            className="mobile-menu-button"
            type="button"
            onClick={() => {
              setOpen((previous) => !previous);
              setLanguageOpen(false);
            }}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>
      </div>

      {/* MOBILE NAVIGATION */}
      <div className={`mobile-nav ${open ? "mobile-nav-open" : ""}`}>
        <nav aria-label="Mobile navigation">
          {navLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `mobile-nav-link ${isActive ? "active" : ""}`
              }
              onClick={closeMenus}
            >
              {item.name}
              <ArrowUpRight size={16} />
            </NavLink>
          ))}

          <Link
            to="/contact"
            className="mobile-enquiry"
            onClick={closeMenus}
          >
            {t("enquire")}
            <ArrowUpRight size={18} />
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
