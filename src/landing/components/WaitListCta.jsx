import React, { useState } from "react";
import { HiArrowRight } from "react-icons/hi";

const WaitlistCta = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // wire this up to your waitlist endpoint
    console.log("waitlist signup:", email);
  };

  return (
    <section className="w-full bg-[#F7F8FB] px-4 py-16 sm:px-8 sm:py-20 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl bg-[#0A0A1A] px-6 py-16 sm:px-12 sm:py-20">
          {/* ambient glows */}
          <div className="pointer-events-none absolute -left-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-indigo-600/40 blur-[100px]" />
          <div className="pointer-events-none absolute -right-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-indigo-600/40 blur-[100px]" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-full w-1/2 -translate-x-1/2 bg-indigo-900/20 blur-3xl" />

          <div className="relative flex flex-col items-center text-center">
            <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
              Your Next Business Document Starts Here.
            </h2>

            <p className="mt-5 max-w-xl text-sm text-indigo-100/70 sm:text-base">
              Join the Ahiia.Ai waitlist and be among the first to experience a
              smarter way to create business documents.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full flex-1 rounded-lg border border-white/10 bg-white px-5 py-3.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-shadow duration-200 focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="submit"
                className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-500 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-indigo-400 active:scale-[0.98]"
              >
                Get Started
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 transition-transform duration-200 group-hover:translate-x-0.5">
                  <HiArrowRight className="h-3 w-3" />
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaitlistCta;
