import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Check, Clock, Link2 } from "lucide-react";
import { FaFacebookF, FaWhatsapp } from "react-icons/fa";
import BlogCard from "../components/BlogCard";
import EnquiryForm from "../components/EnquiryForm";
import NotFound from "./NotFound";
import { api } from "../services/api";
import { formatDate } from "../services/format";

export default function BlogPost() {
  const { slug } = useParams();
  const [state, setState] = useState({ status: "loading", post: null, related: [] });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    setState({ status: "loading", post: null, related: [] });
    api
      .get(`/posts/${slug}`)
      .then((d) => alive && setState({ status: "ready", post: d.post, related: d.related }))
      .catch((e) => alive && setState({ status: e.status === 404 ? "missing" : "error", post: null, related: [] }));
    return () => {
      alive = false;
    };
  }, [slug]);

  if (state.status === "loading") return <section className="blog-loading" aria-busy="true"><div /></section>;
  if (state.status === "missing") return <NotFound />;
  if (state.status === "error") {
    return <section className="not-found"><h1>We couldn't load this article</h1><p>Please check your connection and try again.</p><Link className="button" to="/blog">Back to Blog</Link></section>;
  }

  const { post, related } = state;
  const url = typeof window !== "undefined" ? window.location.href : "";
  const title = `${post.seoTitle || post.title} | Property Search Capital`;
  const description = post.seoDescription || post.excerpt;
  const share = encodeURIComponent(`${post.title} ${url}`);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description,
    image: post.coverImage ? [new URL(post.coverImage, url).href] : undefined,
    datePublished: post.publishedAt ? new Date(`${post.publishedAt.replace(" ", "T")}Z`).toISOString() : undefined,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: "Property Search Capital" },
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
        {description && <meta name="description" content={description} />}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        {description && <meta property="og:description" content={description} />}
        {post.coverImage && <meta property="og:image" content={new URL(post.coverImage, url).href} />}
        <link rel="canonical" href={url} />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <section className="page-hero blog-post-hero">
        {post.coverImage && <div className="page-hero-image"><img src={post.coverImage} alt="" /></div>}
        <div className="page-hero-shade" />
        <div className="container page-hero-content">
          <Link to="/blog" className="blog-back"><ArrowLeft size={15} /> All articles</Link>
          <span className="eyebrow">{post.category}</span>
          <h1>{post.title}</h1>
          <div className="blog-hero-meta">
            <span>{post.author}</span>
            <i />
            <span>{formatDate(post.publishedAt)}</span>
            <i />
            <span><Clock size={13} /> {post.readMinutes} min read</span>
          </div>
        </div>
      </section>

      <section className="section blog-article-section">
        <div className="container blog-article-wrap">
          <article className="blog-article">
            {post.excerpt && <p className="blog-lead">{post.excerpt}</p>}
            <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />

            {post.tags.length > 0 && (
              <div className="blog-tags">{post.tags.map((t) => <span key={t}>#{t}</span>)}</div>
            )}

            <div className="blog-share">
              <strong>Share this article</strong>
              <a href={`https://wa.me/?text=${share}`} target="_blank" rel="noreferrer" aria-label="Share on WhatsApp"><FaWhatsapp /></a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" aria-label="Share on Facebook"><FaFacebookF /></a>
              <button type="button" onClick={copy} aria-label="Copy link">{copied ? <Check size={16} /> : <Link2 size={16} />}</button>
            </div>
          </article>

          <aside className="blog-aside">
            <div className="blog-cta">
              <span className="eyebrow">TALK TO OUR TEAM</span>
              <h3>Looking for the right plot?</h3>
              <p>Get project details, documents and a free site visit.</p>
              <EnquiryForm compact />
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section blog-related">
          <div className="container">
            <div className="blog-toolbar"><h2 className="blog-related-title">Keep reading</h2></div>
            <div className="blog-grid">{related.map((p) => <BlogCard key={p.id} post={p} />)}</div>
          </div>
        </section>
      )}
    </>
  );
}
