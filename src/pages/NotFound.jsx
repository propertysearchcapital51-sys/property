import { Link } from "react-router-dom";
export default function NotFound() {
  return <section className="not-found"><span className="eyebrow">404 · PAGE NOT FOUND</span><h1>Looks like this plot<br/><em>isn't on the map.</em></h1><p>The page may have moved or the link may be incorrect.</p><Link className="button" to="/">Back to Home</Link></section>;
}
