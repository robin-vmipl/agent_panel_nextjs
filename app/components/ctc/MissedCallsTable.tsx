"use client";

import { Loader2, Phone } from "lucide-react";
import { apiFetch } from "@/app/lib/api";
import toast from "react-hot-toast";
import { useState } from "react";

interface MissedCall {
  id: string;
  customer_number: string;
  call_start_time: string;
  uniqueid: string;
  agent_number?: string;
  closecallid?: string;
  user_group?: string;
  user?: string;
  CLI?: string;
  customer_name?: string;
}

interface MissedCallsTableProps {
  agentConfig: any;
  missedCalls: MissedCall[];
  loading: boolean;
  onCallDialed: (dialedCallId: string) => void; // 🔥 CALLBACK ADDED
}

export default function MissedCallsTable({
  agentConfig,
  missedCalls,
  loading,
  onCallDialed,
}: MissedCallsTableProps) {
  const [dialingCalls, setDialingCalls] = useState<{ [key: string]: boolean }>(
    {}
  );

  const handleTableDial = async (call: MissedCall) => {
    setDialingCalls((prev) => ({ ...prev, [call.id]: true }));

    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agent/missed-call-dial`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "AutoDial",
            customer_number: call.customer_number,
            unique_id: call.uniqueid,
            agent_number: agentConfig.agent_number || call.agent_number,
            agent_id: agentConfig.agent_id,
            user_group: agentConfig.user_group || call.user_group,
            vispl_id: agentConfig.vispl_id,
            agent_name: agentConfig.full_name || "",
            cli: call.CLI || "",
          }),
        }
      );

      if (response.status_code === "0005") {
        toast.error("👤 Agent already on another call");
        return;
      }

      if (response.status_code === "0000") {
        toast.success(
          `✅ Calling ${call.customer_number.slice(-4)}... Webphone ringing!`
        );
        onCallDialed(call.id); // 🔥 REMOVE FROM PARENT STATE
        return;
      }

      toast.error("Call data not found");
    } catch (error: any) {
      toast.error(error.message || "Call failed");
    } finally {
      setDialingCalls((prev) => ({ ...prev, [call.id]: false }));
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString("en-IN");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mr-3" />
        <span className="text-slate-400">Loading missed calls...</span>
      </div>
    );
  }

  if (missedCalls.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed border-slate-700/50 rounded-3xl bg-slate-900/30 backdrop-blur-sm p-12">
        <svg
          className="w-20 h-20 mx-auto mb-6 text-slate-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
        <h3 className="text-2xl font-bold text-slate-400 mb-2">
          No missed calls today
        </h3>
        <p className="text-slate-500">Perfect! All calls handled 🎉</p>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-r from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-1 shadow-2xl">
      <div className="bg-slate-900/50 rounded-3xl overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-slate-900/70 border-b border-slate-700/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider w-12">
                Sr
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider min-w-55">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider min-w-45">
                Time
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wider w-44 text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {missedCalls.map((call: MissedCall, index: number) => (
              <tr key={call.id} className="hover:bg-slate-800/50 group">
                <td className="px-6 py-4 text-sm font-medium text-slate-300">
                  {index + 1}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-mono text-emerald-400 font-semibold min-w-55">
                    {call.customer_number}
                  </div>
                  {call.customer_name && (
                    <div className="text-xs text-slate-400 mt-1 font-normal">
                      {call.customer_name}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-400 min-w-45">
                  {formatTime(call.call_start_time)}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleTableDial(call)}
                    disabled={dialingCalls[call.id]}
                    className="mx-auto px-6 py-2.5 bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-emerald-500/50 hover:scale-[1.02] transition-all text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 w-full group-hover:scale-[1.01]"
                  >
                    {dialingCalls[call.id] ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Phone className="w-4 h-4" />
                    )}
                    <span>{dialingCalls[call.id] ? "Dialing..." : "Dial"}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
