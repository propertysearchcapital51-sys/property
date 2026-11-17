
import { Link } from "react-router-dom";
import { MapPin, ArrowUpRight } from "lucide-react";
import { useContent } from "../context/ContentContext";

export default function AnnouncementBar() {
  const { openLocations } = useContent();
  return (
    <div className="announcement" aria-label="Open plot locations">

      {/* LEFT LABEL */}
      <div className="announcement-label">
        <MapPin size={15} />
        <span>FEATURED LOCATIONS</span>
      </div>

      {/* LOCATION MARQUEE */}
      <div className="announcement-ticker">
        <div className="announcement-track">

          {[0, 1].map((copy) => (
            <div
              className="announcement-group"
              key={copy}
              aria-hidden={copy === 1}
            >
              {openLocations.map((location) => (
                <span
                  className="announcement-location"
                  key={`${copy}-${location}`}
                >
                  <i />
                  {location}
                </span>
              ))}
            </div>
          ))}

        </div>
      </div>

      {/* RIGHT LINK */}
      <Link to="/properties" className="announcement-link">
        Explore Projects
        <ArrowUpRight size={14} />
      </Link>

    </div>
  );
}
