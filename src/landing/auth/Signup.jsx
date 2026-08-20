import { useState } from "react";
import { HiOutlineEye, HiOutlineEyeSlash, HiArrowLeft } from "react-icons/hi2";
import { HiSparkles, HiCheck } from "react-icons/hi2";
import { HiShieldCheck } from "react-icons/hi2";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { register } from "../../services/auth.service";
import { toast } from "react-toastify";
import logo from "../../assets/ahiia_icon.svg";

const perks = [
  "Keep your business knowledge in one place",
  "Create documents using your business context",
  "Apply your brand and business rules consistently",
];

const PasswordInput = ({ label, hint, placeholder, value, onChange }) => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-800">
        {label}
      </label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          required
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-10 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-shadow duration-200 focus:ring-2 focus:ring-indigo-400"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 hover:text-slate-600"
        >
          {visible ? (
            <HiOutlineEyeSlash className="h-4 w-4" />
          ) : (
            <HiOutlineEye className="h-4 w-4" />
          )}
        </button>
      </div>
      {hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
    </div>
  );
};

const Signup = () => {
  const navigate = useNavigate();
  // const [tab, setTab] = useState("create");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (password !== repeatPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }
    if (!accepted) {
      toast.error("Please accept the terms and conditions");
      setLoading(false);
      return;
    }
    const payload = {
      email: email,
      password: password,
      acceptedTerms: accepted,
    };
    try {
      const response = await register(payload);
      console.log(response);
      navigate("/otp", { state: { email: email } });
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0A0F2C] via-[#141B4D] to-[#1E2A78] px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto flex max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl lg:h-[780px] lg:flex-row">
        {/* left panel */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-[#0A0F2C] p-8 sm:p-10 lg:w-[42%]">
          {/* decorative shapes */}
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

            {/* tabs */}
            {/* <div className="mt-6 grid grid-cols-2 rounded-full bg-slate-100 p-1">
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
            </div> */}

            <h2 className="mt-8 text-2xl font-bold text-slate-900">Sign up</h2>
            <p className="mt-1 text-sm text-slate-500">
              Set up your business profile in a few minutes.
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

              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                hint="8 or more characters, mixing letters, numbers and symbols."
              />

              <PasswordInput
                label="Repeat password"
                placeholder="Repeat your password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
              />

              <label className="flex items-start gap-2 text-xs text-slate-500">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
                />
                <span>
                  I accept the terms and understand my business data stays
                  within my workspace.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer rounded-xl bg-[#141B4D] py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#1E2A78] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account..." : "Create my account"}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-xs text-slate-400">Or with</span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <button
              type="button"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 py-3.5 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-50"
            >
              <FcGoogle className="h-4 w-4" />
              Continue with Google
            </button>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="cursor-pointer font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
