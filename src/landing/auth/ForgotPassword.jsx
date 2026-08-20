import React, { useState } from "react";
import {
  HiSparkles,
  HiCheck,
  HiShieldCheck,
  HiArrowLeft,
} from "react-icons/hi2";
import { HiOutlineKey, HiOutlineMail, HiOutlineRefresh } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/ahiia_icon.svg";

const perks = [
  "Securely reset your password",
  "Keep your existing business information",
  "Get back to your workspace quickly",
];

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("send reset link to:", email);
    setSent(true);
  };

  const handleResend = () => {
    console.log("resend reset link to:", email);
  };

  const handleUseDifferentEmail = () => {
    setSent(false);
    setEmail("");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0A0F2C] via-[#141B4D] to-[#1E2A78] px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto flex max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl lg:h-[720px] lg:flex-row">
        {/* left panel */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-[#0A0F2C] p-8 sm:p-10 lg:w-[45%]">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/5" />
          <div className="pointer-events-none absolute right-10 top-40 h-40 w-40 rotate-12 border border-white/5" />
          <div className="pointer-events-none absolute -bottom-10 left-0 h-52 w-52 rotate-45 border border-white/5" />

          <div
            className="relative cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="flex items-center gap-2">
              <img src={logo} alt="Logo" className="h-6 w-6" />
              <span className="text-lg font-bold text-white">Ahiia.AI</span>
            </div>
          </div>

          <div className="relative mt-16 lg:mt-0">
            <div className="mb-6 h-px w-16 bg-white/15" />
            <h1 className="text-2xl font-bold leading-snug text-indigo-200 sm:text-3xl">
              Let's get you back to building.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Reset your password and get back to your business workspace,
              documents, and everything you've already built.
            </p>

            <ul className="mt-6 space-y-3">
              {perks.map((perk) => (
                <li key={perk} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-400/20 text-indigo-200">
                    <HiCheck className="h-2.5 w-2.5" />
                  </span>
                  <span className="text-sm text-slate-200">{perk}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mt-16 lg:mt-0">
            <div className="mb-4 h-px w-full bg-white/10" />
            <p className="text-xs font-semibold tracking-widest text-slate-300">
              YOUR WORK IS STILL RIGHT WHERE YOU LEFT IT.
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
              <HiShieldCheck className="h-3.5 w-3.5" />
              Private workspace · Your business data stays within your workspace
            </div>
          </div>
        </div>

        {/* right panel */}
        <div className="flex flex-1 overflow-y-auto p-8 sm:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-md">
            {/* <div className="flex justify-end">
              <a
                href="#"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors duration-200 hover:text-slate-800"
              >
                <HiArrowLeft className="h-3.5 w-3.5" />
                Back to site
              </a>
            </div> */}

            {/* request-link state */}
            <div
              className={`grid transition-all duration-300 ease-out ${
                sent
                  ? "grid-rows-[0fr] opacity-0"
                  : "grid-rows-[1fr] opacity-100"
              }`}
            >
              <div className="overflow-hidden">
                <div className="mt-6 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-indigo-600">
                  <HiOutlineKey className="h-5 w-5" />
                </div>

                <h2 className="mt-5 text-2xl font-bold text-slate-900">
                  Reset your password
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                  Enter the email on your account and we will send a secure link
                  to set a new password. Your business knowledge and documents
                  stay exactly as they are.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-800">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-shadow duration-200 focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#141B4D] py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#1E2A78] active:scale-[0.99]"
                  >
                    Send reset link
                  </button>
                </form>

                <p className="mt-4 text-center text-sm text-slate-500">
                  Remembered it?{" "}
                  <a
                    href="/login"
                    className="font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Back to sign in
                  </a>
                </p>
              </div>
            </div>

            {/* check-your-email state */}
            <div
              className={`grid transition-all duration-300 ease-out ${
                sent
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="mt-6 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-indigo-600">
                  <HiOutlineMail className="h-5 w-5" />
                </div>

                <h2 className="mt-5 text-2xl font-bold text-slate-900">
                  Check your email
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                  We sent a password reset link to{" "}
                  <span className="font-semibold text-slate-800">{email}</span>.
                  It stays valid for 30 minutes and can only be used once.
                </p>

                <div className="mt-6 rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">
                      Nothing in your inbox?
                    </p>
                    <button
                      type="button"
                      onClick={handleResend}
                      className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-indigo-600 transition-colors duration-200 hover:text-indigo-700"
                    >
                      <HiOutlineRefresh className="h-3.5 w-3.5" />
                      Resend link
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Check spam and any shared inbox filters before resending.
                  </p>
                </div>

                {/* <button
                  type="button"
                  className="mt-6 w-full rounded-xl bg-[#141B4D] py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#1E2A78] active:scale-[0.99]"
                >
                  Sign in
                </button> */}

                <p className="mt-4 text-center text-sm text-slate-500">
                  Wrong address?{" "}
                  <button
                    type="button"
                    onClick={handleUseDifferentEmail}
                    className="font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Use a different email
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
