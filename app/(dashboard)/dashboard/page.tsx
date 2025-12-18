"use client";

import { useEffect, useState } from "react";
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

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/agent/activity-report`
        );

        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p className="text-gray-700">Loading...</p>;

  // Define the type for chart data
  interface ChartData {
    date: string;
    answered: number;
    dropped: number;
  }

  return (
    <div className="space-y-8 text-white-700">
      <h1 className="text-3xl font-bold"></h1>

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
      <div className="bg-[#0a1d2c] p-6 rounded-xl shadow-2xl">
        <h2 className="text-xl mb-4 text-white-700">
          Last 7 Days Agent Performance
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data.chart.dates.map(
              (date: string, i: number): ChartData => ({
                date: date, // 'date' as string
                answered: data.chart.answered[i], // answered count
                dropped: data.chart.dropped[i], // dropped count
              })
            )}
          >
            {/* X-Axis Configuration */}
            <XAxis
              dataKey="date"
              stroke="#ffffff"
              tick={{ fontSize: 12 }} // Adjust tick font size
              angle={0} // Set angle to 0 for horizontal text
              textAnchor="middle" // Ensure text is centered
              interval={0} // Show all labels
            />

            {/* Y-Axis Configuration */}
            <YAxis
              stroke="#ffffff"
              tick={{ fontSize: 12 }}
              domain={[0, "auto"]} // Automatically adjust max value
            />

            {/* Tooltip Configuration */}
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "5px",
                padding: "10px",
              }} // Custom tooltip styling
              labelStyle={{ color: "#374151" }} // Label color
              itemStyle={{ color: "#374151" }} // Item color
            />

            {/* Bar Chart Configuration */}
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
    </div>
  );
}

/* ------------------ COMPONENTS ------------------ */
function Card({ title, value }: any) {
  return (
    <div className="bg-[#0a1d2c] p-6 rounded-xl shadow-2xl text-white-700 ">
      <p className="text-sm font-bold text-center">{title}</p>
      <p className="text-md mt-2 text-center">{value}</p>
    </div>
  );
}

function TimeCard({ title, value }: any) {
  return (
    <div className="bg-[#0a1d2c] p-6 rounded-xl text-center shadow-2xl">
      <p className="text-sm font-bold">{title}</p>
      <p className="text-md mt-1">{value}</p>
    </div>
  );
}
