import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import Table from "../components/Table";
import Modal from "../components/Modal";
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
  const [newMetric, setNewMetric] = useState({
    name: "",
    description: "",
    target: "",
  });

  const [error, setError] = useState("");

  // Fetch Metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data } = await API.get("/metrics/");
        setMetrics(data);
      } catch (err) {
        setError("Failed to load metrics.");
      }
    };

    fetchMetrics();
  }, []);

  // Handle Add Metric
  const handleAddMetric = async () => {
    try {
      const { data } = await API.post("/metrics/", newMetric);
      setMetrics([...metrics, data]);
      setIsModalOpen(false);
      setNewMetric({ name: "", description: "", target: "" });
    } catch (err) {
      setError("Failed to add metric.");
    }
  };

  return (
    <div>
      <NavBar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Metrics</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          onClick={() => setIsModalOpen(true)}
          className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Metric
        </button>
        <Table
          headers={["ID", "Name", "Description", "Target"]}
          data={metrics}
          actions={(item) => (
            <>
              <button className="text-yellow-500 mr-2">Edit</button>
              <button className="text-red-500">Delete</button>
            </>
          )}
        />
      </div>
      <Modal
        title="Add Metric"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddMetric}
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
