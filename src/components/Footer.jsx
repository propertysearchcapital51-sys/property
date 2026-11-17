import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import { FaThreads } from "react-icons/fa6";
import { useContent } from "../context/ContentContext";
import { useLanguage } from "../context/LanguageContext";
import "./Footer.css";

export default function Footer() {
  const { t } = useLanguage();
  const { company } = useContent();
  const socials = company.socials || {};

  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <Link to="/" className="brand brand-light footer-brand-link" aria-label="Property Search Capital home">
            <img src="/logo.webp" alt="Property Search Capital logo" className="footer-logo" loading="lazy" />
            <span className="brand-copy">
              <strong>PROPERTY SEARCH</strong>
              <small>CAPITAL</small>
              <span className="footer-tagline">FIND YOUR PERFECT LAND</span>
            </span>
          </Link>

          <p>
            Our open plots offer opportunities to explore land ownership across Hyderabad's developing corridors.
            Review every project's documents and details before investing.
          </p>

          <div className="social-links">
            {socials.facebook && <a href={socials.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="social-facebook">
              <FaFacebookF />
            </a>}
            {socials.instagram && <a href={socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="social-instagram">
              <FaInstagram />
            </a>}
            {socials.youtube && <a href={socials.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="social-youtube">
              <FaYoutube />
            </a>}
            {socials.threads && (
              <a href={socials.threads} target="_blank" rel="noreferrer" aria-label="Threads" className="social-threads">
                <FaThreads />
              </a>
            )}
          </div>
        </div>

        <div className="footer-column">
          <h4>Quick Links</h4>
          <Link to="/">{t("home")}</Link>
          <Link to="/about-us">{t("about")}</Link>
          <Link to="/properties">{t("properties")}</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/contact">{t("contact")}</Link>
        </div>

        <div className="footer-column">
          <h4>Useful Links</h4>
          <a href={company.brochure} target="_blank" rel="noreferrer">Download Brochure</a>
          <Link to="/contact">Customer Support</Link>
          <Link to="/contact">Terms & Conditions</Link>
          <Link to="/contact">Privacy Policy</Link>
        </div>

        <div className="footer-column footer-contact">
          <h4>Contact</h4>
          <p><MapPin size={16} />{company.address}</p>
          <a href={`mailto:${company.email}`}><Mail size={16} />{company.email}</a>
          <a href={`tel:${company.phone}`}><Phone size={16} />{company.phone}</a>
          <Link to="/contact" className="footer-cta">
            Talk to our team <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Property Search Capital. All rights reserved.</span>
        <span>Designed for confident property decisions.</span>
      </div>
    </footer>
  );
}