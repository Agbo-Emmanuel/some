import React from "react";
import { Settings as SettingsIcon, Bell, Lock, Shield } from "lucide-react";

const Settings = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Account Settings</h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account preferences, security, notifications, and team access.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        {[
          { title: "Notification Preferences", desc: "Choose email and in-app alerts.", icon: Bell },
          { title: "Password & Security", desc: "Update password and multi-factor authentication.", icon: Lock },
          { title: "Team & Permissions", desc: "Manage collaborators and access roles.", icon: Shield },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 border border-slate-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-indigo-600 hover:underline">Edit</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Settings;