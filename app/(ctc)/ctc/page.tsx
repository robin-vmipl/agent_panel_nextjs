"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { apiFetch } from "@/app/lib/api";
import ManualDial from "@/app/components/ctc/ManualDial";
import MissedCallsTable from "@/app/components/ctc/MissedCallsTable";
import AssignedCampaigns from "@/app/components/ctc/AssignedCampaigns";
import AutoCampaignDialer from "@/app/components/ctc/AutoCampaignDialer";
import ManualDialSkeleton from "@/app/components/ui/ManualDialSkeleton";
import MissedCallsSkeleton from "@/app/components/ui/MissedCallsSkeleton";
import AssignedCampaignsSkeleton from "@/app/components/ui/AssignedCampaignsSkeleton";
import AutoDialerSkeleton from "@/app/components/ui/AutoDialerSkeleton";
import { useAgentStatus } from "@/app/utils/useAgentStatus";
import { useSipStatus } from "@/app/utils/useSipStatus";
import { Phone } from "lucide-react";

export default function CTCPage() {
  useAgentStatus();
  useSipStatus();

  const hasShownError = useRef(false);
  const isMounted = useRef(true);

  const [agentConfig, setAgentConfig] = useState<any>(null);
  const [missedCalls, setMissedCalls] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [dialerCampaigns, setDialerCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (hasShownError.current || !isMounted.current) return;

    setIsLoading(true);
    setTableLoading(true);
    setApiError(null);

    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agent/ctc-data`,
        {
          isCtcPage: true,
          showToast: false,
          skipLogoutOn401: true,
        }
      );

      if (data?.error) {
        if (!hasShownError.current && isMounted.current) {
          hasShownError.current = true;
          setApiError(data.error);
        }
        return;
      }

      hasShownError.current = false;
      setAgentConfig(data);
      setMissedCalls(data.missed_calls || []);
      setCampaigns(data.campaigns || []);
      setDialerCampaigns(data.dialer_campaigns || []);
    } catch (error: any) {
      if (!hasShownError.current && isMounted.current) {
        hasShownError.current = true;
        setApiError(error.message || "Failed to connect");
      }
    } finally {
      if (isMounted.current) {
        setTableLoading(false);
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    loadData();
    return () => {
      isMounted.current = false;
    };
  }, [loadData]);

  //   ERROR UI
  if (apiError && hasShownError.current) {
    return (
      <div className="theme-surface backdrop-blur-3xl p-8 rounded-3xl border border-red-500/30 m-6">
        <p className="text-red-400 font-semibold">⚠ Unable to load CTC data</p>
        <p className="text-slate-400 text-sm mt-2">
          {apiError === "Offline" ? "No internet connection" : apiError}
        </p>

        <div className="mt-4 flex gap-3">
          <button
            onClick={() => {
              hasShownError.current = false;
              setApiError(null);
              loadData();
            }}
            className="px-4 py-2 bg-emerald-600/80 hover:bg-emerald-500 rounded-xl text-sm"
          >
            Retry
          </button>

          <a
            href="/dashboard"
            className="px-4 py-2 bg-slate-700/80 hover:bg-slate-600 rounded-xl text-sm text-center no-underline"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // LOADING SKELETON
  if (isLoading) {
    return (
      <div className="min-h-screen pb-12 bg-background text-foreground">
        <div className="max-w-6xl mx-auto px-6 pt-6">
          <ManualDialSkeleton />
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-12 space-y-6">
          <MissedCallsSkeleton />
          <AssignedCampaignsSkeleton />
          <AutoDialerSkeleton />
        </div>
      </div>
    );
  }

  // SUCCESS UI
  return (
    <div className="group relative theme-card backdrop-blur-xl p-4 rounded-xl shadow-xl hover:shadow-teal-500/25 overflow-hidden ring-1 ring-white/5 min-h-screen pb-12 bg-background text-foreground pt-6">
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <ManualDial agentConfig={agentConfig} />
        <div className="flex justify-end mt-4 text-xs text-muted">
          Agent:{" "}
          <span className="font-mono font-semibold text-foreground ml-1">
            {agentConfig?.agent_number}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-12">
        <div className="theme-surface backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-panel rounded-2xl flex items-center justify-center shadow-lg">
              <Phone className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-linear-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                Missed Calls ({missedCalls.length})
              </h2>
              <p className="text-slate-400 mt-1">
                Click DIAL to callback (dialed calls auto-remove)
              </p>
            </div>
          </div>

          {/* TABLE */}
          <MissedCallsTable
            agentConfig={agentConfig}
            missedCalls={missedCalls}
            loading={tableLoading}
            onCallDialed={(dialedCallId: string) => {
              setMissedCalls((prev) =>
                prev.filter((call) => call.id !== dialedCallId)
              );
            }}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-12">
        <AssignedCampaigns agentConfig={agentConfig} campaigns={campaigns} />
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-12">
        <AutoCampaignDialer
          agentConfig={agentConfig}
          dialerCampaigns={dialerCampaigns}
        />
      </div>
    </div>
  );
}
