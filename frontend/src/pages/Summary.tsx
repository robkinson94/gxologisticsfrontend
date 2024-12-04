import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import API from "../api";

interface SummaryData {
  totalTeams: number;
  totalMetrics: number;
  totalRecords: number;
  recordTrends: { timestamp: string; value: number }[]; // For line chart
}

const Summary: React.FC = () => {
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalTeams: 0,
    totalMetrics: 0,
    totalRecords: 0,
    recordTrends: [],
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const { data } = await API.get("/summary/"); // Backend endpoint for summary
        setSummaryData(data);
      } catch (err) {
        setError("Failed to load summary data.");
      }
    };

    fetchSummaryData();
  }, []);

  return (
    <div>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Summary</h1>
        {error && <p className="text-red-500">{error}</p>}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-100 p-4 rounded shadow">
            <h2 className="text-lg font-bold">Total Teams</h2>
            <p className="text-2xl">{summaryData.totalTeams}</p>
          </div>
          <div className="bg-green-100 p-4 rounded shadow">
            <h2 className="text-lg font-bold">Total Metrics</h2>
            <p className="text-2xl">{summaryData.totalMetrics}</p>
          </div>
          <div className="bg-purple-100 p-4 rounded shadow">
            <h2 className="text-lg font-bold">Total Records</h2>
            <p className="text-2xl">{summaryData.totalRecords}</p>
          </div>
        </div>

        {/* Record Trends Chart */}
        <h2 className="text-xl font-bold mt-8">Record Trends</h2>
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={summaryData.recordTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(tick) => new Date(tick).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Summary;
