
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  MapPin,
  Trees,
  CheckCircle2,
  Phone
} from "lucide-react";

import { useContent } from "../context/ContentContext";
import { useLanguage } from "../context/LanguageContext";

import hero from "../assets/p1.webp";
import overview from "../assets/p2.webp";
import lifestyle from "../assets/p3.webp";
import community from "../assets/p4.webp";

import Reveal from "../components/Reveal";
import ParallaxImage from "../components/ParallaxImage";
import SectionHeading from "../components/SectionHeading";
import ProjectCard from "../components/ProjectCard";
import FAQ from "../components/FAQ";
import Counter from "../components/Counter";
import SplitText from "../components/SplitText";
import BlogCard from "../components/BlogCard";
import { api } from "../services/api";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Home() {
  const { t, language } = useLanguage();
  const { projects, amenities, faqs, testimonials, company, hero: heroContent } = useContent();
  /* Hero copy is editable in the admin (English). Other languages keep their translations. */
  const heroCopy = (field, key) => (language === "en" ? heroContent[field] : t(key));

  const phoneNumber = "919948002024";

  // Load the three latest published blog posts for the homepage.
  const [latestPosts, setLatestPosts] = useState([]);
  const [blogsStatus, setBlogsStatus] = useState("loading");

  useEffect(() => {
    let alive = true;

    api
      .get("/posts?limit=3")
      .then((result) => {
        if (!alive) return;
        setLatestPosts(Array.isArray(result.posts) ? result.posts : []);
        setBlogsStatus("ready");
      })
      .catch(() => {
        if (alive) setBlogsStatus("error");
      });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      {/* HERO SECTION */}
      <section className="hero-section">

        <div className="hero-background">
          <img
            src={hero}
            alt="Premium plotted development landscape"
          />
        </div>

        <div className="hero-overlay" />

        <div className="container hero-content">

          {/* HERO CONTENT */}
          <div className="hero-copy">

            <span className="hero-kicker">
              <i />
              {heroCopy("eyebrow", "heroEyebrow")}
            </span>

            <h1>
              <SplitText text={heroCopy("title", "heroTitle")} />
              <em>
                <SplitText
                  text="Secure plots. Stronger futures."
                  start={heroCopy("title", "heroTitle").split(" ").length}
                />
              </em>
            </h1>

            <p>{heroCopy("text", "heroText")}</p>

            <div className="hero-actions">

              <Link to="/properties" className="button">
                {t("viewProjects")}
                <ArrowUpRight size={17} />
              </Link>

              <a
                href={company.brochure}
                className="button button-outline-light"
                target="_blank"
                rel="noreferrer"
              >
                {t("brochure")}
                <ArrowUpRight size={17} />
              </a>

            </div>

            <div className="hero-proof">

              <span>
                <ShieldCheck size={17} />
                Guided property discovery
              </span>

              <span>
                <MapPin size={17} />
                Hyderabad growth corridors
              </span>

            </div>

          </div>


        </div>

        <div className="hero-scroll">
          SCROLL TO DISCOVER
          <span />
        </div>

      </section>


      {/* TRUST STRIP */}
      <section className="trust-strip">

        <div className="container trust-grid">

          <span>
            <ShieldCheck />
            Transparent guidance
          </span>

          <span>
            <MapPin />
            Carefully selected locations
          </span>

          <span>
            <CheckCircle2 />
            Documentation-first approach
          </span>

          <span>
            <Trees />
            Planned communities
          </span>

        </div>

      </section>


      {/* FEATURED PROJECTS */}
      <section
        className="section section-projects"
        id="projects"
      >

        <div className="container">

          <div className="section-topline">

            <SectionHeading
              eyebrow="EXPLORE OUR PORTFOLIO"
              title={t("featured")}
              text={t("featuredSub")}
            />

            <Link
              to="/properties"
              className="text-link"
            >
              View all projects
              <ArrowUpRight size={17} />
            </Link>

          </div>

          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={22}
            slidesPerView={1.15}
            navigation
            pagination={{ clickable: true }}
            autoplay={{
              delay: 3800,
              disableOnInteraction: false
            }}
            breakpoints={{
              640: {
                slidesPerView: 2
              },
              1024: {
                slidesPerView: 3
              }
            }}
            className="project-swiper"
          >

            {projects.map((project, i) => (
              <SwiperSlide key={project.id}>
                <ProjectCard
                  project={project}
                  index={i}
                />
              </SwiperSlide>
            ))}

          </Swiper>

        </div>

      </section>


      {/* COMPANY OVERVIEW */}
      <section className="section overview-section">

        <div className="container overview-grid">

          <Reveal>

            <div className="overview-image">

              <ParallaxImage
                src={overview}
                alt="Planned residential community"
              />

              <div className="image-caption">

                <span>PROPERTY SEARCH CAPITAL</span>

                <strong>
                  Land for today.
                  <br />
                  Possibilities for tomorrow.
                </strong>

              </div>

            </div>

          </Reveal>


          <Reveal delay={0.12}>

            <div className="overview-copy">

              <span className="eyebrow">
                WHO WE ARE
              </span>

              <h2>{t("overview")}</h2>

              <p>
                Property Search Capital helps buyers discover
                thoughtfully selected open plots across
                Hyderabad's developing corridors. We focus on
                clear communication, location understanding
                and a guided buying journey.
              </p>

              <p>
                From exploring the neighbourhood and layout
                to reviewing project documents, our team helps
                you ask the right questions and make informed
                decisions.
              </p>

              <ul className="check-list">

                <li>
                  <CheckCircle2 />
                  Project information explained clearly
                </li>

                <li>
                  <CheckCircle2 />
                  Site visit and selection assistance
                </li>

                <li>
                  <CheckCircle2 />
                  Guidance to review relevant documents
                </li>

              </ul>

              <Link
                to="/about-us"
                className="button button-dark"
              >
                Know Our Story
                <ArrowUpRight size={17} />
              </Link>

            </div>

          </Reveal>

        </div>

      </section>


      {/* PROJECT LOCATIONS */}
      <section className="location-band">

        <div className="container location-band-inner">

          <div>

            <span className="eyebrow">
              HYDERABAD & BEYOND
            </span>

            <h2>{t("locations")}</h2>

            <p>
              Explore our current project locations and
              speak with our team about connectivity,
              documents and availability.
            </p>

          </div>

          <div className="location-pills">

            {projects.map((p) => (
              <Link
                key={p.id}
                to={`/properties/${p.slug}`}
              >
                <MapPin size={15} />
                {p.name}
                <ArrowUpRight size={14} />
              </Link>
            ))}

          </div>

        </div>

      </section>


      {/* AMENITIES */}
      <section className="section">

        <div className="container">

          <SectionHeading
            eyebrow="THE DETAILS THAT MATTER"
            title={t("highlights")}
            text="Explore the infrastructure and community features offered by each venture. Exact amenities vary by project; request the project-specific plan."
            centered
          />

          <div className="amenity-layout">

            <div className="amenity-photo">

              <ParallaxImage
                src={community}
                alt="Green community landscaping"
              />

              <div className="amenity-photo-tag">

                <span>01 / PLANNING</span>

                <strong>
                  Thoughtful spaces.
                  <br />
                  Practical infrastructure.
                </strong>

              </div>

            </div>


            <div className="amenity-list">

              {amenities.map((item, i) => (
                <div
                  className="amenity-item"
                  key={item}
                >

                  <span>
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <p>{item}</p>

                  <CheckCircle2 size={17} />

                </div>
              ))}

            </div>

          </div>

        </div>

      </section>


      {/* STATISTICS */}
      <section className="stats-section">

        <div className="container stats-grid">

          <div>

            <span className="eyebrow">
              OUR COMMITMENT
            </span>

            <h2>
              Built around your
              <br />
              <em>next chapter.</em>
            </h2>

          </div>

          <div className="stat">

            <strong>
              <Counter to={6} />
              <span>+</span>
            </strong>

            <small>Project locations featured</small>

          </div>

          <div className="stat">

            <strong>1:1</strong>

            <small>Personalised guidance</small>

          </div>

          <div className="stat">

            <strong>
              <Counter to={360} duration={2.4} />°
            </strong>

            <small>Support through discovery</small>

          </div>

        </div>

      </section>


      {/* LIFESTYLE */}
      <section className="section lifestyle-section">

        <div className="container lifestyle-grid">

          <Reveal>

            <div>

              <span className="eyebrow">
                A PLACE FOR EVERY PLAN
              </span>

              <h2>
                Make room for
                <br />
                <em>what matters.</em>
              </h2>

              <p>
                Whether you plan to build a home, hold land
                as an investment or create a future for your
                family, start with a location and a decision
                you understand.
              </p>

              <Link
                to="/contact"
                className="text-link"
              >
                Talk to a property specialist
                <ArrowRight size={17} />
              </Link>

            </div>

          </Reveal>


          <Reveal delay={0.12}>

            <ParallaxImage
              src={lifestyle}
              alt="Future-ready residential community"
            />

          </Reveal>

        </div>

      </section>


      {/* TESTIMONIALS */}
      <section className="section testimonial-section">

        <div className="container">

          <SectionHeading
            eyebrow="CLIENT EXPERIENCES"
            title="Guidance that makes a difference"
            text="Hear how a clear, considered property journey can make buyers feel more confident."
            centered
          />

          <Swiper
            modules={[Autoplay, Pagination]}
            slidesPerView={1}
            autoplay={{ delay: 5000 }}
            pagination={{ clickable: true }}
            className="testimonial-swiper"
          >

            {testimonials.map((item) => (
              <SwiperSlide key={item.name}>

                <div className="testimonial-card">

                  <div className="quote-mark">
                    “
                  </div>

                  <blockquote>
                    {item.quote}
                  </blockquote>

                  <div className="testimonial-person">

                    <span>
                      {item.name
                        .split(" ")
                        .map((s) => s[0])
                        .join("")}
                    </span>

                    <div>

                      <strong>{item.name}</strong>

                      <small>{item.role}</small>

                    </div>

                  </div>

                </div>

              </SwiperSlide>
            ))}

          </Swiper>

        </div>

      </section>



      {/* LATEST BLOGS */}
      <section className="section home-blog-section">
        <div className="container">
          <div className="home-blog-heading">
            <SectionHeading
              eyebrow="INSIGHTS & GUIDES"
              title="Latest from our blog"
              text="Explore practical guidance on open plots, locations, approvals and property documentation."
            />
            <Link to="/blog" className="text-link">
              View all articles
              <ArrowUpRight size={17} />
            </Link>
          </div>

          {blogsStatus === "loading" && (
            <div className="blog-grid" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <div className="blog-skeleton" key={i} />
              ))}
            </div>
          )}

          {blogsStatus === "error" && (
            <div className="home-blog-empty">
              Blog articles are temporarily unavailable.
              <Link to="/blog">Visit our blog</Link>
            </div>
          )}

          {blogsStatus === "ready" && latestPosts.length > 0 && (
            <div className="blog-grid home-blog-grid">
              {latestPosts.map((post, i) => (
                <Reveal key={post.id || post.slug} delay={i * 0.08}>
                  <BlogCard post={post} />
                </Reveal>
              ))}
            </div>
          )}

          {blogsStatus === "ready" && latestPosts.length === 0 && (
            <div className="home-blog-empty">
              Our first articles are on the way. Please check back soon.
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="section faq-section">

        <div className="container faq-grid">

          <div>

            <span className="eyebrow">
              NEED A LITTLE CLARITY?
            </span>

            <h2>{t("faq")}</h2>

            <p>
              Buying land is an important decision.
              Start with the basics, then speak with our
              team for project-specific details.
            </p>

            <Link
              to="/contact"
              className="text-link"
            >
              Ask us a question
              <ArrowUpRight size={17} />
            </Link>

          </div>

          <FAQ items={faqs} />

        </div>

      </section>


      {/* FINAL CALL TO ACTION */}
      <section className="final-cta">

        <div className="container final-cta-inner">

          <div>

            <span className="eyebrow">
              YOUR NEXT STEP STARTS HERE
            </span>

            <h2>
              Find the right place
              <br />
              <em>to begin your story.</em>
            </h2>

            <p>
              Connect with our team to explore locations,
              arrange a site visit and request project details.
            </p>

          </div>


          <div className="final-cta-actions">

            <Link
              to="/contact"
              className="button"
            >
              Book a Free Consultation
              <ArrowUpRight size={17} />
            </Link>

            <a
              href={`https://wa.me/${phoneNumber}`}
              className="button button-outline-light"
              target="_blank"
              rel="noreferrer"
            >
              Chat on WhatsApp
            </a>

          </div>

        </div>

      </section>


      {/* FIXED FLOATING CONTACT BUTTONS */}
      <div className="floating-contact-buttons">

        {/* WHATSAPP BRAND ICON */}
        <a
          href={`https://wa.me/${phoneNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="floating-whatsapp"
          aria-label="Chat with us on WhatsApp"
          title="Chat on WhatsApp"
        >

          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            width="32"
            height="32"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M16.02 2.67A13.27 13.27 0 0 0 4.64 22.78L2.9 29.14l6.51-1.71a13.26 13.26 0 1 0 6.61-24.76Zm0 24.2c-2.03 0-4.02-.54-5.76-1.58l-.41-.24-3.86 1.01 1.03-3.76-.27-.43a10.9 10.9 0 1 1 9.27 5Zm5.98-8.17c-.33-.16-1.95-.96-2.25-1.07-.3-.11-.52-.16-.74.16-.22.33-.85 1.07-1.04 1.29-.19.22-.38.25-.71.08-.33-.16-1.4-.52-2.66-1.64-.98-.88-1.64-1.96-1.83-2.29-.19-.33-.02-.5.14-.66.15-.14.33-.38.49-.57.16-.19.22-.33.33-.55.11-.22.05-.41-.03-.57-.08-.16-.74-1.78-1.02-2.44-.27-.65-.54-.56-.74-.57l-.63-.01c-.22 0-.57.08-.87.41-.3.33-1.14 1.1-1.14 2.69s1.17 3.12 1.33 3.34c.16.22 2.3 3.51 5.56 4.91.78.34 1.39.55 1.87.7.79.25 1.51.22 2.08.13.63-.09 1.96-.8 2.24-1.56.27-.77.27-1.43.19-1.57-.08-.14-.3-.22-.63-.38Z" />
          </svg>

        </a>


        {/* CALL BUTTON */}
        <a
          href={`tel:+${phoneNumber}`}
          className="floating-call"
          aria-label="Call Property Search Capital"
          title="Call Property Search Capital"
        >

          <Phone size={25} />

        </a>

      </div>

    </>
  );
}
  