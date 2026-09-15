import Link from "next/link";
import Image from "next/image";
import SiteHeader from "@/components/site-header";
import PortfolioSection from "@/components/portfolio-section";
import ContactSection from "@/components/contact-section";
import HomeFaq from "@/components/home-faq";
import { ArrowUpRight, ArrowRight, Ghost, Sparkles, MousePointer2, Layers3, ShoppingBag, Blocks, Check, Globe2 } from "@/components/ui/icons";

const services = [
  {
    type: "landing",
    icon: MousePointer2,
    name: "A great first impression.",
    title: "Landing page",
    description: "One focused page for your idea, offer, or next launch.",
    color: "yellow",
    tag: "SMALL & MIGHTY",
  },
  {
    type: "business",
    icon: Layers3,
    name: "A home for your business.",
    title: "Business website",
    description: "Your story, services, and everything clients need to find you.",
    color: "white",
    tag: "ROOM TO GROW",
  },
  {
    type: "store",
    icon: ShoppingBag,
    name: "Open for good business.",
    title: "Online store",
    description: "A place for your products, with a smooth path to checkout.",
    color: "purple",
    tag: "LET’S SELL SOMETHING",
  },
  {
    type: "custom",
    icon: Blocks,
    name: "Your big, what-if idea.",
    title: "Custom project",
    description: "Bookings, client portals, dashboards, or something entirely yours.",
    color: "white",
    tag: "THINK BIGGER",
  },
];

export default function Home() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main id="main-content">
        {/* HERO SECTION */}
        <section className="hero container">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="little-spark">✳</span> YOUR IDEAS. OUR LITTLE OBSESSION.
            </div>
            <h1>
              Big ideas.
              <br />
              <span className="highlight-word">Boo-tiful</span>
              <br />
              websites<span className="title-dot">.</span>
            </h1>
            <p>
              From your first page to your next big thing.
              <br className="desktop-break" /> We make getting a custom website feel easy.
            </p>
            <div className="hero-actions">
              <Link href="/start" className="button button-dark button-hero">
                Let’s build your website <ArrowUpRight size={22} />
              </Link>
              <a className="text-link" href="#how-it-works">
                How does it work? <ArrowRight size={17} />
              </a>
            </div>
            <div className="hero-note">
              <Check size={15} /> No tech talk needed. Submit your brief, then we agree on scope, price, and timeline together.
            </div>
          </div>
          <div className="hero-art" aria-label="A friendly Ghost Studio ghost building a website">
            <div className="art-note note-top">
              a little spirit.
              <br />
              a lot of possibility.
            </div>
            <Image
              className="ghost-hero"
              src="/ghost-artist.webp"
              alt="A friendly cartoon ghost waving from behind a laptop"
              width={1024}
              height={1024}
              priority
              referrerPolicy="no-referrer"
            />
            <span className="art-sticker">
              <Sparkles size={19} />
              <span>
                Made for <em>you.</em>
              </span>
            </span>
            <div className="art-caption">
              <span className="caption-line" /> YOUR NEXT CHAPTER STARTS HERE
            </div>
          </div>
        </section>

        {/* PROMISE STRIP */}
        <div className="promise-strip">
          <div className="container promise-inner">
            <span>
              <Sparkles size={19} /> A little personality goes a long way
            </span>
            <span className="strip-star">✳</span>
            <span>
              <Globe2 size={19} /> Made for every screen
            </span>
            <span className="strip-star">✳</span>
            <span>
              <MousePointer2 size={19} /> Your idea, made clickable
            </span>
          </div>
        </div>

        {/* SERVICE POSSIBILITIES */}
        <section id="possibilities" className="section container">
          <div className="section-heading">
            <div>
              <div className="eyebrow">SMALL STARTS. BIG POSSIBILITIES.</div>
              <h2>What are we building?</h2>
            </div>
            <p>
              A simple hello or your next big project.
              <br />
              There’s a starting point for every idea.
            </p>
          </div>
          <div className="service-grid">
            {services.map(({ type, icon: Icon, title, name, description, color, tag }) => (
              <Link href={`/start?type=${type}`} className={`service-card card-${color}`} key={type}>
                <div className="service-top">
                  <Icon size={29} strokeWidth={1.65} />
                  <span>{tag}</span>
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
                <div className="service-bottom">
                  <span>{name}</span>
                  <span className="circle-arrow">
                    <ArrowUpRight size={22} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <p className="under-note">
            Not sure where you fit?{" "}
            <Link href="/start?type=unsure">
              Let’s figure it out together <ArrowRight size={16} />
            </Link>
          </p>
        </section>

        {/* PORTFOLIO & CONCEPT DEMOS */}
        <PortfolioSection />

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="process-section">
          <div className="container process-layout">
            <div className="process-intro">
              <div className="eyebrow">NO MYSTERY. JUST A LITTLE MAGIC.</div>
              <h2>
                Your website.
                <br />
                Without the
                <br />
                <span className="underline-text">headache.</span>
              </h2>
              <p>You don’t need to know how websites work. That’s our part.</p>
              <Link href="/start" className="text-link">
                Tell us about your idea <ArrowUpRight size={19} />
              </Link>
            </div>
            <div className="process-steps">
              {[
                {
                  n: "01",
                  title: "You dream it.",
                  text: "Pick a starting point, choose a style, and tell us what your website needs to do using our 5-step planner.",
                },
                {
                  n: "02",
                  title: "We agree on scope & price.",
                  text: "We review your requirements and schedule a conversation to agree on scope, price, and timeline before any work begins.",
                },
                {
                  n: "03",
                  title: "Your idea goes live.",
                  text: "We design and build your website, refine it with your feedback, and get it safely launched for the world to see.",
                },
              ].map((s) => (
                <div className="process-step" key={s.n}>
                  <span className="step-number">{s.n}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section id="questions" className="section container faq-layout">
          <div>
            <div className="eyebrow">GLAD YOU ASKED.</div>
            <h2>
              A few good
              <br />
              questions.
            </h2>
            <p className="faq-intro">Less guesswork. More clarity.</p>
            <Ghost className="faq-ghost" size={72} strokeWidth={1.3} />
          </div>
          <HomeFaq />
        </section>

        {/* DIRECT STUDIO CONTACT SECTION */}
        <ContactSection />

        {/* CLOSING SECTION */}
        <section className="closing-section container">
          <div>
            <span className="eyebrow">GOT THAT “WHAT IF” FEELING?</span>
            <h2>
              Let’s make something
              <br />
              <span>worth clicking.</span>
            </h2>
          </div>
          <div className="closing-action">
            <Link href="/start" className="button button-dark">
              Bring your idea to life <ArrowUpRight size={22} />
            </Link>
            <p>Big, small, or still a little blurry. We’re in.</p>
          </div>
          <Sparkles className="closing-spark" size={62} strokeWidth={1.3} />
        </section>
      </main>

      {/* FOOTER */}
      <footer className="site-footer container">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
          <Link href="/" className="brand">
            <Ghost size={28} />
            <span>
              ghost<span className="brand-light">studio</span>
            </span>
          </Link>
          <div className="text-xs text-neutral-600">
            Direct email: <a href="mailto:p8339378@gmail.com" className="font-semibold underline hover:text-neutral-900">p8339378@gmail.com</a>
          </div>
          <div className="flex items-center gap-4 text-xs text-neutral-500">
            <Link href="/privacy" className="hover:underline">Privacy Notice</Link>
            <Link href="/admin" className="hover:underline">Admin</Link>
            <span>© {new Date().getFullYear()} Ghost Studio</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
