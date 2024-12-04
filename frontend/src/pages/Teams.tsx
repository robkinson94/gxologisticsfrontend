import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import Table from "../components/Table";
import Modal from "../components/Modal";
import API from "../api";

// Define the Team type
interface Team {
  id: number;
  name: string;
  description: string;
}

const Teams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: "",
    description: "",
  });

  const [error, setError] = useState("");

  // Fetch Teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const { data } = await API.get("/teams/");
        setTeams(data);
      } catch (err) {
        setError("Failed to load teams.");
      }
    };

    fetchTeams();
  }, []);

  // Handle Add Team
  const handleAddTeam = async () => {
    try {
      const { data } = await API.post("/teams/", newTeam);
      setTeams([...teams, data]);
      setIsModalOpen(false);
      setNewTeam({ name: "", description: "" });
    } catch (err) {
      setError("Failed to add team.");
    }
  };

  return (
    <div>
      <NavBar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Teams</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          onClick={() => setIsModalOpen(true)}
          className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Team
        </button>
        <Table
          headers={["ID", "Name", "Description"]}
          data={teams}
          actions={(item) => (
            <>
              <button className="text-yellow-500 mr-2">Edit</button>
              <button className="text-red-500">Delete</button>
            </>
          )}
        />
      </div>
      <Modal
        title="Add Team"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddTeam}
      >
        <form>
          <label className="block mb-2">
            Name
            <input
              type="text"
              value={newTeam.name}
              onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
              className="block w-full mb-4 p-2 border"
              placeholder="Enter team name"
              required
            />
          </label>
          <label className="block mb-2">
            Description
            <input
              type="text"
              value={newTeam.description}
              onChange={(e) =>
                setNewTeam({ ...newTeam, description: e.target.value })
              }
              className="block w-full mb-4 p-2 border"
              placeholder="Enter description"
              required
            />
          </label>
        </form>
      </Modal>
    </div>
  );
};

export default Teams;
