import React, { useState, useEffect } from "react";
import { KeyRound, ShieldCheck, Loader2, Check } from "lucide-react";
import { toast } from "react-toastify";
import { forgotPassword } from "../../../services/auth.service";
import { getCurrentUser } from "../../../services/user.service";
import { useCookies } from "react-cookie";

const SecuritySettings = () => {
  const [cookies] = useCookies(["userData"]);
  const [email, setEmail] = useState(cookies.userData?.email || "");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        const data = res?.data || res;
        if (isMounted && data?.email) {
          setEmail(data.email);
        }
      } catch (err) {
        console.error("Failed to load user email:", err);
      }
    };
    if (!email) {
      fetchUser();
    }
    return () => {
      isMounted = false;
    };
  }, [email]);

  const handleSendReset = async () => {
    if (sending) return;
    if (!email) {
      toast.error("User email not found. Please try again later.");
      return;
    }
    setSending(true);
    try {
      await forgotPassword({ email });
      setSent(true);
      toast.success(`Password reset link sent to ${email}!`);
    } catch (err) {
      console.error("Failed to send reset link:", err);
      toast.error(
        err.response?.data?.message || "Failed to send password reset link"
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs">
      <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-5 border-b border-slate-100">
        <h3 className="text-sm font-black text-slate-900">
          Password &amp; security
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Keep access to your workspace protected.
        </p>
      </div>

      <div className="px-5 sm:px-6 py-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <KeyRound className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900">
                Change password
              </p>
              <p className="text-xs text-slate-400">
                We'll email a secure link to set a new password.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSendReset}
            disabled={sending}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold shrink-0 transition-all ${
              sent
                ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                : "border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
            } disabled:cursor-wait`}
          >
            {sending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Sending...
              </>
            ) : sent ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Link sent
              </>
            ) : (
              "Send reset link"
            )}
          </button>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/60">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Setting a new password signs you out of every other session. Your
            documents, company profile and brand kit are unaffected.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
