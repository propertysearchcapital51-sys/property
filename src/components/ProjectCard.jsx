import { MapPin, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";

export default function ProjectCard({ project, index = 0 }) {
  const { t } = useLanguage();
  return (
    <motion.article className="project-card" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.07, duration: 0.55 }}>
      <Link to={`/properties/${project.slug}`} className="project-image">
        <img src={project.image} alt={`${project.name} residential plots`} loading="lazy"/>
        <span className="image-label">Residential Plots</span>
        <span className="image-arrow"><ArrowUpRight size={20}/></span>
      </Link>
      <div className="project-card-body">
        <span className="eyebrow">{project.tagline}</span>
        <h3>{project.name}</h3>
        <p className="project-location"><MapPin size={15}/>{project.location}</p>
        <p>{project.description}</p>
        <Link className="text-link" to={`/properties/${project.slug}`}>{t("explore")} <ArrowUpRight size={16}/></Link>
      </div>
    </motion.article>
  );
}
