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
import NavBar from "../components/NavBar";

const COLORS = ["#ff3a00", "#2e3033", "#f0f0f0", "#1c1c1c", "#e0e0e0"];

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
  const [totals, setTotals] = useState({
    totalMetrics: 0,
    totalTeams: 0,
    totalRecords: 0,
  });
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const { data } = await API.get("/summary/");
        setSummaryData(data);

        // Compute totals dynamically
        const totalMetrics = new Set(
          data.metricTeamData.map(
            (item: { metric__name: string }) => item.metric__name
          )
        ).size;
        const totalTeams = new Set(
          data.metricTeamData.map(
            (item: { team__name: string }) => item.team__name
          )
        ).size;
        const totalRecords = data.recordsByTeam.reduce(
          (sum: number, item: { total_records: number }) =>
            sum + item.total_records,
          0
        );

        setTotals({ totalMetrics, totalTeams, totalRecords });
      } catch (err) {
        console.error("Failed to load summary data.");
      } finally {
        setLoading(false); // Stop loading spinner
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

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-full">
      <div role="status">
        <svg
          aria-hidden="true"
          className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-100 min-h-screen">
      <NavBar />
      <div className="p-6 max-w-7xl mx-auto">
        {/* Key Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {loading ? (
            <div className="col-span-3">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <div className="bg-[#fff3a00] text-[#f0f0f0] shadow rounded p-6">
                <h3 className="text-lg font-bold">Total Metrics</h3>
                <p className="text-3xl font-semibold">{totals.totalMetrics}</p>
              </div>
              <div className="bg-[#2e3033] text-[#f0f0f0] shadow rounded p-6">
                <h3 className="text-lg font-bold">Total Teams</h3>
                <p className="text-3xl font-semibold">{totals.totalTeams}</p>
              </div>
              <div className="bg-[#f0f0f0] text-[#2e3033] shadow rounded p-6">
                <h3 className="text-lg font-bold">Total Records</h3>
                <p className="text-3xl font-semibold">{totals.totalRecords}</p>
              </div>
            </>
          )}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2">
              <LoadingSpinner />
            </div>
          ) : (
            <>
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
                      new Set(
                        summaryData.metricTeamData.map((d) => d.team__name)
                      )
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
                <h2 className="text-lg font-bold mb-4">
                  Record Trends Over Time
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={summaryData.recordTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(tick) =>
                        new Date(tick).toLocaleDateString()
                      }
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total_value"
                      stroke="#82ca9d"
                    />
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Summary;
