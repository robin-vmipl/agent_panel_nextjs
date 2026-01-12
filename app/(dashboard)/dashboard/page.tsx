"use client";

import useSWR from "swr";
import { apiFetch } from "../../lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Phone, Clock, Activity } from "lucide-react";

import {
  SummarySkeleton,
  ActivitySkeleton,
  ChartSkeleton,
} from "../../components/ui/DashboardSkeleton";
import { useAgentStatus } from "@/app/utils/useAgentStatus";
import { useSipStatus } from "@/app/utils/useSipStatus";

const fetcher = (url: string) => apiFetch(url);

export default function DashboardPage() {
  useAgentStatus();
  useSipStatus();

  const { data, error, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/agent/activity-report`,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: false,
      shouldRetryOnError: (err) => err.message !== "Offline",
    }
  );

  if (error) {
    return (
      <div className="theme-surface backdrop-blur-3xl p-8 rounded-3xl border border-red-500/30">
        <p className="text-red-400 font-semibold">
          ⚠ Unable to load dashboard data
        </p>
        <p className="text-slate-400 text-sm mt-2">
          {error.message === "Offline"
            ? "No internet connection"
            : "Please check your connection or try again shortly."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-emerald-600/80 hover:bg-emerald-500 rounded-xl text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="theme-surface backdrop-blur-3xl p-8 rounded-3xl border-2 border-white/10 shadow-2xl shadow-slate-500/20 ring-2 ring-white/5 overflow-hidden relative">
          <SummarySkeleton />
          <ActivitySkeleton />
        </div>
      ) : (
        <div className="theme-surface backdrop-blur-3xl p-8 rounded-3xl border-2 border-white/10 shadow-2xl shadow-slate-500/20 ring-2 ring-white/5 overflow-hidden relative">
          <div className="absolute inset-0 bg-linear-to-br from-slate-500/10 via-slate-400/5 to-slate-600/10 blur-xl -z-10" />

          <div className="relative z-20 space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card
                title="Answered Calls"
                value={data.summary.answered}
                icon={<Phone className="w-5 h-5" />}
                color="emerald"
              />
              <Card
                title="Dropped Calls"
                value={data.summary.dropped}
                icon={<Phone className="w-5 h-5" />}
                color="teal"
              />
              <Card
                title="Last Login"
                value={data.summary.login}
                icon={<Clock className="w-5 h-5" />}
                color="emerald"
              />
              <Card
                title="Last Logout"
                value={data.summary.logout}
                icon={<Activity className="w-5 h-5" />}
                color="teal"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <TimeCard
                title="Login Hours"
                value={data.activity.loginHour}
                color="emerald"
              />
              <TimeCard
                title="Active Hours"
                value={data.activity.activeHour}
                color="teal"
              />
              <TimeCard
                title="Idle Hours"
                value={data.activity.idleHour}
                color="emerald"
              />
              <TimeCard
                title="Break Hours"
                value={data.activity.breakHour}
                color="teal"
              />
              <TimeCard
                title="Training Hours"
                value={data.activity.trainingBreakHour}
                color="emerald"
              />
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <ChartSkeleton />
      ) : (
        <div className="theme-surface backdrop-blur-3xl p-6 rounded-3xl border-2 border-white/10 shadow-2xl shadow-slate-500/20 ring-2 ring-white/5 overflow-hidden relative">
          <div className="absolute inset-0 bg-linear-to-br from-slate-500/10 via-slate-400/5 to-slate-600/10 blur-xl -z-10" />

          <div className="flex items-center justify-between mb-6 relative z-10">
            <h2 className="text-xl font-black bg-linear-to-r from-emerald-300 via-teal-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-2xl">
              📈 Last 7 Days Performance
            </h2>
          </div>

          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={data.chart.dates.map((date: string, i: number) => ({
                date,
                answered: data.chart.answered[i],
                dropped: data.chart.dropped[i],
              }))}
              margin={{ top: 15, right: 20, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient
                  id="answeredGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                  <stop offset="50%" stopColor="#34d399" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.5} />
                </linearGradient>
                <linearGradient
                  id="droppedGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.9} />
                  <stop offset="50%" stopColor="#F87171" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#DC2626" stopOpacity={0.5} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={12}
                fontWeight={600}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                fontWeight={500}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(30, 41, 59, 0.98)",
                  border: "1px solid #64748b",
                  borderRadius: "12px",
                  color: "#f8fafc",
                  fontSize: "13px",
                  fontWeight: "600",
                  padding: "12px 16px",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 15px 30px rgba(0,0,0,0.3)",
                }}
              />

              <Legend
                wrapperStyle={{ paddingTop: "16px" }}
                iconSize={12}
                iconType="circle"
              />

              <Bar
                dataKey="answered"
                name="Answered"
                fill="url(#answeredGradient)"
                barSize={28}
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="dropped"
                name="Dropped"
                fill="url(#droppedGradient)"
                barSize={28}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

type Color = "emerald" | "teal";

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: Color;
}

interface TimeCardProps {
  title: string;
  value: string | number;
  color: Color;
}

function Card({ title, value, icon, color }: CardProps) {
  const colors: Record<Color, string> = {
    emerald: "accent-emerald",
    teal: "accent-teal",
  };

  return (
    <div
      className={`group relative theme-card backdrop-blur-xl p-4 rounded-xl shadow-xl hover:shadow-emerald-500/25 hover:-translate-y-1 transition-all duration-400 cursor-pointer overflow-hidden ring-1 ring-white/5 ${colors[color]}`}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 -skew-x-12 -translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 blur-xs -z-10" />

      <div className="relative z-10 text-center space-y-3 h-full flex flex-col justify-center">
        <div
          className={`w-16 h-16 mx-auto card-badge rounded-2xl border-2 border-white/30 flex items-center justify-center shadow-xl group-hover:border-white/50 group-hover:shadow-lg group-hover:scale-105 transition-all duration-500 backdrop-blur-xl ring-2 ring-white/20`}
        >
          <div className="drop-shadow-xl">{icon}</div>
        </div>

        <div className="space-y-1">
          <p
            className="text-sm font-black"
            style={{ color: "var(--foreground)" }}
          >
            {value}
          </p>
          <p className="text-xs font-bold uppercase tracking-wide">{title}</p>
        </div>
      </div>
    </div>
  );
}

function TimeCard({ title, value, color }: TimeCardProps) {
  const colors: Record<Color, string> = {
    emerald: "accent-emerald",
    teal: "accent-teal",
  };

  const getIcon = (color: Color) => {
    switch (color) {
      case "emerald":
        return <Clock className="w-5 h-5 text-(--emerald)" />;
      case "teal":
        return <Activity className="w-5 h-5 text-(--teal)" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div
      className={`group relative theme-card backdrop-blur-xl p-4 rounded-xl shadow-xl hover:shadow-teal-500/25 hover:-translate-y-1 transition-all duration-400 cursor-pointer overflow-hidden ring-1 ring-white/5 ${colors[color]}`}
    >
      <div className="absolute inset-0 blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />

      <div className="relative z-10 text-center space-y-3 h-full flex flex-col justify-center">
        <div
          className={`p-3 rounded-xl card-badge border border-white/30 shadow-xl mx-auto w-16 h-16 flex items-center justify-center group-hover:scale-105 group-hover:shadow-lg group-hover:border-white/50 transition-all duration-400 backdrop-blur-xl ring-1 ring-white/20`}
        >
          <div className="drop-shadow-xl">{getIcon(color)}</div>
        </div>

        <div className="space-y-1">
          <p
            className="text-sm font-black"
            style={{ color: "var(--foreground)" }}
          >
            {value}
          </p>
          <p className="text-xs font-bold uppercase tracking-wide">{title}</p>
        </div>
      </div>
    </div>
  );
}
