import React from "react";
import { Headphones, MessageCircle, BookOpen, Mail } from "lucide-react";

const Help = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Help & Support</h2>
        <p className="text-sm text-slate-500 mt-1">
          Have questions or need assistance? Our support team and guides are here for you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Documentation", desc: "Read our comprehensive guides and FAQs.", icon: BookOpen, cta: "Browse Docs" },
          { title: "Live Chat Support", desc: "Speak directly with an AI document specialist.", icon: MessageCircle, cta: "Start Chat" },
          { title: "Email Us", desc: "Reach out directly to support@ahiia.ai for inquiries.", icon: Mail, cta: "Send Email" },
        ].map((box) => {
          const Icon = box.icon;
          return (
            <div key={box.title} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{box.title}</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{box.desc}</p>
              </div>
              <button
                type="button"
                className="mt-6 w-full py-2.5 rounded-xl bg-slate-50 hover:bg-[#131B4D] hover:text-white text-xs font-bold text-slate-700 transition-colors"
              >
                {box.cta}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Help;
