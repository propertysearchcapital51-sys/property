import { Link } from "react-router-dom";
import { ArrowUpRight, Clock } from "lucide-react";
import { formatDate } from "../services/format";

export default function BlogCard({ post, featured = false }) {
  return (
    <Link to={`/blog/${post.slug}`} className={`blog-card ${featured ? "blog-card-featured" : ""}`}>
      <div className="blog-card-media">
        {post.coverImage ? (
          <img src={post.coverImage} alt="" loading="lazy" />
        ) : (
          <div className="blog-card-placeholder" aria-hidden="true"><span>P<i>S</i>C</span></div>
        )}
        <span className="blog-chip">{post.category}</span>
      </div>
      <div className="blog-card-body">
        <div className="blog-meta">
          <span>{formatDate(post.publishedAt)}</span>
          <i />
          <span><Clock size={12} /> {post.readMinutes} min read</span>
        </div>
        <h3>{post.title}</h3>
        {post.excerpt && <p>{post.excerpt}</p>}
        <span className="blog-read">Read article <ArrowUpRight size={15} /></span>
      </div>
    </Link>
  );
}
