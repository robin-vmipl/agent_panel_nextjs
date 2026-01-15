"use client";

import { useState } from "react";
import { Phone, Loader2, Download, RefreshCcw } from "lucide-react";
import { apiFetch } from "@/app/lib/api";
import toast from "react-hot-toast";

interface Campaign {
  DA_ID: string;
  CAMPAIGN_NAME: string;
}

interface AssignedData {
  DA_ID: string;
  VLEName: string;
  CUST_NUM: string;
  State: string;
  District: string;
  Info1: string;
  Info2: string;
  Info3: string;
}

interface AssignedCampaignsProps {
  agentConfig: any;
  campaigns: Campaign[];
}

export default function AssignedCampaigns({
  agentConfig,
  campaigns,
}: AssignedCampaignsProps) {
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [assignedData, setAssignedData] = useState<AssignedData[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [dialingRow, setDialingRow] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [localCampaigns, setLocalCampaigns] = useState<Campaign[]>(campaigns);

  /* REFRESH CAMPAIGN DROPDOWN */
  const refreshCampaigns = async () => {
    setRefreshing(true);
    try {
      const data = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agent/ctc-campaigns`,
        {
          showToast: false,
        }
      );

      const updatedCampaigns = data?.campaigns || [];
      setLocalCampaigns(updatedCampaigns);

      // reset selection if removed from backend
      if (
        selectedCampaign &&
        !updatedCampaigns.some((c: Campaign) => c.DA_ID === selectedCampaign)
      ) {
        setSelectedCampaign("");
        setAssignedData([]);
      }

      toast.success("Campaign list updated");
    } catch (error) {
      console.error("Failed to refresh campaigns:", error);
      toast.error("Failed to refresh campaigns");
    } finally {
      setRefreshing(false);
    }
  };

  /* FETCH ASSIGNED DATA */
  const fetchAssignedData = async () => {
    if (!selectedCampaign) {
      toast.error("Please select a campaign");
      return;
    }

    setTableLoading(true);
    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agent/assigned-campaign-data`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campaign: selectedCampaign,
            agent_id: agentConfig.agent_id,
          }),
        }
      );

      setAssignedData(response.data || []);
      toast.success(`Loaded ${response.data?.length || 0} records`);
    } catch (error) {
      console.error("Fetching assigned data failed:", error);
      setAssignedData([]);
    } finally {
      setTableLoading(false);
    }
  };

  const handleDial = async (row: AssignedData, index: number) => {
    const rowKey = `${row.DA_ID}-${index}`;
    setDialingRow(rowKey);

    try {
      const params = new URLSearchParams({
        action: "ManualDial",
        customer_number: row.CUST_NUM,
        agent_number: agentConfig.agent_number,
        agent_id: agentConfig.agent_id,
        user_group: agentConfig.user_group,
        vispl_id: agentConfig.vispl_id || "0",
        dialType: "ASD",
        DA_ID: row.DA_ID,
      });

      await apiFetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/agent/click-to-call?${params.toString()}`
      );

      toast.success(`✅ Calling ${row.CUST_NUM.slice(-4)}...`);

      setAssignedData((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Dialing failed:", error);
      toast.error("Call failed. Please try again.");
    } finally {
      setDialingRow(null);
    }
  };

  return (
    <div className="mt-12">
      <div className="theme-surface border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
        {/* HEADER */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <Download className="w-10 h-10 text-blue-400" />
            <div>
              <h2 className="text-3xl font-bold text-blue-400">
                Assigned Campaigns{" "}
                <span className="text-3xl font-bold text-blue-400">
                  ({assignedData.length})
                </span>
              </h2>
              <p className="text-slate-400 mt-1">
                Select campaign to view assigned leads
              </p>
            </div>
          </div>

          {/* 🔄 REFRESH BUTTON (TOP RIGHT) */}
          <button
            onClick={refreshCampaigns}
            disabled={refreshing}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCcw className="w-4 h-4" />
            )}
            Refresh
          </button>
        </div>

        {/* CAMPAIGN SELECT */}
        <div className="theme-panel rounded-2xl p-6 mb-8 flex gap-4">
          <select
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white"
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
          >
            <option value="">Select Campaign</option>
            {localCampaigns.map((camp) => (
              <option key={camp.DA_ID} value={camp.DA_ID}>
                {camp.CAMPAIGN_NAME}
              </option>
            ))}
          </select>

          <button
            onClick={fetchAssignedData}
            disabled={!selectedCampaign || tableLoading}
            className={`px-8 py-3 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 ${
              !selectedCampaign || tableLoading
                ? "bg-slate-800/70 text-slate-500 cursor-not-allowed"
                : "bg-linear-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 hover:shadow-blue-500/50 hover:scale-[1.02] text-white"
            }`}
          >
            {tableLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            Fetch
          </button>
        </div>

        {/* TABLE */}
        {tableLoading ? (
          <div className="text-center py-20 text-slate-400">
            Loading assigned data...
          </div>
        ) : assignedData.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-700/50 rounded-3xl bg-slate-900/30 backdrop-blur-sm p-12">
            <Download className="w-20 h-20 mx-auto mb-6 text-slate-500" />
            <h3 className="text-2xl font-bold text-slate-400 mb-2">
              No assigned data
            </h3>
            <p className="text-slate-500">
              Select a campaign to view assigned leads
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left">Sr</th>
                  <th className="px-4 py-3 text-left">Number</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">State</th>
                  <th className="px-4 py-3 text-left">District</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {assignedData.map((row, index) => {
                  const rowKey = `${row.DA_ID}-${index}`;
                  return (
                    <tr key={rowKey} className="hover:bg-slate-800">
                      <td className="px-4 py-3 text-sm">{index + 1}</td>
                      <td className="px-4 py-3 font-mono text-emerald-400 font-semibold text-sm">
                        {row.CUST_NUM}
                      </td>
                      <td className="px-4 py-3 text-sm">{row.VLEName}</td>
                      <td className="px-4 py-3 text-sm">{row.State}</td>
                      <td className="px-4 py-3 text-sm">{row.District}</td>
                      <td className="px-4 py-3 text-center text-sm">
                        <button
                          onClick={() => handleDial(row, index)}
                          disabled={dialingRow === rowKey}
                          className="mx-auto px-6 py-2.5 bg-linear-to-r from-blue-600 to-indigo-500
                            hover:from-blue-700 hover:to-indigo-600
                            text-white font-semibold rounded-xl
                            shadow-lg hover:shadow-blue-500/50
                            hover:scale-[1.02] transition-all
                            flex items-center gap-2
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                        >
                          {dialingRow === rowKey ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Phone className="w-4 h-4" />
                          )}
                          Dial
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
