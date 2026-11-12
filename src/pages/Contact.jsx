import { MapPin, Phone, Mail, Clock, ArrowUpRight } from "lucide-react";
import { company } from "../data/company";
import contactBanner from "../assets/p10.webp";
import EnquiryForm from "../components/EnquiryForm";
import { useLanguage } from "../context/LanguageContext";

export default function Contact() {
  const { t } = useLanguage();
  return <>
    <section className="page-hero page-hero-short"><div className="page-hero-image"><img src={contactBanner} alt="Contact Property Search Capital"/></div><div className="page-hero-shade"/><div className="container page-hero-content"><span className="eyebrow">WE'RE HERE TO HELP</span><h1>{t("contactTitle")}</h1><p>Talk to our specialists about locations, project information and arranging a site visit.</p></div></section>
    <section className="section"><div className="container contact-grid"><div className="contact-info"><span className="eyebrow">GET IN TOUCH</span><h2>Let's make your<br/><em>next step clearer.</em></h2><p>Share what you are looking for. Our team will help you find the right project information and plan a visit.</p><a className="contact-detail" href={`tel:${company.phone}`}><span><Phone/></span><div><small>OFFICE PHONE</small><strong>{company.phone}</strong></div></a><a className="contact-detail" href={`mailto:${company.email}`}><span><Mail/></span><div><small>COMPANY EMAIL</small><strong>{company.email}</strong></div></a><div className="contact-detail"><span><MapPin/></span><div><small>OFFICE LOCATION</small><strong>{company.address}</strong></div></div><div className="contact-detail"><span><Clock/></span><div><small>VISIT OUR OFFICE</small><strong>Contact us to confirm a suitable time</strong></div></div></div><div className="contact-form-card"><span className="eyebrow">SEND AN ENQUIRY</span><h3>Get in touch with our specialists</h3><p>Complete the form and continue your enquiry through WhatsApp.</p><EnquiryForm/></div></div></section>
    <section className="map-section"><div className="container map-heading"><div><span className="eyebrow">FIND OUR OFFICE</span><h2>Visit Property Search Capital</h2></div><a href="https://maps.google.com/maps?q=White%20House%20Building%20Begumpet" target="_blank" rel="noreferrer" className="text-link">Open in Google Maps <ArrowUpRight/></a></div><div className="container"><iframe title="Property Search Capital office location" src={company.mapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/></div></section>
  </>;
}
