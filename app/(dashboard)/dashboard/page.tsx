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

const fetcher = (url: string) => apiFetch(url);

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/agent/activity-report`,
    fetcher,
    { refreshInterval: 30000, revalidateOnFocus: false }
  );

  if (error)
    return (
      <p className="text-red-400 p-8 text-center">Failed to load dashboard</p>
    );

  return (
    <div className="space-y-6">
      {/* 🔥 COMBINED SUMMARY + ACTIVITY - SINGLE BLACKISH CONTAINER */}
      {isLoading ? (
        <div className="bg-linear-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-3xl p-8 rounded-3xl border-2 border-white/10 shadow-2xl shadow-emerald-500/20 ring-2 ring-white/5 overflow-hidden relative">
          <SummarySkeleton />
          <ActivitySkeleton />
        </div>
      ) : (
        <div className="bg-linear-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-3xl p-8 rounded-3xl border-2 border-white/10 shadow-2xl shadow-emerald-500/20 ring-2 ring-white/5 overflow-hidden relative">
          {/* 🔥 VIBRANT GLOW BACKGROUND */}
          <div className="absolute inset-0 bg-linear-to-br from-emerald-400/10 via-transparent to-purple-400/10 blur-xl -z-10" />

          <div className="relative z-20 space-y-8">
            {/* SUMMARY CARDS */}
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
                color="rose"
              />
              <Card
                title="Last Login"
                value={data.summary.login}
                icon={<Clock className="w-5 h-5" />}
                color="blue"
              />
              <Card
                title="Last Logout"
                value={data.summary.logout}
                icon={<Activity className="w-5 h-5" />}
                color="purple"
              />
            </div>

            {/* ACTIVITY CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <TimeCard
                title="Login Hours"
                value={data.activity.loginHour}
                color="emerald"
              />
              <TimeCard
                title="Active Hours"
                value={data.activity.activeHour}
                color="blue"
              />
              <TimeCard
                title="Idle Hours"
                value={data.activity.idleHour}
                color="amber"
              />
              <TimeCard
                title="Break Hours"
                value={data.activity.breakHour}
                color="purple"
              />
              <TimeCard
                title="Training Hours"
                value={data.activity.trainingBreakHour}
                color="indigo"
              />
            </div>
          </div>
        </div>
      )}

      {/* 🔥 CHART - COLORFUL MATCHING CARDS */}
      {isLoading ? (
        <ChartSkeleton />
      ) : (
        <div className="bg-linear-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-3xl p-6 rounded-3xl border-2 border-white/10 shadow-2xl shadow-emerald-500/20 ring-2 ring-white/5 overflow-hidden relative">
          {/* 🔥 VIBRANT GLOW BACKGROUND */}
          <div className="absolute inset-0 bg-linear-to-br from-emerald-400/10 via-transparent to-purple-400/10 blur-xl -z-10" />

          {/* 🔥 GLOWING HEADER */}
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h2 className="text-xl font-black bg-linear-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-2xl">
              📈 Last 7 Days Performance
            </h2>
            {/* <div className="w-2.5 h-2.5 bg-linear-to-r from-emerald-400 to-blue-400 rounded-full shadow-lg ring-2 ring-white/30" /> */}
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
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.95} />
                  <stop offset="40%" stopColor="#34D399" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.4} />
                </linearGradient>
                <linearGradient
                  id="droppedGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.95} />
                  <stop offset="40%" stopColor="#F87171" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#DC2626" stopOpacity={0.4} />
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

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: "emerald" | "rose" | "blue" | "purple";
}

interface TimeCardProps {
  title: string;
  value: string | number;
  color: "emerald" | "blue" | "amber" | "purple" | "indigo";
}

function Card({ title, value, icon, color }: CardProps) {
  const colors = {
    emerald: "from-emerald-400/50 via-emerald-500/60 to-emerald-600/70",
    rose: "from-rose-400/50 via-rose-500/60 to-rose-600/70",
    blue: "from-blue-400/50 via-blue-500/60 to-blue-600/70",
    purple: "from-purple-400/50 via-purple-500/60 to-purple-600/70",
  } as Record<CardProps["color"], string>;

  return (
    <div
      className={`group bg-linear-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl p-4 rounded-xl border-2 border-white/10 shadow-xl hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] hover:-translate-y-1 transition-all duration-400 cursor-pointer relative overflow-hidden ${colors[color]} ring-1 ring-white/5`}
    >
      <div className="absolute inset-0 bg-linear-to-r from-emerald-400/20 via-white/10 to-blue-400/20 opacity-0 group-hover:opacity-100 -skew-x-12 -translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 blur-xs -z-10" />

      <div className="relative z-10 text-center space-y-3 h-full flex flex-col justify-center">
        {/* 🔥 ICON CONTAINER - SAME AS TIMECARD */}
        <div
          className={`w-16 h-16 mx-auto ${colors[color]} rounded-2xl border-2 border-white/30 flex items-center justify-center shadow-xl group-hover:border-emerald-400/60 group-hover:shadow-emerald-400/40 group-hover:scale-105 transition-all duration-500 backdrop-blur-xl ring-2 ring-white/20`}
        >
          <div className="drop-shadow-xl">{icon}</div>
        </div>

        {/* 🔥 VALUE + TITLE - SAME AS TIMECARD */}
        <div className="space-y-1">
          <p className="text-xl font-black text-white drop-shadow-xl">
            {value}
          </p>
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wide">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
}

function TimeCard({ title, value, color }: TimeCardProps) {
  const colors = {
    emerald: "from-emerald-400/50 via-emerald-500/60 to-emerald-600/70",
    blue: "from-blue-400/50 via-blue-500/60 to-blue-600/70",
    amber: "from-amber-400/50 via-amber-500/60 to-amber-600/70",
    purple: "from-purple-400/50 via-purple-500/60 to-purple-600/70",
    indigo: "from-indigo-400/50 via-indigo-500/60 to-indigo-600/70",
  } as Record<TimeCardProps["color"], string>;

  const getIcon = (color: TimeCardProps["color"]) => {
    switch (color) {
      case "emerald":
        return <Clock className="w-5 h-5" />;
      case "blue":
        return <Activity className="w-5 h-5" />;
      case "amber":
        return <Clock className="w-5 h-5 rotate-12" />;
      case "purple":
        return <Clock className="w-5 h-5" />;
      case "indigo":
        return <Activity className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div
      className={`group bg-linear-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl p-4 rounded-xl border-2 border-white/10 shadow-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:-translate-y-1 transition-all duration-400 cursor-pointer relative overflow-hidden ${colors[color]} ring-1 ring-white/5`}
    >
      {/* 🔥 VIBRANT GLOW - SAME AS CARD */}
      <div className="absolute inset-0 bg-linear-to-br from-emerald-400/20 via-transparent to-blue-400/20 blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />

      <div className="relative z-10 text-center space-y-3 h-full flex flex-col justify-center">
        {/* 🔥 ICON CONTAINER - IDENTICAL TO CARD */}
        <div
          className={`p-3 rounded-xl ${colors[color]} border border-white/30 shadow-xl mx-auto w-16 h-16 flex items-center justify-center group-hover:scale-105 group-hover:shadow-emerald-400/40 group-hover:border-emerald-400/50 transition-all duration-400 backdrop-blur-xl ring-1 ring-white/20`}
        >
          <div className="drop-shadow-xl">{getIcon(color)}</div>
        </div>

        {/* 🔥 VALUE + TITLE - IDENTICAL TO CARD */}
        <div className="space-y-1">
          <p className="text-lg md:text-xl font-black text-white drop-shadow-xl">
            {value}
          </p>
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wide">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
}
