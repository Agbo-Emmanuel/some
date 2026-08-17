import React from "react";
import { HiSparkles } from "react-icons/hi2";
import { FiTwitter, FiLinkedin, FiInstagram } from "react-icons/fi";

const navLinks = ["Product", "How It Works", "Features", "About"];

const socials = [
  { icon: FiTwitter, label: "Twitter" },
  { icon: FiLinkedin, label: "LinkedIn" },
  { icon: FiInstagram, label: "Instagram" },
];

const Footer = () => {
  return (
    <footer className="w-full bg-white px-4 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl border-t border-slate-100">
        <div className="flex flex-col gap-10 py-12 lg:flex-row lg:items-start lg:justify-between">
          {/* brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <HiSparkles className="h-5 w-5 text-slate-900" />
              <span className="text-lg font-bold text-slate-900">Ahiia.Ai</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              AI-powered business documents for modern businesses.
            </p>
          </div>

          {/* nav links */}
          <nav className="flex flex-wrap gap-x-8 gap-y-3 lg:pt-2">
            {navLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm text-slate-600 transition-colors duration-200 hover:text-slate-900"
              >
                {link}
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
