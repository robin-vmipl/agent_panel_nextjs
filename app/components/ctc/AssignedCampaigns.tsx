"use client";

import { useState } from "react";
import { Phone, Loader2, Download } from "lucide-react";
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
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

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
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch assigned data");
      setAssignedData([]);
    } finally {
      setTableLoading(false);
    }
  };

  const handleDial = async (row: AssignedData) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        action: "ManualDial",
        customer_number: row.CUST_NUM,
        agent_number: agentConfig.agent_number,
        agent_id: agentConfig.agent_id,
        user_group: agentConfig.user_group,
        vispl_id: agentConfig.vispl_id,
        dialType: "ASD",
        DA_ID: row.DA_ID,
      });
      await apiFetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/agent/manual-dial?${params.toString()}`
      );
      toast.success(`✅ Calling ${row.CUST_NUM.slice(-4)}...`);
      setAssignedData((prev) =>
        prev.filter((item) => item.DA_ID !== row.DA_ID)
      );
    } catch (error: any) {
      toast.error(error.message || "Call failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12">
      <div className="theme-surface backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <svg
            className="w-12 h-12 text-blue-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h2 className="text-3xl font-bold bg-linear-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Assigned Campaigns
            </h2>
            <p className="text-slate-400 mt-1">
              Select campaign to view assigned leads
            </p>
          </div>
        </div>
        {/* Campaign Selector */}
        <div className="theme-panel rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <select
              className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
            >
              <option value="">Select Campaign</option>
              {campaigns.map((camp) => (
                <option key={camp.DA_ID} value={camp.DA_ID}>
                  {camp.CAMPAIGN_NAME}
                </option>
              ))}
            </select>
            <button
              onClick={fetchAssignedData}
              disabled={loading || !selectedCampaign}
              className={`px-8 py-3 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 ${
                loading || !selectedCampaign
                  ? "bg-slate-800/70 text-slate-500 cursor-not-allowed"
                  : "bg-linear-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 hover:shadow-blue-500/50 hover:scale-[1.02] text-white"
              }`}
            >
              {tableLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              Fetch Data
            </button>
          </div>
        </div>
        {/* Table Section */}
        {tableLoading ? (
          <div className="flex items-center justify-center py-20">
            {/* ✅ OPEN & CLOSE */}
            <Loader2 className="w-8 h-8 animate-spin text-blue-400 mr-3" />
            <span className="text-slate-400">Loading assigned data...</span>
          </div>
        ) : assignedData.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-700/50 rounded-3xl bg-slate-900/30 backdrop-blur-sm p-12">
            {/* ✅ OPEN & CLOSE */}
            <svg
              className="w-20 h-20 mx-auto mb-6 text-slate-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-2xl font-bold text-slate-400 mb-2">
              No assigned data
            </h3>
            <p className="text-slate-500">
              Select a campaign to view your assigned leads
            </p>
          </div>
        ) : (
          <div className="theme-surface backdrop-blur-xl border border-slate-700/50 rounded-3xl p-1 shadow-2xl overflow-hidden">
            <div className="theme-panel rounded-3xl overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-slate-900/70 border-b border-slate-700/50">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider w-20">
                      ID
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider min-w-30">
                      State
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider min-w-30">
                      District
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider min-w-35">
                      Name
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider min-w-40">
                      Number
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider min-w-25">
                      Info 1
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider min-w-25">
                      Info 2
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider min-w-25">
                      Info 3
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold text-slate-300 uppercase tracking-wider w-32">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {assignedData.map((row, index) => (
                    <tr
                      key={`${row.DA_ID}-${index}`}
                      className="hover:bg-slate-800/50 group"
                    >
                      <td className="px-4 py-4 text-sm font-mono text-slate-300">
                        {row.DA_ID}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-blue-400">
                        {row.State}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-300">
                        {row.District}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-emerald-400">
                        {row.VLEName}
                      </td>
                      <td className="px-4 py-4 text-sm font-mono text-emerald-400 font-semibold">
                        {row.CUST_NUM}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-300">
                        {row.Info1}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-300">
                        {row.Info2}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-300">
                        {row.Info3}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleDial(row)}
                          disabled={loading}
                          className="theme-surface mx-auto px-6 py-2.5 bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-emerald-500/50 hover:scale-[1.02] transition-all text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 w-full group-hover:scale-[1.01]"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Phone className="w-4 h-4" />
                          )}
                          <span>{loading ? "Dialing..." : "Dial"}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
