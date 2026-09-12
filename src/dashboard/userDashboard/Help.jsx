import React, { useMemo, useState } from "react";
import {
  Search,
  Compass,
  FileText,
  Sparkles,
  FileDown,
  FolderOpen,
  ShieldCheck,
  ArrowRight,
  Headphones,
  X,
} from "lucide-react";

// ---- Categories + articles ------------------------------------------
const CATEGORIES = [
  {
    id: "getting-started",
    title: "Getting Started",
    desc: "Learn how to set up your business and create your first document.",
    icon: Compass,
    panelTitle: "Getting Started",
    articles: [
      {
        title: "Setting up your business profile",
        desc: "What Ahiia asks for during onboarding and why each field affects your documents.",
        time: "3 min",
      },
      {
        title: "Creating your first document",
        desc: "Choose a generator, provide structured input, and generate a first draft.",
        time: "4 min",
      },
      {
        title: "Adding your brand kit",
        desc: "Apply your logo, colours, font and tagline to every document you create.",
        time: "2 min",
      },
    ],
  },
  {
    id: "creating-documents",
    title: "Creating Documents",
    desc: "Learn how Ahiia generates proposals, pitch decks, SOPs, contracts, and marketing plans.",
    icon: FileText,
    panelTitle: "Documents",
    articles: [
      {
        title: "The five document generators",
        desc: "Business proposals, pitch decks, SOPs, contracts and marketing plans, and when to use each.",
        time: "5 min",
      },
      {
        title: "Providing structured input",
        desc: "How the input form shapes the sections Ahiia produces for your document.",
        time: "2 min",
      },
      {
        title: "Draft, Finalized and Exported",
        desc: "What each document status means and when it changes.",
        time: "2 min",
      },
      {
        title: "Renaming and deleting documents",
        desc: "Manage your document list, and what happens to revisions when you delete.",
        time: "2 min",
      },
    ],
  },
  {
    id: "working-with-ai",
    title: "Working with AI",
    desc: "Learn how to use Ahiia's AI Assistant and refine your documents.",
    icon: Sparkles,
    panelTitle: "AI Assistant",
    articles: [
      {
        title: "Using the AI Assistant",
        desc: "Ask for changes to a section and review the result before keeping it.",
        time: "4 min",
      },
      {
        title: "How revisions work",
        desc: "Every generation and assistant edit is saved as a new revision, never overwritten.",
        time: "3 min",
      },
      {
        title: "Why the assistant uses your business context",
        desc: "How your company profile and business rules shape suggested edits.",
        time: "3 min",
      },
    ],
  },
  {
    id: "exporting",
    title: "Exporting",
    desc: "Learn about available document export formats.",
    icon: FileDown,
    panelTitle: "Exporting",
    articles: [
      {
        title: "Export formats",
        desc: "Export a finished document as PDF or DOCX, with your brand kit applied.",
        time: "2 min",
      },
      {
        title: "If an export doesn't arrive",
        desc: "What to check when an export is slow or fails to download.",
        time: "2 min",
      },
    ],
  },
  {
    id: "document-guidance",
    title: "Document Guidance",
    desc: "Learn about available document Guidance formats.",
    icon: FolderOpen,
    panelTitle: "Document Guidance",
    articles: [
      {
        title: "Reading document guidance",
        desc: "Where guidance appears and what the flags on a section mean.",
        time: "3 min",
      },
      {
        title: "If an export doesn't arrive",
        desc: "What to check when an export is slow or fails to download.",
        time: "2 min",
      },
    ],
  },
  {
    id: "account-security",
    title: "Account & Security",
    desc: "Learn about Account & Security.",
    icon: ShieldCheck,
    panelTitle: "Account & Security",
    articles: [
      {
        title: "Changing your password",
        desc: "Send yourself a secure reset link from Settings, and what it signs out.",
        time: "2 min",
      },
      {
        title: "Updating your name and email",
        desc: "What you can edit yourself in Settings, and what needs support.",
        time: "2 min",
      },
      {
        title: "Notification preferences",
        desc: "Choose which document emails Ahiia sends you.",
        time: "2 min",
      },
      {
        title: "How your business data is used",
        desc: "Your workspace content stays within your workspace.",
        time: "3 min",
      },
    ],
  },
];

const Help = () => {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(null);

  const filteredCategories = useMemo(() => {
    if (!query.trim()) return CATEGORIES;
    const q = query.toLowerCase();
    return CATEGORIES.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q) ||
        c.articles.some((a) => a.title.toLowerCase().includes(q)),
    );
  }, [query]);

  const activeCategory = CATEGORIES.find((c) => c.id === activeId);

  const handleToggle = (id) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-2">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <p className="text-xs font-bold text-blue-600 mb-1">
          Answers and support for your workspace.
        </p>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          How can we help?
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Find answers or get help with your Ahiia.Ai workspace.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents....."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#131B4D]/15 focus:border-[#131B4D]/40 transition-shadow"
          />
        </div>
      </div>

      {/* Category grid */}
      {filteredCategories.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs text-center py-14 px-6">
          <p className="text-sm font-bold text-slate-700">No results found</p>
          <p className="text-xs text-slate-400 mt-1">
            Try a different search term.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => {
            const Icon = cat.icon;
            const isActive = cat.id === activeId;
            return (
              <div
                key={cat.id}
                className={`bg-white rounded-3xl p-5 border shadow-xs transition-all duration-200 ${
                  isActive
                    ? "border-[#131B4D]/30 ring-1 ring-[#131B4D]/10"
                    : "border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {cat.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed min-h-[2.5rem]">
                  {cat.desc}
                </p>
                <button
                  type="button"
                  onClick={() => handleToggle(cat.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 mt-3 group"
                >
                  {isActive ? "Hide articles" : "Browse articles"}
                  <ArrowRight
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isActive ? "rotate-90" : "group-hover:translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Article panel */}
      <div
        className={`grid transition-all duration-300 ease-out ${
          activeCategory
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          {activeCategory && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900">
                  {activeCategory.panelTitle}
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveId(null)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  Close
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <ul className="divide-y divide-slate-100">
                {activeCategory.articles.map((article) => (
                  <li key={article.title}>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 text-left hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900">
                          {article.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                          {article.desc}
                        </p>
                      </div>
                      <div className="hidden sm:flex items-center gap-6 shrink-0">
                        <span className="text-xs font-semibold text-slate-400 w-28 text-right">
                          {activeCategory.panelTitle}
                        </span>
                        <span className="text-xs text-slate-400 w-12">
                          {article.time}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-300" />
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 sm:hidden shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Still need help */}
      <div className="bg-[#131B4D] rounded-3xl px-5 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Still need help?</p>
            <p className="text-xs text-white/60">
              Contact our support team and we'll help you get back on track.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-white text-[#131B4D] font-bold text-sm hover:bg-slate-100 active:scale-[0.98] transition-all shrink-0"
        >
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default Help;
