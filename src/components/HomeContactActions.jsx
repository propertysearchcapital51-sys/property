
import { Phone, MessageCircle } from "lucide-react";
import "./HomeContactActions.css";

const phoneNumber = "919948002024";

export default function HomeContactActions() {
  return (
    <div className="home-contact-actions">
      <a
        href={`https://wa.me/${phoneNumber}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="contact-action whatsapp"
      >
        <MessageCircle />
        <span>WhatsApp</span>
      </a>

      <a
        href={`tel:+${phoneNumber}`}
        aria-label="Call Property Search Capital"
        className="contact-action call"
      >
        <Phone />
        <span>Call +91 9948002024</span>
      </a>
    </div>
  );
}
