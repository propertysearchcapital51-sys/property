import { projects } from "../data/projects";
import { useState } from "react";
import { Search } from "lucide-react";
import ProjectCard from "../components/ProjectCard";
import SectionHeading from "../components/SectionHeading";

export default function Properties() {
  const [query, setQuery] = useState("");
  const filtered = projects.filter(p => `${p.name} ${p.location}`.toLowerCase().includes(query.toLowerCase()));
  return <>
    <section className="page-hero page-hero-short"><div className="page-hero-image"><img src={projects[0].image} alt="Premium residential plots"/></div><div className="page-hero-shade"/><div className="container page-hero-content"><span className="eyebrow">EXPLORE OUR PORTFOLIO</span><h1>Premium plots.<br/><em>Promising locations.</em></h1><p>Explore our featured residential plot destinations around Hyderabad.</p></div></section>
    <section className="section"><div className="container"><div className="properties-heading"><SectionHeading eyebrow="FIND YOUR LOCATION" title="Discover our projects" text="Compare locations, explore project information and connect with our team for the latest availability."/><label className="search-box"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by project or location"/></label></div><div className="properties-grid">{filtered.map((p,i)=><ProjectCard key={p.id} project={p} index={i}/>)}</div>{filtered.length===0&&<div className="empty-state">No projects match that search. Try another location.</div>}</div></section>
  </>;
}
