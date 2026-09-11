import React from "react";
import { Building2, CheckCircle2, AlertCircle } from "lucide-react";

const CompanyProfile = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Company Profile</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage your company details, industry context, and business statements.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 self-start sm:self-auto">
          85% Completed
        </span>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Company Name</label>
            <input
              type="text"
              readOnly
              value="SolarTech Nigeria"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Industry</label>
            <input
              type="text"
              readOnly
              value="Renewable Energy"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Description</label>
          <textarea
            readOnly
            rows={3}
            value="Leading solar power system installers providing clean, uninterrupted energy solutions for enterprises across West Africa."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800"
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
