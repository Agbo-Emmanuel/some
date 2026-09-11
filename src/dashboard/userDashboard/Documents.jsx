import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Plus, Search, Filter, ArrowRight } from "lucide-react";

const Documents = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Documents</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage, edit, export, and share all your business documents.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/dashboard/create-document")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#131B4D] hover:bg-[#1B2666] text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Document</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200/80 shadow-xs text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Your Document Library</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
          You have 24 documents created. Detailed documents list view will be populated with search and multi-filtering soon.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            Back to Dashboard
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard/create-document")}
            className="px-5 py-2.5 rounded-xl bg-[#131B4D] text-white font-bold text-sm hover:bg-[#1B2666] transition-colors"
          >
            Create New Document
          </button>
        </div>
      </div>
    </div>
  );
};

export default Documents;
