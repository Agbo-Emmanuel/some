import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FiArrowUp,
  FiCheck,
  FiFileText,
  FiDownload,
  FiLoader,
  FiBox,
} from "react-icons/fi";

/**
 * Ahiia.Ai — "How it works" + Document Workspace demo
 * --------------------------------------------------
 * Tailwind CSS + react-icons. Self-contained, responsive, no external state.
 *
 * Drop <AhiiaWorkspace /> anywhere in a Tailwind-enabled React app.
 */

const STEPS = [
  {
    id: "01",
    title: "Tell Ahiia about your business",
    body: "Add your company profile, audience, and tone once. Ahiia.Ai remembers it.",
  },
  {
    id: "02",
    title: "Choose what you want to create",
    body: "Pick from proposals, decks, SOPs, contracts, and marketing plans.",
  },
  {
    id: "03",
    title: "Let Ahiia.Ai generate it",
    body: "A structured first draft is built section by section from your context.",
  },
  {
    id: "04",
    title: "Review, improve & export",
    body: "Act on quality suggestions, then export to PDF, Docx, or slides.",
  },
];

const SECTIONS = [
  "Executive Summary",
  "Company Profile",
  "Project Scope",
  "Implementation Plan",
  "Budget",
  "Timeline",
  "Terms & Conditions",
];

const REQUEST_TEXT =
  "Create a proposal for my ₦50M solar installation project.";

/* ------------------------------------------------------------------ */
/* Step ribbon                                                         */
/* ------------------------------------------------------------------ */

function HowItWorks() {
  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
      <span className="inline-block rounded-full bg-indigo-100 px-4 py-1.5 text-xs sm:text-sm font-medium text-indigo-600">
        How it works
      </span>

      <h2 className="mt-5 text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-slate-900 leading-tight">
        Four steps from context to
        <br className="hidden sm:block" /> finished document
      </h2>

      <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10 text-left">
        {STEPS.map((step) => (
          <div key={step.id}>
            <div className="h-0.5 w-10 bg-indigo-500 mb-4" />
            <div className="text-xs font-semibold tracking-wide text-indigo-600 mb-2">
              {step.id}
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-2">
              {step.title}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              {step.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Animated checklist row (used on both left + right panels)           */
/* ------------------------------------------------------------------ */

function ChecklistRow({ label, done, delayMs, numbered, index }) {
  const [visible, setVisible] = useState(delayMs === 0);

  useEffect(() => {
    if (delayMs === 0) return;
    const t = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  return (
    <li
      className={`flex items-center gap-3 transition-all duration-300 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
      }`}
    >
      {numbered ? (
        <span className="w-5 shrink-0 text-[11px] font-medium text-slate-400 tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
      ) : null}

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <span
            className={`text-sm truncate ${
              numbered ? "font-semibold text-slate-900" : "text-slate-700"
            }`}
          >
            {label}
          </span>
          {visible && done ? (
            <FiCheck className="shrink-0 text-emerald-500" size={16} />
          ) : (
            <FiLoader
              className="shrink-0 text-slate-300 animate-spin"
              size={14}
            />
          )}
        </div>
        {numbered && (
          <div className="mt-1.5 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full bg-indigo-400 transition-all duration-500 ease-out ${
                visible ? "w-full" : "w-0"
              }`}
            />
          </div>
        )}
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Document workspace                                                   */
/* ------------------------------------------------------------------ */

function DocumentWorkspace() {
  const [runId, setRunId] = useState(0);
  const [progress, setProgress] = useState(0);
  const stepDelay = 260; // ms between each section revealing

  const totalDurationMs = useMemo(
    () => SECTIONS.length * stepDelay + 400,
    [stepDelay],
  );

  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / totalDurationMs) * 100));
      setProgress(pct);
      if (pct >= 100) clearInterval(interval);
    }, 60);
    return () => clearInterval(interval);
  }, [runId, totalDurationMs]);

  const replay = () => setRunId((n) => n + 1);
  const isComplete = progress >= 100;

  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-20">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-white">
              <FiBox size={13} />
            </span>
            Ahiia.Ai · Document workspace
          </div>
          <div className="text-xs sm:text-sm text-slate-500">
            Kanto Logistics Ltd. ·{" "}
            <span className="text-emerald-600 font-medium">
              Business context active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-5 sm:p-8">
          {/* Left: request + generation status */}
          <div key={`left-${runId}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
              Your request
            </p>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="flex-1 text-sm text-slate-800">{REQUEST_TEXT}</p>
              <button
                type="button"
                onClick={replay}
                aria-label="Generate document"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white transition-transform hover:scale-105 hover:bg-indigo-700 active:scale-95"
              >
                <FiArrowUp size={16} />
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-400 leading-relaxed">
              Ahiia reads this alongside your company profile, brand kit and
              business rules.
            </p>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  <FiLoader
                    className={`text-indigo-500 ${
                      isComplete ? "" : "animate-spin"
                    }`}
                    size={16}
                  />
                  Ahiia AI
                  <span className="text-slate-400 font-normal">
                    {isComplete ? "Complete" : "Generating…"}
                  </span>
                </div>
                <span className="text-sm font-semibold text-indigo-600 tabular-nums">
                  {progress}%
                </span>
              </div>

              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden mb-4">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-[width] duration-150 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <ul className="space-y-3">
                {SECTIONS.map((label, i) => (
                  <ChecklistRow
                    key={label}
                    label={label}
                    done
                    delayMs={i * stepDelay}
                    numbered={false}
                  />
                ))}
              </ul>
            </div>
          </div>

          {/* Right: generated document preview */}
          <div key={`right-${runId}`} className="flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
              Generated document
            </p>

            <div className="flex flex-1 flex-col rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-900 px-5 py-5 text-white">
                <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-2">
                  Proposal
                </p>
                <h3 className="text-lg sm:text-xl font-semibold leading-snug">
                  Solar Installation Project
                </h3>
                <p className="mt-1 text-sm text-indigo-300 font-medium">
                  ₦50M Project Value
                </p>
              </div>

              <div className="bg-white px-5 py-5 space-y-4">
                {SECTIONS.map((label, i) => (
                  <ChecklistRow
                    key={label}
                    label={label}
                    done
                    delayMs={i * stepDelay + 150}
                    numbered
                    index={i}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 space-y-3">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!isComplete}
              >
                <FiFileText size={15} />
                Review Document
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!isComplete}
                >
                  <FiDownload size={14} />
                  Export PDF
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!isComplete}
                >
                  <FiDownload size={14} />
                  Export DOCX
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Root export                                                          */
/* ------------------------------------------------------------------ */

const AhiiaWorkspace = () => {
  return (
    <div className="min-h-screen bg-white">
      <HowItWorks />
      <DocumentWorkspace />
    </div>
  );
};

export default AhiiaWorkspace;
