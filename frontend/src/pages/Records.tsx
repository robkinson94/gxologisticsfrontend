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
  timestamp: string;
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
  const [newRecord, setNewRecord] = useState<{
    metric: string | number;
    team: string | number;
    value: string;
    timestamp: string;
  }>({
    metric: "",
    team: "",
    value: "",
    timestamp: "",
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

    setNewRecord({ metric: "", team: "", value: "", timestamp: "" });
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
    console.log("Editing Record:", record); // Debugging log
    setEditingRecord(record);
    setNewRecord({
      // Match metric name to ID
      metric:
        metrics.find((metric) => metric.name === record.metric_name)?.id || "",
      // Match team name to ID
      team: teams.find((team) => team.name === record.team_name)?.id || "",
      value: record.value.toString(),
      timestamp: record.timestamp, // Keep timestamp as is
    });
    setIsModalOpen(true);
    setIsEditing(true);
  };

  // Table Headers and Data
  const headers = ["ID", "Metric Name", "Team Name", "Value", "Timestamp"];

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
            setNewRecord({ metric: "", team: "", value: "", timestamp: "" });
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
        <table className="min-w-full border-collapse border border-gray-200">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="border border-gray-300 px-4 py-2">
                  {header}
                </th>
              ))}
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
                  {new Date(record.timestamp).toLocaleString()}
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
            Timestamp
            <input
              type="datetime-local"
              value={newRecord.timestamp}
              onChange={(e) =>
                setNewRecord({ ...newRecord, timestamp: e.target.value })
              }
              className="block w-full mb-4 p-2 border"
              placeholder="Select timestamp"
              required
            />
          </label>
        </form>
      </Modal>
    </div>
  );
};

export default Records;
