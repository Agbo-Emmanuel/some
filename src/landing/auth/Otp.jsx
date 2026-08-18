import React, { useRef, useState, useEffect } from "react";
import {
  HiSparkles,
  HiCheck,
  HiShieldCheck,
  HiArrowLeft,
} from "react-icons/hi2";
import { HiOutlineMail } from "react-icons/hi";
import { HiOutlineRefresh } from "react-icons/hi";

const perks = [
  "Keep your business knowledge in one place",
  "Create documents using your business context",
  "Apply your brand and business rules consistently",
];

const CODE_LENGTH = 6;
const RESEND_SECONDS = 15 * 60; // 15 minute expiry window shown to the user

const formatTime = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const Otp = () => {
  const email = "yourmail@gmail.com";
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const focusInput = (index) => {
    const el = inputsRef.current[index];
    if (el) el.focus();
  };

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    if (digit && index < CODE_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    e.preventDefault();
    const next = Array(CODE_LENGTH).fill("");
    pasted
      .slice(0, CODE_LENGTH)
      .split("")
      .forEach((char, i) => (next[i] = char));
    setCode(next);
    focusInput(Math.min(pasted.length, CODE_LENGTH) - 1);
  };

  const handleResend = () => {
    if (secondsLeft > 0) return;
    setSecondsLeft(RESEND_SECONDS);
    setCode(Array(CODE_LENGTH).fill(""));
    focusInput(0);
    console.log("resend code to", email);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    console.log("verifying code:", code.join(""));
  };

  const isComplete = code.every((d) => d !== "");

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0A0F2C] via-[#141B4D] to-[#1E2A78] px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto flex max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl lg:min-h-[720px] lg:flex-row">
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
              Build from what your business already knows.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Ahiia brings your business knowledge, model, brand, and guidelines
              together to help you create clearer, more consistent business
              documents.
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
              YOUR BUSINESS, BETTER STRUCTURED
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
            {/* <div className="flex justify-end">
              <a
                href="#"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors duration-200 hover:text-slate-800"
              >
                <HiArrowLeft className="h-3.5 w-3.5" />
                Back to site
              </a>
            </div> */}

            <div className="mt-6 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-indigo-600">
              <HiOutlineMail className="h-5 w-5" />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              Verify your email
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
              We sent a 6-digit code to{" "}
              <span className="font-semibold text-slate-800">{email}</span>.
              Enter it below to secure your workspace.
            </p>

            <form onSubmit={handleVerify} className="mt-6">
              <label className="mb-2 block text-xs font-semibold text-slate-800">
                Verification code
              </label>

              <div
                className="flex justify-between gap-2 sm:gap-3"
                onPaste={handlePaste}
              >
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputsRef.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="h-12 w-full max-w-[3rem] rounded-xl border border-slate-200 text-center text-lg font-semibold text-slate-800 outline-none transition-all duration-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400"
                  />
                ))}
              </div>

              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                The code expires in {formatTime(secondsLeft)}. Check spam if it
                has not arrived.
              </p>

              <button
                type="submit"
                disabled={!isComplete}
                className="mt-6 w-full rounded-xl bg-[#141B4D] py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#1E2A78] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#141B4D]"
              >
                Verify email
              </button>
            </form>

            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">
                  Did not get the code?
                </p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={secondsLeft > 0}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition-colors duration-200 hover:text-indigo-700 disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  <HiOutlineRefresh className="h-3.5 w-3.5" />
                  Resend code
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                We can send a fresh code once the timer runs out.
              </p>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500">
              Wrong address?{" "}
              <button
                type="button"
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Use a different email
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Otp;
