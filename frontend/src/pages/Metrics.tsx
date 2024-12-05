import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import Modal from "../components/Modal";
import Notification from "../components/Notification";
import API from "../api";

// Define the Metric type
interface Metric {
  id: number;
  name: string;
  description: string;
  target: number;
}

const Metrics: React.FC = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMetric, setEditingMetric] = useState<Metric | null>(null);
  const [newMetric, setNewMetric] = useState({
    name: "",
    description: "",
    target: "",
  });
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

  const [error, setError] = useState("");

  // Fetch Metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data } = await API.get("/metrics/");

        console.log("Fetched Metrics Data:", data); // Debug fetched data
        setMetrics(data);
      } catch (err) {
        setError("Failed to load metrics.");
        console.error("Error fetching metrics:", err);
      }
    };

    fetchMetrics();
  }, []);

  // Handle Add or Update Metric
  const handleSaveMetric = async () => {
    if (isEditing && editingMetric) {
      // Update existing metric
      try {
        const { data, status } = await API.put(
          `/metrics/${editingMetric.id}/`,
          newMetric
        );
        if (status === 200 || status === 201) {
          setNotification({
            message: "Metric updated successfully",
            type: "success",
            show: true,
          });
        }
        setMetrics(
          metrics.map((metric) =>
            metric.id === editingMetric.id ? data : metric
          )
        );
        setIsModalOpen(false);
        setIsEditing(false);
        setEditingMetric(null);
      } catch (err: any) {
        if (err.response?.status === 403) {
          setNotification({
            message: "Only admins are allowed to perform this action",
            type: "error",
            show: true,
          });
        } else {
          setNotification({
            message: "Failed to update metric",
            type: "error",
            show: true,
          });
        }
        console.error("Error updating metric:", err);
      }
    } else {
      // Add new metric
      try {
        const { data, status } = await API.post("/metrics/", newMetric);
        if (status === 200 || status === 201) {
          setNotification({
            message: "Metric added successfully",
            type: "success",
            show: true,
          });
        }
        setMetrics([...metrics, data]);
        setIsModalOpen(false);
      } catch (err: any) {
        if (err.response?.status === 403) {
          setNotification({
            message: "Only admins are allowed to perform this action",
            type: "error",
            show: true,
          });
        } else {
          setNotification({
            message: "Failed to add metric",
            type: "error",
            show: true,
          });
        }
        console.error("Error adding metric:", err);
      }
    }

    // Reset form
    setNewMetric({ name: "", description: "", target: "" });
  };

  // Handle Delete Metric
  const handleDeleteMetric = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this metric?")) {
      try {
        const { status } = await API.delete(`/metrics/${id}/`);
        if (status === 200 || status === 204) {
          setNotification({
            message: "Metric deleted successfully",
            type: "success",
            show: true,
          });
        }
        setMetrics(metrics.filter((metric) => metric.id !== id));
      } catch (err: any) {
        if (err.response && err.response.status === 403) {
          setNotification({
            message: "Only admins are allowed to perform this action",
            type: "error",
            show: true,
          });
        } else {
          setNotification({
            message: "Failed to delete metric",
            type: "error",
            show: true,
          });
        }
        console.error("Error deleting metric:", err);
      }
    }
  };

  // Open Edit Modal
  const openEditModal = (metric: Metric) => {
    setEditingMetric(metric);
    setNewMetric({
      name: metric.name,
      description: metric.description,
      target: metric.target.toString(),
    });
    setIsModalOpen(true);
    setIsEditing(true);
  };

  // Debugging: Ensure metrics array is correctly populated
  console.log("Metrics State:", metrics);

  return (
    <div>
      <NavBar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Metrics</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          onClick={() => {
            setIsModalOpen(true);
            setIsEditing(false);
            setNewMetric({ name: "", description: "", target: "" });
          }}
          className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Metric
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
              <th className="border border-gray-300 px-4 py-2">ID</th>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Description</th>
              <th className="border border-gray-300 px-4 py-2">Target</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric.id} className="hover:bg-gray-100 text-center">
                <td className="border border-gray-300 px-4 py-2">
                  {metric.id}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {metric.name}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {metric.description}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {metric.target}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => openEditModal(metric)}
                    className="text-yellow-500 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteMetric(metric.id)}
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
        title={isEditing ? "Edit Metric" : "Add Metric"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMetric}
      >
        <form>
          <label className="block mb-2">
            Name
            <input
              type="text"
              value={newMetric.name}
              onChange={(e) =>
                setNewMetric({ ...newMetric, name: e.target.value })
              }
              className="block w-full mb-4 p-2 border"
              placeholder="Enter metric name"
              required
            />
          </label>
          <label className="block mb-2">
            Description
            <input
              type="text"
              value={newMetric.description}
              onChange={(e) =>
                setNewMetric({ ...newMetric, description: e.target.value })
              }
              className="block w-full mb-4 p-2 border"
              placeholder="Enter description"
              required
            />
          </label>
          <label className="block mb-2">
            Target
            <input
              type="number"
              value={newMetric.target}
              onChange={(e) =>
                setNewMetric({ ...newMetric, target: e.target.value })
              }
              className="block w-full mb-4 p-2 border"
              placeholder="Enter target value"
              required
            />
          </label>
        </form>
      </Modal>
    </div>
  );
};

export default Metrics;
