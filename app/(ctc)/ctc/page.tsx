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
import { useOffline } from "@/app/utils/useOffline";

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

  useEffect(() => {
    isMounted.current = true;
    loadData();
    return () => {
      isMounted.current = false;
    };
  }, []);

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

  // 🔥 UNIFIED COMPACT ERROR UI (Dashboard Style)
  if (apiError && hasShownError.current) {
    return (
      <div className="theme-surface backdrop-blur-3xl p-8 rounded-3xl border border-red-500/30">
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

  // LOADING
  if (isLoading) {
    return (
      <div className="min-h-screen pb-12 bg-background text-foreground">
        <div className="max-w-6xl mx-auto px-6 pt-6">
          <ManualDialSkeleton />
          <div className="flex justify-end mt-4">
            <div className="h-6 w-32 bg-slate-700/50 rounded-lg animate-pulse"></div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-12">
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
        <div className="flex items-center gap-4 mb-8">
          <svg
            className="w-10 h-10 text-amber-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h2 className="text-3xl font-bold bg-linear-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Missed Calls ({missedCalls.length})
            </h2>
            <p className="text-slate-400 mt-1">
              Click DIAL to callback (dialed calls auto-remove)
            </p>
          </div>
        </div>

        <MissedCallsTable
          agentConfig={agentConfig}
          missedCalls={missedCalls}
          loading={tableLoading}
          onCallDialed={(dialedCallId: string) => {
            setMissedCalls((prev) => {
              const newCalls = prev.filter((call) => call.id !== dialedCallId);
              console.log(
                `Removed dialed call ${dialedCallId}. Remaining: ${newCalls.length}`
              );
              return newCalls;
            });
          }}
        />

        <AssignedCampaigns agentConfig={agentConfig} campaigns={campaigns} />
        <AutoCampaignDialer
          agentConfig={agentConfig}
          dialerCampaigns={dialerCampaigns}
        />
      </div>
    </div>
  );
}
