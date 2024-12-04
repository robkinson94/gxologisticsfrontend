import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import Table from "../components/Table";
import Modal from "../components/Modal";
import API from "../api";

interface Record {
  id: number;
  metric: string;
  team: string;
  value: number;
  timestamp: string;
}

const Records: React.FC = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    metric: "",
    team: "",
    value: "",
    timestamp: "",
  });

  const [error, setError] = useState("");

  // Fetch Records
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const { data } = await API.get("/records/");
        setRecords(data);
      } catch (err) {
        setError("Failed to load records.");
      }
    };

    fetchRecords();
  }, []);

  // Handle Add Record
  const handleAddRecord = async () => {
    try {
      const { data } = await API.post("/records/", newRecord);
      setRecords([...records, data]);
      setIsModalOpen(false);
      setNewRecord({ metric: "", team: "", value: "", timestamp: "" });
    } catch (err) {
      setError("Failed to add record.");
    }
  };

  return (
    <div>
      <NavBar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Records</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          onClick={() => setIsModalOpen(true)}
          className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Record
        </button>
        <Table
          headers={["ID", "Metric", "Team", "Value", "Timestamp"]}
          data={records}
          actions={(item) => (
            <>
              <button className="text-yellow-500 mr-2">Edit</button>
              <button className="text-red-500">Delete</button>
            </>
          )}
        />
      </div>
      <Modal
        title="Add Record"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddRecord}
      >
        <form>
          <label className="block mb-2">
            Metric ID
            <input
              type="text"
              value={newRecord.metric}
              onChange={(e) =>
                setNewRecord({ ...newRecord, metric: e.target.value })
              }
              className="block w-full mb-4 p-2 border"
              placeholder="Enter metric ID"
              required
            />
          </label>
          <label className="block mb-2">
            Team ID
            <input
              type="text"
              value={newRecord.team}
              onChange={(e) =>
                setNewRecord({ ...newRecord, team: e.target.value })
              }
              className="block w-full mb-4 p-2 border"
              placeholder="Enter team ID"
              required
            />
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
