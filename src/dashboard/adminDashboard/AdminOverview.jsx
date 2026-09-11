import React from "react";
import { Users, ShieldCheck, FileStack, TrendingUp } from "lucide-react";

const AdminOverview = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Admin Overview</h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage system metrics, users, verification requests, and templates.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Users", val: "1,420", icon: Users },
          { label: "Pending Verifications", val: "12", icon: ShieldCheck },
          { label: "Document Templates", val: "48", icon: FileStack },
          { label: "System Uptime", val: "99.98%", icon: TrendingUp },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{item.label}</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-900">{item.val}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminOverview;
