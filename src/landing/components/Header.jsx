import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { scrollToSection } from "../../utils/scrollToSection";
import { useScrollSpy } from "../../hooks/useScrollSpy";

// `id` must match the id on the corresponding section wrapper in Home.jsx.
// This same array shape can be reused for the footer nav.
export const NAV_LINKS = [
  { label: "Product", id: "product" },
  { label: "How It Works", id: "how-it-works" },
  { label: "Features", id: "features" },
  { label: "About", id: "about" },
];

const Logo = () => (
  <a href="#" className="flex items-center gap-2 shrink-0">
    <svg
      width="26"
      height="26"
      viewBox="0 0 28 28"
      fill="none"
      className="shrink-0"
    >
      <circle cx="7" cy="7" r="2.4" fill="#A5B4FC" />
      <circle cx="14" cy="7" r="2.4" fill="#818CF8" />
      <circle cx="21" cy="7" r="2.4" fill="#6366F1" />
      <circle cx="7" cy="14" r="2.4" fill="#818CF8" />
      <circle cx="14" cy="14" r="2.4" fill="#A5B4FC" />
      <circle cx="21" cy="14" r="2.4" fill="#818CF8" />
      <circle cx="7" cy="21" r="2.4" fill="#6366F1" />
      <circle cx="14" cy="21" r="2.4" fill="#818CF8" />
    </svg>
    <span className="text-white font-semibold text-lg tracking-tight">
      Ahiia.Ai
    </span>
  </a>
);

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Which section is currently in view drives the default active state...
  const spyActiveId = useScrollSpy(NAV_LINKS.map((l) => l.id));
  // ...but a click sets it immediately, so the highlight doesn't lag
  // behind while the smooth scroll animation is still in flight.
  const [clickedId, setClickedId] = useState(null);
  const activeId = clickedId ?? spyActiveId;

  // Solidify the header once the page scrolls, keep it transparent at the very top
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Once the user clicks a link, stop forcing that id and hand control
  // back to the scroll spy after the scroll animation has settled.
  useEffect(() => {
    if (clickedId === null) return;
    const timer = setTimeout(() => setClickedId(null), 900);
    return () => clearTimeout(timer);
  }, [clickedId]);

  const handleNavClick = (id) => (e) => {
    e.preventDefault();
    setClickedId(id);
    scrollToSection(id);
    setMobileOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-[#0B0B24]/80 backdrop-blur-md border-b border-white/10"
          : "bg-[#07071c] border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-[72px] items-center justify-between">
          <Logo />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-1.5 py-1.5">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={`#${link.id}`}
                onClick={handleNavClick(link.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                  activeId === link.id
                    ? "bg-white/10 text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/signup"
              className="px-4 py-2 text-sm font-medium text-white rounded-full border border-white/15 hover:bg-white/5 transition-colors duration-200"
            >
              Get Started
            </a>
            <a
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-white rounded-full bg-indigo-500 hover:bg-indigo-400 transition-colors duration-200"
            >
              Log In
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="md:hidden text-white p-2 -mr-2"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-6 pt-2 flex flex-col gap-1 bg-[#0B0B24]/95 backdrop-blur-md border-b border-white/10">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={`#${link.id}`}
              onClick={handleNavClick(link.id)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                activeId === link.id
                  ? "bg-white/10 text-white"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 mt-3">
            <a
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-2.5 text-center text-sm font-medium text-white rounded-full border border-white/15"
            >
              Get Started
            </a>
            <a
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-2.5 text-center text-sm font-semibold text-white rounded-full bg-indigo-500"
            >
              Log In
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
