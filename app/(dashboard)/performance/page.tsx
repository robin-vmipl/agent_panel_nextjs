"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { apiFetch } from "../../lib/api";

export default function PerformancePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/agent/activity-report`)
      .then(setData)
      .catch((err) => console.error(err));
  }, []);

  if (!data) return <p className="text-white">Loading...</p>;

  return (
    <div className="space-y-8 text-white">
      <h1 className="text-3xl font-bold">My Performance</h1>

      {/* CALL SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card title="Answered Calls" value={data.summary.answered} />
        <Card title="Dropped Calls" value={data.summary.dropped} />
        <Card title="Login Time" value={data.summary.login} />
        <Card title="Logout Time" value={data.summary.logout} />
      </div>

      {/* ACTIVITY */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        <TimeCard title="Login Hours" value={data.activity.loginHour} />
        <TimeCard title="Active Hours" value={data.activity.activeHour} />
        <TimeCard title="Idle Hours" value={data.activity.idleHour} />
        <TimeCard title="Break" value={data.activity.breakHour} />
        <TimeCard title="Training" value={data.activity.trainingBreakHour} />
      </div>

      {/* GRAPH */}
      <div className="bg-[#11120D] p-6 rounded-xl">
        <h2 className="text-xl mb-4 text-white">
          Last 7 Days Agent Performance
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data.chart.dates.map((d: string, i: number) => ({
              date: d,
              answered: data.chart.answered[i],
              dropped: data.chart.dropped[i],
            }))}
          >
            <XAxis dataKey="date" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip />
            <Legend />
            <Bar dataKey="answered" fill="#86be86" />
            <Bar dataKey="dropped" fill="#ccbb83" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div className="bg-[#D8CFBC] p-6 rounded-xl shadow text-black">
      <p className="text-sm">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}

function TimeCard({ title, value }: any) {
  return (
    <div className="bg-[#6B6A5A] p-4 rounded-xl text-center">
      <p className="text-sm">{title}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}
