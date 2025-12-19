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
    {
      refreshInterval: 30000,
      revalidateOnFocus: false,
    }
  );

  if (error) {
    return <p className="text-red-500">Failed to load dashboard</p>;
  }

  return (
    <div className="space-y-8">
      {/* SUMMARY */}
      {isLoading ? (
        <SummarySkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card title="Answered Calls" value={data.summary.answered} />
          <Card title="Dropped Calls" value={data.summary.dropped} />
          <Card title="Login Time" value={data.summary.login} />
          <Card title="Logout Time" value={data.summary.logout} />
        </div>
      )}

      {/* ACTIVITY */}
      {isLoading ? (
        <ActivitySkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <TimeCard title="Login Hours" value={data.activity.loginHour} />
          <TimeCard title="Active Hours" value={data.activity.activeHour} />
          <TimeCard title="Idle Hours" value={data.activity.idleHour} />
          <TimeCard title="Break" value={data.activity.breakHour} />
          <TimeCard title="Training" value={data.activity.trainingBreakHour} />
        </div>
      )}

      {/* CHART */}
      {isLoading ? (
        <ChartSkeleton />
      ) : (
        <div className="bg-[#0a1d2c] p-6 rounded-xl shadow-2xl">
          <h2 className="text-xl mb-4">Last 7 Days Agent Performance</h2>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data.chart.dates.map((date: string, i: number) => ({
                date,
                answered: data.chart.answered[i],
                dropped: data.chart.dropped[i],
              }))}
            >
              <XAxis dataKey="date" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip
                cursor={{ fill: "rgba(0, 0, 0, 0.4)" }}
                contentStyle={{
                  backgroundColor: "#000",
                  border: "none",
                  borderRadius: "6px",
                  color: "#fff",
                }}
                labelStyle={{
                  color: "#fff",
                  fontWeight: 600,
                }}
                itemStyle={{
                  color: "#fff",
                }}
              />

              <Legend />
              <Bar
                dataKey="answered" // Keep lowercase to match the data property
                name="Answered Calls" // Set custom name for legend (uppercase)
                fill="#5E6623"
                barSize={30} // Set the width of the bars
              />
              <Bar
                dataKey="dropped" // Keep lowercase to match the data property
                name="Dropped Calls" // Set custom name for legend (uppercase)
                fill="#893941"
                barSize={30} // Set the width of the bars
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/* ------------------ REUSABLE CARDS ------------------ */
function Card({ title, value }: { title: string; value: any }) {
  return (
    <div className="bg-[#0a1d2c] p-6 rounded-xl shadow-2xl text-center">
      <p className="text-sm font-bold">{title}</p>
      <p className="text-md mt-2">{value}</p>
    </div>
  );
}

function TimeCard({ title, value }: { title: string; value: any }) {
  return (
    <div className="bg-[#0a1d2c] p-6 rounded-xl text-center shadow-2xl">
      <p className="text-sm font-bold">{title}</p>
      <p className="text-md mt-1">{value}</p>
    </div>
  );
}
