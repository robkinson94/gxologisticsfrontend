import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import API from "../api";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#845EC2"];

interface SummaryData {
  metricTeamData: {
    metric__name: string;
    team__name: string;
    total_value: number;
  }[];
  recordsByTeam: { team__name: string; total_records: number }[];
  recordTrends: { timestamp: string; total_value: number }[];
  teamContributions: { team__name: string; total_value: number }[];
}

const Summary: React.FC = () => {
  const [summaryData, setSummaryData] = useState<SummaryData>({
    metricTeamData: [],
    recordsByTeam: [],
    recordTrends: [],
    teamContributions: [],
  });

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const { data } = await API.get("/summary/");
        setSummaryData(data);
      } catch (err) {
        console.error("Failed to load summary data.");
      }
    };

    fetchSummaryData();
  }, []);

  // Transform data for Stacked Bar Chart
  const stackedData = summaryData.metricTeamData.reduce((acc: any[], item) => {
    const existingMetric = acc.find((m) => m.metric === item.metric__name);
    if (existingMetric) {
      existingMetric[item.team__name] = item.total_value;
    } else {
      acc.push({
        metric: item.metric__name,
        [item.team__name]: item.total_value,
      });
    }
    return acc;
  }, []);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stacked Bar Chart */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-bold mb-4">
            Team Contributions by Metric
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stackedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Array.from(
                new Set(summaryData.metricTeamData.map((d) => d.team__name))
              ).map((team, index) => (
                <Bar
                  key={team}
                  dataKey={team}
                  stackId="a"
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-bold mb-4">Records by Team</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={summaryData.recordsByTeam}
                dataKey="total_records"
                nameKey="team__name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {summaryData.recordsByTeam.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-bold mb-4">Record Trends Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={summaryData.recordTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(tick) => new Date(tick).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total_value" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Area Chart */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-bold mb-4">
            Total Contributions by Team
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={summaryData.teamContributions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="team__name" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="total_value"
                fill="#8884d8"
                stroke="#8884d8"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Summary;
