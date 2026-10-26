import React, { useEffect, useState } from "react";
import {
  RefreshCw,
  Wand2,
  Pencil,
  FileText,
  Megaphone,
  LayoutGrid,
  FileSignature,
  Presentation,
  MonitorPlay,
  RotateCw,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { getAnalyticsSummary } from "../../services/insights.service";

const ICON_MAP = {
  Proposal: FileText,
  "business-proposal": FileText,
  MarketingPlan: Megaphone,
  "marketing-plan": Megaphone,
  SOP: LayoutGrid,
  sop: LayoutGrid,
  Contract: FileSignature,
  contract: FileSignature,
  PitchDeck: Presentation,
  "pitch-deck": Presentation,
  BusinessPlan: MonitorPlay,
  "business-plan": MonitorPlay,
};

function getIconForType(type) {
  return ICON_MAP[type] || FileText;
}

function ProgressBar({ pct = 0 }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
      <div
        className="h-full rounded-full bg-[#131B4D] transition-all duration-700 ease-out"
        style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
      />
    </div>
  );
}

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    documentsCreated: 0,
    mostUsedGenerator: "None yet",
    aiEdits: 0,
  });
  const [byGenerator, setByGenerator] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await getAnalyticsSummary();
        const data = res?.data || res;

        if (isMounted && data) {
          const act = data.activity || data.stats || data;
          const mostUsed =
            typeof act?.mostUsedGenerator === "object"
              ? act.mostUsedGenerator?.label ||
                act.mostUsedGenerator?.documentType ||
                "None yet"
              : act?.mostUsedGenerator || "None yet";

          setStats({
            documentsCreated: act?.documentsCreated ?? act?.totalDocuments ?? 0,
            mostUsedGenerator: mostUsed,
            aiEdits: act?.aiEdits ?? 0,
          });

          // Process byGenerator breakdown
          const genList = Array.isArray(data.byGenerator)
            ? data.byGenerator
            : Array.isArray(data.generators)
            ? data.generators
            : [];

          const total =
            data.totalDocuments ??
            act?.documentsCreated ??
            genList.reduce((acc, g) => acc + (g.count || 0), 0);
          setTotalDocuments(total);

          setByGenerator(
            genList.map((g) => {
              const count = g.count || 0;
              const pct =
                g.pct ?? (total > 0 ? Math.round((count / total) * 100) : 0);
              return {
                label: g.label || g.name || g.documentType || "Document",
                count,
                pct,
                icon: getIconForType(g.documentType || g.slug || g.label),
              };
            })
          );

          // Process recentActivity
          const recentList = Array.isArray(data.recentActivity)
            ? data.recentActivity
            : Array.isArray(data.recentDocuments)
            ? data.recentDocuments
            : Array.isArray(data.events)
            ? data.events
            : [];

          setRecentActivity(
            recentList.map((item, idx) => ({
              id: item.id || idx,
              action:
                item.action ||
                (item.title ? "Document updated" : "Activity logged"),
              doc: item.doc || item.title || item.name || "Untitled Document",
              time:
                item.time ||
                (item.updatedAt
                  ? new Date(item.updatedAt).toLocaleDateString()
                  : "Recently"),
              icon: item.action?.includes("AI") ? Pencil : Wand2,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load analytics summary:", err);
        toast.error("Could not load analytics summary");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAnalytics();
    return () => {
      isMounted = false;
    };
  }, []);

  const activityStats = [
    {
      label: "Documents Created",
      value: String(stats.documentsCreated),
      sub: "Total documents created",
      icon: RefreshCw,
    },
    {
      label: "Most Used Generator",
      value: stats.mostUsedGenerator,
      sub: "Your most frequently used document type",
      icon: Wand2,
    },
    {
      label: "AI Edits",
      value: String(stats.aiEdits),
      sub: "AI-assisted edits performed",
      icon: Pencil,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-blue-600 mb-1">
            Understand how you're using Ahiia.Ai.
          </p>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Analytics
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Understand how you're using Ahiia.Ai across your business documents.
          </p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            Loading stats...
          </div>
        )}
      </div>

      {/* Your activity */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-black text-slate-900 mb-4">
          Your activity
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {activityStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-2xl p-5 border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-500">
                    {stat.label}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <p
                  className={`mt-3 font-black text-slate-900 leading-tight ${
                    stat.value.length > 6 ? "text-lg sm:text-xl" : "text-2xl"
                  }`}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Documents by generator */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-slate-900">
            Documents by generator
          </h3>
          <span className="text-xs font-medium text-slate-400">
            {totalDocuments} documents total
          </span>
        </div>

        {byGenerator.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">
            No generator activity recorded yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {byGenerator.map((g) => {
              const Icon = g.icon;
              return (
                <div key={g.label} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-sm font-bold text-slate-800 truncate">
                        {g.label}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 shrink-0">
                      {g.count} &middot; {g.pct}%
                    </span>
                  </div>
                  <ProgressBar pct={g.pct} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent activity */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-black text-slate-900 mb-2">
          Recent activity
        </h3>
        {recentActivity.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">
            No recent activity recorded yet.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentActivity.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-3 sm:gap-4 py-3.5 hover:bg-slate-50/70 -mx-2 px-2 rounded-xl transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {item.action}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {item.doc}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0 whitespace-nowrap">
                    {item.time}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Analytics;
