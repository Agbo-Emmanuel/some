import React from "react";
import { useNavigate } from "react-router-dom";
import { FilePlus2, Sparkles, FileText, ScrollText, Presentation } from "lucide-react";

const CreateDocument = () => {
  const navigate = useNavigate();

  const templates = [
    { title: "Business Proposal", desc: "Craft winning client proposals with automated pricing.", icon: FileText },
    { title: "Contract Agreement", desc: "Legally sound agreement templates tailored to your firm.", icon: ScrollText },
    { title: "Pitch Deck", desc: "Present your company to investors with high-impact slides.", icon: Presentation },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Document</h2>
        <p className="text-sm text-slate-500 mt-1">
          Select a template or generate with AI using your business profile context.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map((tpl) => {
          const Icon = tpl.icon;
          return (
            <div
              key={tpl.title}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-[#131B4D] group-hover:text-white flex items-center justify-center transition-colors mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-900 transition-colors">
                  {tpl.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {tpl.desc}
                </p>
              </div>

              <button
                type="button"
                className="mt-6 w-full py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 group-hover:bg-[#131B4D] group-hover:text-white group-hover:border-transparent transition-colors"
              >
                Use Template
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CreateDocument;
