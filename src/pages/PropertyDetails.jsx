import { useParams, Link, Navigate } from "react-router-dom";
import { MapPin, ArrowUpRight, CheckCircle2, FileText, Phone } from "lucide-react";
import { projects } from "../data/projects";
import { amenities } from "../data/content";
import { company } from "../data/company";
import EnquiryForm from "../components/EnquiryForm";
import ParallaxImage from "../components/ParallaxImage";

export default function PropertyDetails() {
  const { slug } = useParams();
  const project = projects.find(p => p.slug === slug);
  if (!project) return <Navigate to="/properties" replace/>;
  return <>
    <section className="detail-hero"><img src={project.image} alt={`${project.name} residential plots`}/><div className="detail-hero-shade"/><div className="container detail-hero-content"><Link to="/properties" className="back-link">← All Properties</Link><span className="eyebrow">PROPERTY SEARCH CAPITAL · PROJECT</span><h1>Residential Plots at<br/><em>{project.name}</em></h1><p><MapPin size={17}/>{project.location}</p></div></section>
    <section className="section"><div className="container detail-grid"><div className="detail-main"><span className="eyebrow">{project.tagline}</span><h2>Find your place in {project.name}</h2><p>{project.longDescription}</p><div className="detail-highlights"><h3>Location highlights</h3>{project.highlights.map(h=><div key={h}><CheckCircle2/>{h}</div>)}</div><div className="detail-photo"><ParallaxImage src={project.image} alt={`${project.name} project view`}/></div><h3>Infrastructure to explore</h3><p>Ask our team for the project-specific amenities list, approved layout, exact survey details and supporting documentation. Features may differ between projects.</p><div className="detail-amenities">{amenities.slice(0,6).map(a=><span key={a}><CheckCircle2/>{a}</span>)}</div><div className="document-note"><FileText/><div><strong>Review documents before you invest</strong><p>Request the latest project brochure, layout and approval documentation for independent verification.</p></div></div></div><aside className="detail-sidebar"><div className="sidebar-card"><span className="eyebrow">INTERESTED IN THIS PROJECT?</span><h3>Get project details</h3><p>Share your details and our team will connect with you.</p><EnquiryForm compact defaultProperty={project.name}/><a className="sidebar-phone" href={`tel:${company.phone}`}><Phone size={16}/> {company.phone}</a></div></aside></div></section>
    <section className="final-cta"><div className="container final-cta-inner"><div><span className="eyebrow">TAKE THE NEXT STEP</span><h2>See the location.<br/><em>Understand the opportunity.</em></h2></div><div className="final-cta-actions"><Link to="/contact" className="button">Arrange a Site Visit <ArrowUpRight/></Link></div></div></section>
  </>;
}
