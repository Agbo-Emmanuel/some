import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

const AccountSettings = () => {
  const { markDirty, registerSave } = useOutletContext();

  const [name, setName] = useState("");
  const [email] = useState("");

  useEffect(() => {
    registerSave(async () => {
      await new Promise((res) => setTimeout(res, 700));
      // Persist `name` to the API here.
    });
  }, [registerSave, name]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs">
      <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-5 border-b border-slate-100">
        <h3 className="text-sm font-black text-slate-900">
          Account information
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          This is how you appear across your Ahiia.Ai workspace.
        </p>
      </div>

      <div className="px-5 sm:px-6 py-5 space-y-5 max-w-md">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              markDirty();
            }}
            placeholder="Chidi Okafor"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#131B4D]/15 focus:border-[#131B4D]/40 transition-shadow"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            readOnly
            placeholder="Yourcompanyemail.com"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-500 placeholder:text-slate-400 cursor-not-allowed"
          />
          <p className="text-xs text-slate-400 mt-1.5">
            Your sign-in email can't be changed here. Contact support to update
            it.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
