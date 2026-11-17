import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Search } from "lucide-react";
import banner from "../assets/p4.webp";
import BlogCard from "../components/BlogCard";
import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";
import { api } from "../services/api";

export default function Blog() {
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [data, setData] = useState({ posts: [], categories: [], total: 0 });
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let alive = true;
    setStatus("loading");
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("q", search);
    api
      .get(`/posts?${params}`)
      .then((result) => {
        if (!alive) return;
        setData((prev) => ({ ...result, categories: result.categories.length ? result.categories : prev.categories }));
        setStatus("ready");
      })
      .catch(() => alive && setStatus("error"));
    return () => {
      alive = false;
    };
  }, [category, search]);

  const filtering = Boolean(category || search);
  const [lead, ...rest] = data.posts;
  const showFeatured = !filtering && lead;

  return (
    <>
      <Helmet>
        <title>Blog | Property Search Capital</title>
        <meta name="description" content="Guides and insights on buying open plots in Hyderabad: approvals, locations, documentation and investment tips." />
      </Helmet>

      <section className="page-hero page-hero-short">
        <div className="page-hero-image"><img src={banner} alt="" /></div>
        <div className="page-hero-shade" />
        <div className="container page-hero-content">
          <span className="eyebrow">INSIGHTS &amp; GUIDES</span>
          <h1>Smarter land decisions<br /><em>start with better knowledge.</em></h1>
          <p>Practical guidance on open plots, approvals, locations and property documentation in Hyderabad.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="blog-toolbar">
            <SectionHeading eyebrow="LATEST ARTICLES" title="From our property experts" />
            <label className="search-box">
              <Search size={18} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search articles" aria-label="Search articles" />
            </label>
          </div>

          {data.categories.length > 0 && (
            <div className="blog-filters" role="tablist" aria-label="Filter by category">
              <button type="button" className={!category ? "is-active" : ""} onClick={() => setCategory("")}>All</button>
              {data.categories.map((c) => (
                <button type="button" key={c} className={category === c ? "is-active" : ""} onClick={() => setCategory(c)}>{c}</button>
              ))}
            </div>
          )}

          {status === "loading" && (
            <div className="blog-grid" aria-busy="true">
              {[0, 1, 2].map((i) => <div className="blog-skeleton" key={i} />)}
            </div>
          )}

          {status === "error" && (
            <div className="empty-state">Articles are unavailable right now. Please try again in a moment.</div>
          )}

          {status === "ready" && data.posts.length === 0 && (
            <div className="empty-state">
              {filtering ? "No articles match your search. Try another keyword or category." : "Our first articles are on the way. Please check back soon."}
            </div>
          )}

          {status === "ready" && data.posts.length > 0 && (
            <>
              {showFeatured && <Reveal><BlogCard post={lead} featured /></Reveal>}
              <div className="blog-grid">
                {(showFeatured ? rest : data.posts).map((post, i) => (
                  <Reveal key={post.id} delay={(i % 3) * 0.08}><BlogCard post={post} /></Reveal>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
