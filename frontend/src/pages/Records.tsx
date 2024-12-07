import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import Modal from "../components/Modal";
import Notification from "../components/Notification"; // Import Notification Component
import API from "../api";

interface Record {
  id: number;
  metric_name: string;
  team_name: string;
  value: number;
  recorded_at: string;
}

interface Metric {
  id: number;
  name: string;
  target: number;
}

interface Team {
  id: number;
  name: string;
}

const Records: React.FC = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [newRecord, setNewRecord] = useState<{
    metric: string | number;
    team: string | number;
    value: string;
    recorded_at: string;
  }>({
    metric: "",
    team: "",
    value: "",
    recorded_at: "",
  });

  const [selectedMetricTarget, setSelectedMetricTarget] = useState<
    number | null
  >(null);
  const [error, setError] = useState("");

  const [notification, setNotification] = useState({
    message: "",
    type: "success" as "success" | "error",
    show: false,
  });

  useEffect(() => {
    if (notification.show) {
      const timeout = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [notification]);

  // Fetch Records, Metrics, and Teams
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const { data } = await API.get("/records/");
        setRecords(data);
      } catch (err) {
        setError("Failed to load records.");
        console.error("Error fetching records:", err);
      }
    };

    const fetchMetrics = async () => {
      try {
        const { data } = await API.get("/metrics/");
        setMetrics(data);
      } catch (err) {
        setError("Failed to load metrics.");
      }
    };

    const fetchTeams = async () => {
      try {
        const { data } = await API.get("/teams/");
        setTeams(data);
      } catch (err) {
        setError("Failed to load teams.");
      }
    };

    fetchRecords();
    fetchMetrics();
    fetchTeams();
    setLoading(false);
  }, []);

  const handleMetricChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMetricId = e.target.value;
    setNewRecord({ ...newRecord, metric: selectedMetricId });

    const selectedMetric = metrics.find(
      (metric) => metric.id.toString() === selectedMetricId
    );
    setSelectedMetricTarget(selectedMetric ? selectedMetric.target : null);
  };

  const handleSaveRecord = async () => {
    if (isEditing && editingRecord) {
      try {
        const { data, status } = await API.put(
          `/records/${editingRecord.id}/`,
          newRecord
        );
        if (status === 200 || status === 201) {
          setNotification({
            message: "Record updated successfully",
            type: "success",
            show: true,
          });
        }
        setRecords(
          records.map((rec) => (rec.id === editingRecord.id ? data : rec))
        );
        setIsModalOpen(false);
        setIsEditing(false);
        setEditingRecord(null);
      } catch (err: any) {
        if (err.response && err.response.status === 403) {
          setNotification({
            message: "Only admins are allowed to perform this action",
            type: "error",
            show: true,
          });
        } else {
          setNotification({
            message: "Failed to update record",
            type: "error",
            show: true,
          });
        }
        console.error("Error updating record:", err);
      }
    } else {
      try {
        const { data, status } = await API.post("/records/", newRecord);
        if (status === 200 || status === 201) {
          setNotification({
            message: "Record added successfully",
            type: "success",
            show: true,
          });
        }
        setRecords([...records, data]);
        setIsModalOpen(false);
      } catch (err: any) {
        if (err.response && err.response.status === 403) {
          setNotification({
            message: "Only admins are allowed to perform this action",
            type: "error",
            show: true,
          });
        } else {
          setNotification({
            message: "Failed to add record",
            type: "error",
            show: true,
          });
        }
        console.error("Error adding record:", err);
      }
    }

    setNewRecord({ metric: "", team: "", value: "", recorded_at: "" });
    setSelectedMetricTarget(null);
  };

  const handleDeleteRecord = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        const { status } = await API.delete(`/records/${id}/`);
        if (status === 200 || status === 204) {
          setNotification({
            message: "Record deleted successfully",
            type: "success",
            show: true,
          });
        }
        setRecords(records.filter((rec) => rec.id !== id));
      } catch (err: any) {
        if (err.response && err.response.status === 403) {
          setNotification({
            message: "Only admins are allowed to perform this action",
            type: "error",
            show: true,
          });
        } else {
          setNotification({
            message: "Failed to delete record",
            type: "error",
            show: true,
          });
        }
        console.error("Error deleting record:", err);
      }
    }
  };

  // Open Edit Modal
  const openEditModal = (record: Record) => {
    setEditingRecord(record);
    setNewRecord({
      // Match metric name to ID
      metric:
        metrics.find((metric) => metric.name === record.metric_name)?.id || "",
      // Match team name to ID
      team: teams.find((team) => team.name === record.team_name)?.id || "",
      value: record.value.toString(),
      recorded_at: record.recorded_at, // Keep recorded_at as is
    });
    setIsModalOpen(true);
    setIsEditing(true);
  };

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-6">
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
    <div>
      <NavBar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Records</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          onClick={() => {
            setIsModalOpen(true);
            setIsEditing(false);
            setNewRecord({ metric: "", team: "", value: "", recorded_at: "" });
          }}
          className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Record
        </button>
        <Notification
          message={notification.message}
          type={notification.type}
          show={notification.show}
          onClose={() => setNotification({ ...notification, show: false })}
        />
        {loading ? (
          <LoadingSpinner />
        ) : (
          <table className="min-w-full border-collapse border border-gray-200">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">ID</th>
                <th className="border border-gray-300 px-4 py-2">
                  Metric Name
                </th>
                <th className="border border-gray-300 px-4 py-2">Team Name</th>
                <th className="border border-gray-300 px-4 py-2">Value</th>
                <th className="border border-gray-300 px-4 py-2">
                  Recorded At
                </th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-100 text-center">
                  <td className="border border-gray-300 px-4 py-2">
                    {record.id}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {record.metric_name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {record.team_name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {record.value}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(record.recorded_at).toLocaleString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      onClick={() => openEditModal(record)}
                      className="text-yellow-500 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(record.id)}
                      className="text-red-500"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Modal
        title={isEditing ? "Edit Record" : "Add Record"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRecord}
      >
        <form>
          <label className="block mb-2">
            Metric
            <select
              value={newRecord.metric}
              onChange={handleMetricChange}
              className="block w-full mb-4 p-2 border"
              required
            >
              <option value="" disabled>
                Select a metric
              </option>
              {metrics.map((metric) => (
                <option key={metric.id} value={metric.id}>
                  {metric.name}
                </option>
              ))}
            </select>
          </label>
          {selectedMetricTarget !== null && (
            <p className="text-gray-700 mb-4">
              Target: <span className="font-bold">{selectedMetricTarget}</span>
            </p>
          )}
          <label className="block mb-2">
            Team
            <select
              value={newRecord.team}
              onChange={(e) =>
                setNewRecord({ ...newRecord, team: e.target.value })
              }
              className="block w-full mb-4 p-2 border"
              required
            >
              <option value="" disabled>
                Select a team
              </option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block mb-2">
            Value
            <input
              type="number"
              value={newRecord.value}
              onChange={(e) =>
                setNewRecord({ ...newRecord, value: e.target.value })
              }
              className="block w-full mb-4 p-2 border"
              placeholder="Enter value"
              required
            />
          </label>
          <label className="block mb-2">
            Recorded At
            <input
              type="datetime-local"
              value={newRecord.recorded_at}
              onChange={(e) =>
                setNewRecord({ ...newRecord, recorded_at: e.target.value })
              }
              className="block w-full mb-4 p-2 border"
              placeholder="Select recorded at"
              required
            />
          </label>
        </form>
      </Modal>
    </div>
  );
};

export default Records;
