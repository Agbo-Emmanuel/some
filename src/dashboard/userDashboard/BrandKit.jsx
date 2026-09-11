import React from "react";
import { Sparkles, Check, Upload, Palette } from "lucide-react";

const BrandKit = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Brand Kit</h2>
          <p className="text-sm text-slate-500 mt-1">
            Configure your brand colors, logos, typography, and voice guidelines.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 self-start sm:self-auto">
          Configured
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Colors */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">Brand Colors</h3>
          <div className="flex items-center gap-4">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-[#0E1538] shadow-xs border border-slate-200" />
              <p className="text-xs font-bold text-slate-800 mt-2">Navy</p>
              <p className="text-[11px] text-slate-400 font-mono">#0E1538</p>
            </div>
            <div>
              <div className="w-16 h-16 rounded-2xl bg-[#2563EB] shadow-xs border border-slate-200" />
              <p className="text-xs font-bold text-slate-800 mt-2">Primary Blue</p>
              <p className="text-[11px] text-slate-400 font-mono">#2563EB</p>
            </div>
            <div>
              <div className="w-16 h-16 rounded-2xl bg-[#64748B] shadow-xs border border-slate-200" />
              <p className="text-xs font-bold text-slate-800 mt-2">Slate Accent</p>
              <p className="text-[11px] text-slate-400 font-mono">#64748B</p>
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">Typography & Tagline</h3>
          <div className="space-y-4">
            <div>
              <span className="text-xs text-slate-400">Primary Font</span>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">Montserrat</p>
            </div>
            <div>
              <span className="text-xs text-slate-400">Tagline</span>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                "Clean power, built to last"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandKit;
