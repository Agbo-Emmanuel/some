import React from "react";
import { HiSparkles } from "react-icons/hi2";
import { FiTwitter, FiLinkedin, FiInstagram } from "react-icons/fi";
import { NAV_LINKS } from "./Header";
import { scrollToSection } from "../../utils/scrollToSection";
import logo from "../../assets/ahiia_icon.svg";
import { FaXTwitter } from "react-icons/fa6";

const socials = [
  { icon: FaXTwitter, label: "Twitter" },
  { icon: FiLinkedin, label: "LinkedIn" },
  { icon: FiInstagram, label: "Instagram" },
];

const Footer = () => {
  const handleNavClick = (id) => (e) => {
    e.preventDefault();
    scrollToSection(id);
  };

  return (
    <footer className="w-full bg-white px-4 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl border-t border-slate-100">
        <div className="flex flex-col gap-10 py-12 lg:flex-row lg:items-start lg:justify-between">
          {/* brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Logo" className="h-6 w-6" />
              <span className="text-lg font-bold text-slate-900">Ahiia.Ai</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              AI-powered business documents for modern businesses.
            </p>
          </div>

          {/* nav links */}
          <nav className="flex flex-wrap gap-x-8 gap-y-3 lg:pt-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={handleNavClick(link.id)}
                className="text-sm text-slate-600 transition-colors duration-200 hover:text-slate-900"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* socials */}
          <div className="flex items-center gap-3">
            {socials.map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* bottom bar */}
        <div className="flex flex-col gap-2 border-t border-slate-100 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Ahiia.Ai. All rights reserved.</p>
          <p>Built for modern businesses.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
