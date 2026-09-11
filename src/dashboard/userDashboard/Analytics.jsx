import React from "react";
import { BarChart3, TrendingUp, Users, Eye } from "lucide-react";

const Analytics = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Analytics</h2>
        <p className="text-sm text-slate-500 mt-1">
          Monitor your document view rates, client engagement, and AI performance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Document Views", val: "1,248", icon: Eye, change: "+14%" },
          { label: "Proposals Accepted", val: "18", icon: TrendingUp, change: "+8%" },
          { label: "Client Interactivity", val: "72%", icon: Users, change: "+5%" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{stat.label}</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{stat.val}</span>
                <span className="text-xs font-bold text-emerald-600">{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Analytics;
