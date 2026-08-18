import React, { useMemo, useState } from "react";
import {
  HiSparkles,
  HiCheck,
  HiShieldCheck,
  HiArrowLeft,
  HiOutlineEyeSlash,
} from "react-icons/hi2";
import { HiOutlineLockClosed, HiOutlineEye, HiX } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

const perks = [
  "Keep your business knowledge in one place",
  "Create documents using your business context",
  "Apply your brand and business rules consistently",
];

const changes = [
  "Password replaced just now",
  "Other signed-in sessions were ended",
  "The reset link is no longer usable",
];

const ResetPassword = () => {
  const email = "Useremail@gmail.com";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [updated, setUpdated] = useState(false);

  const requirements = useMemo(() => {
    const hasLength = password.length >= 8;
    const hasCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
    const hasNumberOrSymbol =
      /[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password);
    return [
      { label: "At least 8 characters", met: hasLength },
      { label: "Upper and lower case letters", met: hasCase },
      { label: "A number or symbol", met: hasNumberOrSymbol },
    ];
  }, [password]);

  const metCount = requirements.filter((r) => r.met).length;
  const passwordsMatch =
    confirmPassword.length > 0 && confirmPassword === password;
  const canSubmit = metCount === requirements.length && passwordsMatch;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    console.log("resetting password for:", email);
    // simulate the reset-password API call succeeding
    setUpdated(true);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0A0F2C] via-[#141B4D] to-[#1E2A78] px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto flex max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl lg:h-[720px] lg:flex-row">
        {/* left panel */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-[#0A0F2C] p-8 sm:p-10 lg:w-[45%]">
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
              Set a new password and keep building
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Create a new password to securely return to your Ahiia.Ai
              workspace.
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
        <div className="flex flex-1 items-center overflow-y-auto p-8 sm:p-10 lg:p-12">
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

            {/* set-new-password state */}
            <div
              className={`grid transition-all duration-300 ease-out ${
                updated
                  ? "grid-rows-[0fr] opacity-0"
                  : "grid-rows-[1fr] opacity-100"
              }`}
            >
              <div className="overflow-hidden">
                <div className="mt-6 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-indigo-600">
                  <HiOutlineLockClosed className="h-5 w-5" />
                </div>

                <h2 className="mt-5 text-2xl font-bold text-slate-900">
                  Set a new password
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Set a new password
                </p>
                <p className="text-sm font-semibold text-indigo-600">{email}</p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  {/* new password */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-800">
                      New password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your new password"
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

                    {/* strength bar */}
                    <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                      {requirements.map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 rounded-full transition-colors duration-300 ${
                            i < metCount
                              ? metCount === 3
                                ? "bg-emerald-400"
                                : metCount === 2
                                  ? "bg-amber-400"
                                  : "bg-rose-400"
                              : "bg-slate-100"
                          }`}
                        />
                      ))}
                    </div>

                    {/* requirements checklist */}
                    <ul className="mt-3 space-y-1.5">
                      {requirements.map((req) => (
                        <li
                          key={req.label}
                          className="flex items-center gap-1.5 text-xs"
                        >
                          <span
                            className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${
                              req.met
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {req.met ? (
                              <HiCheck className="h-2 w-2" strokeWidth={1} />
                            ) : (
                              <HiX className="h-2 w-2" strokeWidth={1} />
                            )}
                          </span>
                          <span
                            className={
                              req.met ? "text-slate-600" : "text-slate-400"
                            }
                          >
                            {req.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* confirm password */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-800">
                      Confirm new password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat your new password"
                        className={`w-full rounded-xl border px-4 py-3 pr-10 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-shadow duration-200 focus:ring-2 ${
                          confirmPassword.length > 0 && !passwordsMatch
                            ? "border-rose-300 focus:ring-rose-300"
                            : "border-slate-200 focus:ring-indigo-400"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        aria-label={
                          showConfirm ? "Hide password" : "Show password"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 hover:text-slate-600"
                      >
                        {showConfirm ? (
                          <HiOutlineEyeSlash className="h-4 w-4" />
                        ) : (
                          <HiOutlineEye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {confirmPassword.length > 0 && !passwordsMatch && (
                      <p className="mt-1.5 text-xs text-rose-500">
                        Passwords do not match.
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="w-full rounded-xl bg-[#141B4D] py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#1E2A78] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#141B4D]"
                  >
                    Reset password
                  </button>
                </form>

                <p className="mt-4 text-center text-sm text-slate-500">
                  Link expired?{" "}
                  <a
                    href="#"
                    className="font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Request a new one
                  </a>
                </p>
              </div>
            </div>

            {/* password-updated state */}
            <div
              className={`grid transition-all duration-300 ease-out ${
                updated
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="mt-6 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <HiShieldCheck className="h-5 w-5" />
                </div>

                <h2 className="mt-5 text-2xl font-bold text-slate-900">
                  Password updated
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                  Your new password is active. Sign in to return to your
                  workspace your business profile, brand information and
                  documents are unchanged.
                </p>

                <div className="mt-6 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">
                    What changed
                  </p>
                  <ul className="mt-2.5 space-y-2">
                    {changes.map((change) => (
                      <li
                        key={change}
                        className="flex items-center gap-2 text-sm text-slate-700"
                      >
                        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                          <HiCheck className="h-2 w-2" strokeWidth={1} />
                        </span>
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="mt-6 w-full rounded-xl bg-[#141B4D] py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#1E2A78] active:scale-[0.99]"
                >
                  Sign in
                </button>

                <p className="mt-4 text-center text-sm text-slate-500">
                  Did not request this?{" "}
                  <a
                    href="#"
                    className="font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Contact support
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
