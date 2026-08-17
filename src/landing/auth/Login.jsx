import React, { useState } from "react";
import {
  HiSparkles,
  HiCheck,
  HiShieldCheck,
  HiArrowLeft,
} from "react-icons/hi2";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";
import { FcGoogle } from "react-icons/fc";

const perks = [
  "Access your business knowledge",
  "Continue working on your documents",
  "Keep your business outputs consistent",
];

const Login = () => {
  const [tab, setTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, password });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0A0F2C] via-[#141B4D] to-[#1E2A78] px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto flex max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl lg:h-[780px] lg:flex-row">
        {/* left panel */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-[#0A0F2C] p-8 sm:p-10 lg:w-[42%]">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/5" />
          <div className="pointer-events-none absolute right-10 top-40 h-40 w-40 rotate-12 border border-white/5" />
          <div className="pointer-events-none absolute -bottom-10 left-0 h-52 w-52 rotate-45 border border-white/5" />

          <div className="relative">
            <div className="flex items-center gap-2">
              <HiSparkles className="h-5 w-5 text-indigo-300" />
              <span className="text-lg font-bold text-white">Ahiia.Ai</span>
            </div>
          </div>

          <div className="relative mt-16 lg:mt-0">
            <div className="mb-6 h-px w-16 bg-white/15" />
            <h1 className="text-2xl font-bold leading-snug text-indigo-200 sm:text-3xl">
              Pick up where you left off.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Your business knowledge, documents, and work are ready when you
              are. Sign in to continue building.
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
              OUR WORKSPACE IS READY WHEN YOU ARE
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
              <HiShieldCheck className="h-3.5 w-3.5" />
              Private workspace · Your business data stays within your workspace
            </div>
          </div>
        </div>

        {/* right panel */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-10 lg:p-12">
          <div className="mx-auto flex max-w-md flex-col">
            <div className="flex justify-end">
              <a
                href="#"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors duration-200 hover:text-slate-800"
              >
                <HiArrowLeft className="h-3.5 w-3.5" />
                Back to site
              </a>
            </div>

            {/* tabs */}
            <div className="mt-6 grid grid-cols-2 rounded-full bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setTab("create")}
                className={`rounded-full py-2.5 text-sm font-semibold transition-all duration-200 ${
                  tab === "create"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-400"
                }`}
              >
                Create account
              </button>
              <button
                type="button"
                onClick={() => setTab("signin")}
                className={`rounded-full py-2.5 text-sm font-semibold transition-all duration-200 ${
                  tab === "signin"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-400"
                }`}
              >
                Sign in
              </button>
            </div>

            <h2 className="mt-8 text-2xl font-bold text-slate-900">Sign in</h2>
            <p className="mt-1 text-sm text-slate-500">
              Pick up where you left off.
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

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-800">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-xs font-semibold text-indigo-600 transition-colors duration-200 hover:text-indigo-700"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-10 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-shadow duration-200 focus:ring-2 focus:ring-indigo-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <HiOutlineEyeSlash className="h-4 w-4" />
                    ) : (
                      <HiOutlineEye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#141B4D] py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#1E2A78] active:scale-[0.99]"
              >
                Sign in
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-xs text-slate-400">Or with</span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3.5 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-50"
            >
              <FcGoogle className="h-4 w-4" />
              Continue with Google
            </button>

            <p className="mt-6 text-center text-sm text-slate-500">
              New to Ahiia.Ai?{" "}
              <button
                type="button"
                onClick={() => setTab("create")}
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Create account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
