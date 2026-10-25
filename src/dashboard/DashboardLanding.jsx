import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import SideBar, {
  DEFAULT_USER_NAV_ITEMS,
  DEFAULT_USER_BOTTOM_NAV_ITEMS,
} from "./components/SideBar";
import DashboardHeader from "./components/DashboardHeader";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FileStack,
  BarChart3,
  Settings,
  HelpCircle,
} from "lucide-react";
import { getUserProfile } from "../services/profile.service";
export const ADMIN_NAV_ITEMS = [
  {
    name: "Dashboard",
    to: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: "User Management",
    to: "/admin/users",
    icon: Users,
  },
  {
    name: "Verifications",
    to: "/admin/verifications",
    icon: ShieldCheck,
  },
  {
    name: "Templates",
    to: "/admin/templates",
    icon: FileStack,
  },
  {
    name: "Analytics",
    to: "/admin/analytics",
    icon: BarChart3,
  },
];

export const ADMIN_BOTTOM_NAV_ITEMS = [
  {
    name: "Settings",
    to: "/admin/settings",
    icon: Settings,
  },
  {
    name: "Support Desk",
    to: "/admin/support",
    icon: HelpCircle,
  },
];

const DashboardLanding = ({
  role = "user",
  customNavItems,
  customBottomNavItems,
  profile,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [headerTitle, setHeaderTitle] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const fetchProfile = async () => {
    try {
      const response = await getUserProfile();
      const data = response?.companyName
        ? response
        : response?.data || response;
      if (data) {
        setUserProfile(data);
      }
    } catch (err) {
      console.error("DashboardLanding.fetchProfile", err);
    }
  };

  useEffect(() => {
    if (role === "user") {
      fetchProfile();
    }

    const handleProfileUpdated = (event) => {
      if (event?.detail) {
        setUserProfile(event.detail);
      } else {
        fetchProfile();
      }
    };

    window.addEventListener("ahiia:profile-updated", handleProfileUpdated);
    return () => {
      window.removeEventListener("ahiia:profile-updated", handleProfileUpdated);
    };
  }, [role]);

  // Determine nav items based on role or passed props
  const navItems =
    customNavItems ||
    (role === "admin" ? ADMIN_NAV_ITEMS : DEFAULT_USER_NAV_ITEMS);

  const bottomNavItems =
    customBottomNavItems ||
    (role === "admin"
      ? ADMIN_BOTTOM_NAV_ITEMS
      : DEFAULT_USER_BOTTOM_NAV_ITEMS);

  const companyName = userProfile?.companyName || "";
  const initials = companyName
    ? companyName
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "YC";

  const activeProfile =
    profile ||
    (role === "admin"
      ? {
          name: "Admin Portal",
          company: "Super Administrator",
          initials: "AD",
        }
      : {
          name: companyName || "Your Company",
          company: companyName || "Your Company",
          industry: userProfile?.industry || "Financial services",
          logoUrl: userProfile?.logoUrl || null,
          initials,
          completenessPercent: userProfile?.completenessPercent ?? 80,
          missingFields: userProfile?.missingFields || [],
        });

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 flex">
      {/* Persistent / Responsive Sidebar */}
      <SideBar
        navItems={navItems}
        bottomNavItems={bottomNavItems}
        profile={activeProfile}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        {/* Dynamic Header */}
        <DashboardHeader
          titleOverride={headerTitle}
          onMenuToggle={() => setIsSidebarOpen(true)}
          profile={activeProfile}
        />

        {/* Dynamic Page Content with context support */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet
            context={{
              setHeaderTitle,
              profile: activeProfile,
              userProfile,
              refreshProfile: fetchProfile,
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default DashboardLanding;
