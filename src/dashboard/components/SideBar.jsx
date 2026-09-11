import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  FilePlus2,
  BarChart3,
  Building2,
  Sparkles,
  Settings,
  Headphones,
  X,
} from "lucide-react";
import logo from "../../assets/ahiia_icon.svg";

export const DEFAULT_USER_NAV_ITEMS = [
  {
    name: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: "Documents",
    to: "/dashboard/documents",
    icon: FileText,
  },
  {
    name: "Create Document",
    to: "/dashboard/create-document",
    icon: FilePlus2,
  },
  {
    name: "Analytics",
    to: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    name: "Company Profile",
    to: "/dashboard/company-profile",
    icon: Building2,
  },
  {
    name: "Brand Kit",
    to: "/dashboard/brand-kit",
    icon: Sparkles,
  },
];

export const DEFAULT_USER_BOTTOM_NAV_ITEMS = [
  {
    name: "Settings",
    to: "/dashboard/settings",
    icon: Settings,
  },
  {
    name: "Help & Support",
    to: "/dashboard/help",
    icon: Headphones,
  },
];

const SideBar = ({
  navItems = DEFAULT_USER_NAV_ITEMS,
  bottomNavItems = DEFAULT_USER_BOTTOM_NAV_ITEMS,
  profile = {
    name: "Chidi Okafor",
    company: "SolarTech Nigeria",
    initials: "CO",
  },
  isOpen = false,
  onClose = () => {},
}) => {
  const location = useLocation();

  const isLinkActive = (item) => {
    if (item.exact || item.to === "/dashboard") {
      return (
        location.pathname === "/dashboard" ||
        location.pathname === "/dashboard/" ||
        location.pathname === "/dashboard/overview"
      );
    }
    return location.pathname.startsWith(item.to);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-slate-100 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Top brand header */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="h-20 px-6 flex items-center justify-between border-b border-slate-50">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 group transition-transform hover:scale-[1.01]"
              onClick={onClose}
            >
              <div className="w-10 h-10 rounded-xl bg-[#0F1738] flex items-center justify-center p-1.5 shadow-xs">
                <img src={logo} alt="AHIIA.Ai" className="w-6 h-6 object-contain" />
              </div>
              <span className="text-xl font-black tracking-tight text-[#0F1738]">
                AHIIA.Ai
              </span>
            </Link>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav links section */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200">
            {navItems.map((item) => {
              const active = isLinkActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.to}
                  onClick={onClose}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "bg-[#131B4D] text-white shadow-md shadow-[#131B4D]/15"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-colors ${
                      active ? "text-white" : "text-slate-500"
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Bottom Nav section */}
          <div className="px-4 py-3 border-t border-slate-100 space-y-1">
            {bottomNavItems.map((item) => {
              const active = location.pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.to}
                  onClick={onClose}
                  className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    active
                      ? "bg-[#131B4D] text-white shadow-md shadow-[#131B4D]/15"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      active ? "text-white" : "text-slate-500"
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* User profile footer card */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <Link
            to="/dashboard/company-profile"
            onClick={onClose}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-[#0E1538] text-white flex items-center justify-center font-bold text-xs tracking-wider shrink-0 shadow-xs group-hover:ring-2 group-hover:ring-indigo-500/20 transition-all">
              {profile.initials || "CO"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-950 transition-colors">
                {profile.name || "Chidi Okafor"}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {profile.company || "SolarTech Nigeria"}
              </p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default SideBar;
