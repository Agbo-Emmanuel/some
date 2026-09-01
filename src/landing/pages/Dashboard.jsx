import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import logo from "../../assets/ahiia_icon.svg";

const Dashboard = () => {
  const navigate = useNavigate();
  const [, , removeCookie] = useCookies(["accessToken", "refreshToken"]);

  const handleLogout = () => {
    removeCookie("accessToken", { path: "/" });
    removeCookie("refreshToken", { path: "/" });
    navigate("/login");
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, #070A1E 0%, #0E1538 50%, #18235C 100%)" }}
    >
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-10 text-center">
        <div
          className="flex items-center justify-center gap-2.5 cursor-pointer mb-8"
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="AHIIA.AI" className="h-8 w-8" />
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">AHIIA.AI</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Welcome to your workspace</h1>
        <p className="mt-3 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Your business profile is set up and ready. Start creating proposals, contracts, and business plans.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: "📄", title: "New Proposal", desc: "Create a business proposal" },
            { icon: "📋", title: "New Contract", desc: "Draft a business contract" },
            { icon: "📊", title: "Business Plan", desc: "Write a business plan" },
          ].map((card) => (
            <div
              key={card.title}
              className="flex flex-col items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:border-indigo-200 hover:bg-indigo-50/30 cursor-pointer transition-all"
            >
              <span className="text-3xl">{card.icon}</span>
              <p className="text-sm font-bold text-slate-900">{card.title}</p>
              <p className="text-xs text-slate-400">{card.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/onboarding")}
            className="px-6 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Update business profile
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="px-6 py-3 rounded-xl bg-[#141B4D] hover:bg-[#1E2A78] text-white text-sm font-bold shadow transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
