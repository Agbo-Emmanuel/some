import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  LogOut,
  User,
  Settings,
  CheckCircle2,
} from "lucide-react";
import { useCookies } from "react-cookie";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/dashboard/": "Dashboard",
  "/dashboard/overview": "Dashboard",
  "/dashboard/documents": "Documents",
  "/dashboard/create-document": "Create Document",
  "/dashboard/analytics": "Analytics",
  "/dashboard/company-profile": "Company Profile",
  "/dashboard/brand-kit": "Brand Kit",
  "/dashboard/settings": "Settings",
  "/dashboard/help": "Help & Support",
  // Admin route titles
  "/admin": "Admin Dashboard",
  "/admin/overview": "Admin Overview",
  "/admin/users": "User Management",
  "/admin/verifications": "Verifications",
  "/admin/templates": "Templates",
  "/admin/analytics": "Platform Analytics",
  "/admin/settings": "Admin Settings",
};

const DashboardHeader = ({
  titleOverride,
  onMenuToggle = () => {},
  profile = {
    name: "Chidi Okafor",
    initials: "CO",
    company: "SolarTech Nigeria",
  },
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [, , removeCookie] = useCookies(["accessToken", "refreshToken"]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Derive current title
  const currentTitle =
    titleOverride ||
    PAGE_TITLES[location.pathname] ||
    PAGE_TITLES[location.pathname.replace(/\/$/, "")] ||
    "Dashboard";

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    removeCookie("accessToken", { path: "/" });
    removeCookie("refreshToken", { path: "/" });
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 h-20 bg-[#F4F6FA]/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 border-b border-slate-200/50">
      {/* Left section: Hamburger button (mobile) + Dynamic Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 truncate">
          {currentTitle}
        </h1>
      </div>

      {/* Middle section: Search Bar */}
      <div className="flex-1 max-w-md mx-2 sm:mx-6 hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents...."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 shadow-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>
      </div>

      {/* Right section: Notifications + Profile badge */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="w-10 h-10 rounded-xl sm:rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-xs transition-colors relative"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
          </button>

          {/* Notification dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl py-3 px-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">Notifications</span>
                <span className="text-xs text-indigo-600 font-semibold cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="py-2 space-y-1 max-h-64 overflow-y-auto">
                <div className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-start gap-3 cursor-pointer">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Proposal Finalized
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Solar Installation Proposal is ready to export.
                    </p>
                    <span className="text-[10px] text-slate-400">2h ago</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-start gap-3 cursor-pointer">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Brand Kit Configured
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Brand assets applied to new templates.
                    </p>
                    <span className="text-[10px] text-slate-400">5h ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Pill Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 py-1.5 pl-2 pr-3 bg-[#0F1738] hover:bg-[#16214C] text-white rounded-full shadow-xs transition-colors group cursor-pointer"
            aria-label="User menu"
          >
            <div className="w-7 h-7 rounded-full bg-white/15 text-white flex items-center justify-center font-bold text-[11px] tracking-wider shrink-0">
              {profile.initials || "CO"}
            </div>
            <span className="text-xs font-semibold tracking-tight hidden md:inline-block">
              {profile.name || "Chidi Okafor"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors shrink-0" />
          </button>

          {/* Profile menu popup */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {profile.name}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {profile.company}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate("/dashboard/company-profile");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
              >
                <User className="w-4 h-4 text-slate-400" />
                Company Profile
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate("/dashboard/settings");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Account Settings
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
