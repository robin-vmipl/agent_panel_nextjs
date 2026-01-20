"use client";

import { useState } from "react";
import { Phone, Loader2, Play, ChevronDown, RefreshCcw } from "lucide-react";
import { apiFetch } from "@/app/lib/api";
import toast from "react-hot-toast";

interface AutoCampaign {
  CAMPAIGN_NAME: string;
}

interface AutoCampaignData {
  campaign_id: string;
  customer_number: string;
  start_time: string;
  status: string;
  circle: string;
  event_date: string;
  flag: string;
  upd_time: string;
}

interface AutoCampaignDialerProps {
  agentConfig: any;
  dialerCampaigns: AutoCampaign[];
}

export default function AutoCampaignDialer({
  agentConfig,
  dialerCampaigns,
}: AutoCampaignDialerProps) {
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [autoData, setAutoData] = useState<AutoCampaignData[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dialingCalls, setDialingCalls] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [refreshing, setRefreshing] = useState(false);
  const [localDialerCampaigns, setLocalDialerCampaigns] =
    useState<AutoCampaign[]>(dialerCampaigns);

  // 🔹 FETCH AUTO CAMPAIGN DATA
  const fetchAutoCampaignData = async () => {
    if (!selectedCampaign) {
      toast.error("Please select an auto campaign");
      return;
    }

    setTableLoading(true);
    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agent/auto-campaign-data`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            auto_campaign: selectedCampaign,
            agent_id: agentConfig.agent_id,
          }),
        }
      );

      setAutoData(response.data || []);
      toast.success(`Loaded ${response.data?.length || 0} auto dial records`);
    } catch (error: any) {
      console.error("Fetching auto campaign data failed:", error);
      setAutoData([]);
    } finally {
      setTableLoading(false);
    }
  };

  // 🔹 HANDLE AUTO DIAL
  const handleAutoDial = async (row: AutoCampaignData) => {
    const rowKey = row.campaign_id + row.customer_number;
    setDialingCalls((prev) => ({ ...prev, [rowKey]: true }));

    try {
      const params1 = new URLSearchParams({
        action: "AutoCampaign",
        customer_number: row.customer_number,
        agent_number: agentConfig.agent_number,
        agent_id: agentConfig.agent_id,
        user_group: agentConfig.user_group,
        vispl_id: agentConfig.vispl_id,
        dialType: "ASD",
        DA_ID: "0",
        campaign_id: row.campaign_id,
      });

      const response1 = await apiFetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/agent/auto-campaign-dial?${params1.toString()}`
      );

      if (response1.message.startsWith("01")) {
        toast.error("Agent Already On Call");
        return;
      }

      if (response1.message.startsWith("00")) {
        const rowId = response1.message.split("-")[1];

        const params2 = new URLSearchParams({
          action: "AUTOCAMP",
          customer_number: row.customer_number,
          agent_number: agentConfig.agent_number,
          callId: rowId,
          user_group: agentConfig.user_group,
        });

        await apiFetch(
          `${
            process.env.NEXT_PUBLIC_API_URL
          }/agent/auto-campaign-dial?${params2.toString()}`
        );

        toast.success(
          `✅ Auto dialing ${row.customer_number.slice(
            -4
          )}... Webphone ringing!`
        );

        setAutoData((prev) =>
          prev.filter(
            (item) =>
              item.campaign_id !== row.campaign_id ||
              item.customer_number !== row.customer_number
          )
        );
      }
    } catch (error: any) {
      console.error("Auto dial failed:", error);
    } finally {
      setDialingCalls((prev) => ({ ...prev, [rowKey]: false }));
    }
  };

  // 🔹 FORMAT TIME
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString("en-IN");
  };

  // 🔹 REFRESH CAMPAIGNS
  const refreshCampaigns = async () => {
    setRefreshing(true);
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agent/ctc-campaigns`,
        { showToast: false }
      );
      const updatedCampaigns = data?.dialer_campaigns || [];
      setLocalDialerCampaigns(updatedCampaigns);

      if (
        selectedCampaign &&
        !updatedCampaigns.some(
          (c: AutoCampaign) => c.CAMPAIGN_NAME === selectedCampaign
        )
      ) {
        setSelectedCampaign("");
        setAutoData([]);
      }

      toast.success("Campaign list refreshed");
    } catch (error) {
      console.error("Failed to refresh campaigns:", error);
      toast.error("Failed to refresh campaigns");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="mt-12">
      <div className="theme-surface backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
        {/* HEADER */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-8">
          {" "}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-panel rounded-2xl flex items-center justify-center shadow-lg">
              <Play className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-linear-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                Auto Campaign Dialer
              </h2>
              <p className="text-slate-400 mt-1">
                Automated campaigns - Ready to dial
              </p>
            </div>
          </div>
          {/* 🔄 REFRESH BUTTON (TOP RIGHT) */}
          <button
            onClick={refreshCampaigns}
            disabled={refreshing}
            className="ctc-refresh-btn
                w-full md:w-auto
                px-4 py-2
                bg-slate-700 hover:bg-slate-600
                rounded-xl text-sm
                flex items-center justify-center gap-2
                disabled:opacity-50 text-slate-300
              "
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCcw className="w-4 h-4 text-slate-300" />
            )}
            Refresh
          </button>
        </div>

        {/* Campaign Selector */}
        <div className="theme-panel rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center">
          <select
            className="
              w-full md:flex-1
              px-4 py-3
              bg-panel border border-slate-600
              rounded-xl text-white font-medium
              focus:ring-2 focus:ring-orange-500 focus:border-transparent
              transition-all
                   "
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
          >
            <option value="">Select Auto Campaign</option>
            {localDialerCampaigns.map((camp) => (
              <option key={camp.CAMPAIGN_NAME} value={camp.CAMPAIGN_NAME}>
                {camp.CAMPAIGN_NAME}
              </option>
            ))}
          </select>

          {/* Load Campaign Button */}
          <button
            onClick={fetchAutoCampaignData}
            disabled={loading || !selectedCampaign}
            className={`ctc-fetch-btn
              w-full md:w-auto
              px-8 py-3
              font-bold rounded-xl shadow-lg transition-all
              flex items-center justify-center gap-2 bg-panel
              ${
                loading || !selectedCampaign
                  ? "bg-slate-800/70 text-slate-300 cursor-not-allowed"
                  : "bg-linear-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 hover:shadow-orange-500/50 hover:scale-[1.02] text-white"
              }
            `}
          >
            {tableLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
            Load Campaign
          </button>
        </div>

        {/* Auto Campaign Table */}
        {tableLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-400 mr-3" />
            <span className="text-slate-400">
              Loading auto campaign data...
            </span>
          </div>
        ) : autoData.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-700/40 rounded-3xl bg-panel backdrop-blur-sm p-12">
            <Play className="w-20 h-20 mx-auto mb-6 text-slate-500" />
            <h3 className="text-2xl font-bold text-slate-400 mb-2">
              No auto campaign data
            </h3>
            <p className="text-slate-500">
              Select an auto campaign to view dialable leads
            </p>
          </div>
        ) : (
          <div className="theme-surface backdrop-blur-xl border border-slate-700/50 rounded-3xl p-1 shadow-2xl overflow-hidden">
            <div className="theme-panel rounded-3xl overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-slate-900/70 border-b border-slate-700/50">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider w-24">
                      Campaign ID
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider min-w-35">
                      Number
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider min-w-25">
                      Status
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider min-w-25">
                      Circle
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider min-w-35">
                      Event Date
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider min-w-20">
                      Flag
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold text-slate-300 uppercase tracking-wider w-32">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {autoData.map((row) => {
                    const rowKey = row.campaign_id + row.customer_number;
                    return (
                      <tr key={rowKey} className="hover:bg-slate-800/50 group">
                        <td className="px-4 py-4 text-sm font-mono text-slate-400">
                          {row.campaign_id}
                        </td>
                        <td className="px-4 py-4 text-sm font-mono text-emerald-400 font-semibold">
                          {row.customer_number}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              row.status === "P"
                                ? "bg-green-500/20 text-green-400"
                                : row.status === "C"
                                  ? "bg-orange-500/20 text-orange-400"
                                  : "bg-slate-500/20 text-slate-400"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-orange-400 ">
                          {row.circle}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-400 font-mono">
                          {formatTime(row.event_date)}
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-orange-400">
                          {row.flag}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleAutoDial(row)}
                            disabled={dialingCalls[rowKey]}
                            className="ctc-dial-btn mx-auto px-6 py-2.5 bg-linear-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-orange-500/50 hover:scale-[1.02] transition-all text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 w-full group-hover:scale-[1.01]"
                          >
                            {dialingCalls[rowKey] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Phone className="w-4 h-4" />
                            )}
                            <span>
                              {dialingCalls[rowKey] ? "Dialing..." : "Dial"}
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
