"use client";

import { useEffect, useState } from "react";

const links = [
  { href: "#collection", label: "Collection" },
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#testimonials", label: "Testimonials" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  useEffect(() => {
    const sections = links.map(({ href }) => document.querySelector(href)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setCurrent(`#${visible.target.id}`);
    }, { rootMargin: "-20% 0px -65% 0px" });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  return (
    <header className="nav">
      <div className="container nav__inner">
        <a href="#top" className="logo">KIIN <span>Clothline</span></a>
        <button className="nav__toggle" aria-controls="primary-navigation" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
          <span /><span />
        </button>
        <nav id="primary-navigation" className={`nav__links${open ? " open" : ""}`} onClick={() => setOpen(false)}>
          {links.map((l) => (
            <a key={l.href} href={l.href} className={current === l.href ? "current" : undefined} aria-current={current === l.href ? "location" : undefined}>{l.label}</a>
          ))}
          <a href="#booking" className="btn btn--small">Book a Fitting</a>
        </nav>
      </div>
    </header>
  );
}
