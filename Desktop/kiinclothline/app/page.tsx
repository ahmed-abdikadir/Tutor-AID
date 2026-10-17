import Image from "next/image";
import type { Metadata } from "next";
import Nav from "@/app/components/Nav";
import Gallery from "@/app/components/Gallery";
import BookingForm from "@/app/components/BookingForm";
import Testimonials from "@/app/components/Testimonials";
import GoogleReviews from "@/app/components/GoogleReviews";
import { site, suits } from "@/app/lib/site";

export const metadata: Metadata = {
  title: "Bespoke Tailoring & Made-to-Measure Suits in Eastleigh, Nairobi",
  description: "Discover exceptional bespoke tailoring at Kiin Clothline in Eastleigh, Nairobi. We create custom-made suits for weddings, business, and special occasions. Book your fitting today.",
  keywords: ["bespoke suits Nairobi", "custom suits Eastleigh", "made to measure Kenya", "wedding suits Nairobi", "business suits", "formal wear Nairobi", "tailor Eastleigh", "custom fitted suits", "Nairobi tailoring services"],
  openGraph: {
    title: "Bespoke Tailoring & Made-to-Measure Suits in Eastleigh, Nairobi",
    description: "Discover exceptional bespoke tailoring at Kiin Clothline in Eastleigh, Nairobi. We create custom-made suits for weddings, business, and special occasions.",
    url: "https://kiinclothline.com",
    images: [
      {
        url: "/suits/navy-pinstripe-double-breasted.jpg",
        width: 1200,
        height: 630,
        alt: "Kiin Clothline bespoke navy pinstripe suit"
      }
    ]
  },
  twitter: {
    title: "Bespoke Tailoring & Made-to-Measure Suits in Eastleigh, Nairobi",
    description: "Discover exceptional bespoke tailoring at Kiin Clothline in Eastleigh, Nairobi. We create custom-made suits for weddings, business, and special occasions.",
    images: ["/suits/navy-pinstripe-double-breasted.jpg"]
  }
};

const services = [
  { title: "Bespoke Fit", text: "Made around your measurements, posture and the way you move." },
  { title: "Considered Cloth", text: "A considered selection of fabrics, colours and finishes for every occasion." },
  { title: "Personal Styling", text: "A thoughtful fitting experience, from the first conversation to the final detail." },
];

const steps = [
  { title: "Book", text: "Tell us what you have in mind and choose a preferred fitting time." },
  { title: "Consult & Measure", text: "Visit our Eastleigh shop, choose your fabric and get fully measured." },
  { title: "Fitting", text: "Try the suit on while it is being made so we can get every detail right." },
  { title: "Collect", text: "Pick up your finished suit, pressed and ready to wear." },
];

export default function Home() {
  return (
    <>
      <Nav />
      <main id="top">
        <section className="hero">
          <div className="container hero__grid">
            <div className="hero__content">
              <p className="eyebrow">Bespoke Tailoring &middot; Eastleigh, Nairobi</p>
              <h1>Tailored for<br />your presence.</h1>
              <p className="hero__lead">
                Exceptional tailoring, made personal in Eastleigh, Nairobi.
              </p>
              <div className="hero__actions">
                <a href="#booking" className="btn">Book a Fitting</a>
                <a href="#collection" className="btn btn--ghost">Explore Collection <span aria-hidden="true">↗</span></a>
              </div>
            </div>
            <div className="hero__images">
              <div className="hero__img hero__img--main">
                <Image src="/suits/navy-pinstripe-double-breasted.jpg" alt="Navy pinstripe double-breasted suit by Kiin Clothline" fill preload sizes="(max-width: 900px) 60vw, 30vw" />
              </div>
              <div className="hero__img hero__img--side">
                <Image src="/suits/embroidered-groom-suit.jpg" alt="Embroidered ivory groom suit" fill loading="eager" sizes="(max-width: 900px) 40vw, 20vw" />
              </div>
            </div>
          </div>
        </section>

        <section className="section about" id="about">
          <div className="container about__grid">
            <div className="about__images">
              <div className="about__img"><Image src="/suits/cream-double-breasted.jpg" alt="Cream double-breasted suit in the Kiin Clothline studio" fill sizes="(max-width: 900px) 50vw, 25vw" /></div>
              <div className="about__img about__img--offset"><Image src="/suits/grey-check-details.jpg" alt="Shirt, tie and suit fabric details" fill sizes="(max-width: 900px) 50vw, 25vw" /></div>
            </div>
            <div>
              <p className="eyebrow">Our Story</p>
              <h2>Tailored in the heart of Eastleigh</h2>
              <p>
                Kiin Clothline started with one belief: a suit should be made for the person wearing it. Every suit begins with a conversation in our Eastleigh workshop. We talk about your occasion, choose the cloth together, take your measurements and then cut and sew the suit for you.
              </p>
              <ul className="stats">
                <li><strong>100%</strong><span>Made to measure</span></li>
                <li><strong>3</strong><span>Fittings per suit</span></li>
                <li><strong>Premium</strong><span>Fabrics</span></li>
              </ul>
            </div>
          </div>
        </section>

        <section className="section collection" id="collection">
          <div className="container">
            <div className="section__head">
              <p className="eyebrow">The Collection</p>
              <h2>Suits we have tailored</h2>
              <p>
                Some of the suits our clients have worn to weddings, boardrooms and celebrations. See more on{" "}
                <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="gold-link">Instagram</a>.
              </p>
            </div>
            <Gallery suits={suits} />
          </div>
        </section>

        <section className="section testimonials" id="testimonials">
          <div className="container">
            <div className="section__head">
              <p className="eyebrow">Worn by You</p>
              <h2>Stories in every stitch.</h2>
              <p>Notes from the people who wear Kiin.</p>
            </div>
            <GoogleReviews placeId={site.googlePlaceId} apiKey={site.googleApiKey} />
            <Testimonials />
          </div>
        </section>

        <section className="section services" id="services">
          <div className="container">
            <div className="section__head">
              <p className="eyebrow">The Kiin Difference</p>
              <h2>Why Kiin</h2>
            </div>
            <div className="cards">
              {services.map((s, i) => (
                <article key={s.title} className="card"><span className="card__number">0{i + 1}</span><h3>{s.title}</h3><p>{s.text}</p></article>
              ))}
            </div>
          </div>
        </section>

        <section className="section process" id="process">
          <div className="container">
            <div className="section__head">
              <p className="eyebrow">How It Works</p>
              <h2>From measurement to masterpiece</h2>
            </div>
            <ol className="steps">
              {steps.map((s, i) => (
                <li key={s.title}><span>{String(i + 1).padStart(2, "0")}</span><h3>{s.title}</h3><p>{s.text}</p></li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section booking" id="booking">
          <div className="container booking__grid">
            <div className="booking__intro">
              <p className="eyebrow">Book a Fitting</p>
              <h2>Begin with a conversation.</h2>
              <p>Tell us a little about what you are looking for. We will be in touch to find a fitting time that works for you.</p>
              <p className="muted">Your fitting and measurements take place at our Eastleigh studio.</p>
              <div className="booking__img"><Image src="/suits/brown-check-blazer.jpg" alt="Brown check blazer on a Kiin Clothline mannequin" fill sizes="(max-width: 900px) 0px, 30vw" /></div>
            </div>
            <BookingForm />
          </div>
        </section>

        <section className="section visit" id="visit">
          <div className="container visit__grid">
            <div>
              <p className="eyebrow">Visit Us</p>
              <h2>Find us in Eastleigh</h2>
              <ul className="contact">
                <li><strong>Address</strong><span>{site.location}</span></li>
                <li><strong>Hours</strong><span>Mon – Sun: 9:00am – 9:00pm<br />Walk ins also allowed</span></li>
                <li><strong>Phone / WhatsApp</strong><span><a href={`tel:${site.phone}`}>{site.phoneDisplay}</a></span></li>
                <li><strong>Instagram</strong><span><a href={site.instagram} target="_blank" rel="noopener noreferrer">{site.instagramHandle}</a></span></li>
                <li><strong>TikTok</strong><span><a href={site.tiktok} target="_blank" rel="noopener noreferrer">{site.tiktokHandle}</a></span></li>
              </ul>
              <div className="visit__actions">
                <a className="btn" href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
                <a className="btn btn--ghost" href={site.instagram} target="_blank" rel="noopener noreferrer">Follow on Instagram</a>
                <a className="btn btn--ghost" href={site.tiktok} target="_blank" rel="noopener noreferrer">Follow on TikTok</a>
              </div>
            </div>
            <div className="map">
              <iframe title="Kiin Clothline location map" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={site.mapEmbed} />
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <a href="#top" className="logo">KIIN <span>Clothline</span></a>
          <a className="footer__ig" href={site.instagram} target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
            </svg>
            {site.instagramHandle}
          </a>
          <a className="footer__ig" href={site.tiktok} target="_blank" rel="noopener noreferrer">TikTok {site.tiktokHandle}</a>
          <p>&copy; {site.name} &middot; Bespoke Tailoring &middot; {site.location}</p>
        </div>
      </footer>
      <a className="mobile-booking-cta" href="#booking">Book a fitting <span aria-hidden="true">→</span></a>
    </>
  );
}
