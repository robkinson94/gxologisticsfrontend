import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import Modal from "../components/Modal";
import Notification from "../components/Notification";
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
  const [isEditing, setIsEditing] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [newTeam, setNewTeam] = useState({
    name: "",
    description: "",
  });

  const [error, setError] = useState("");
  const [notification, setNotification] = useState({
    message: "",
    type: "success" as "success" | "error",
    show: false,
  });

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification.show) {
      const timeout = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [notification]);

  // Fetch Teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const { data } = await API.get("/teams/");
        setTeams(data);
      } catch (err) {
        setError("Failed to load teams.");
        console.error("Error fetching teams:", err);
      }
    };

    fetchTeams();
  }, []);

  // Handle Add or Update Team
  const handleSaveTeam = async () => {
    if (isEditing && editingTeam) {
      // Update existing team
      try {
        const { data, status } = await API.put(
          `/teams/${editingTeam.id}/`,
          newTeam
        );
        if (status === 200 || status === 201) {
          setNotification({
            message: "Team updated successfully",
            type: "success",
            show: true,
          });
        }
        setTeams(
          teams.map((team) => (team.id === editingTeam.id ? data : team))
        );
        setIsModalOpen(false);
        setIsEditing(false);
        setEditingTeam(null);
      } catch (err: any) {
        if (err.response && err.response.status === 403) {
          setNotification({
            message: "Only admins are allowed to perform this action",
            type: "error",
            show: true,
          });
        } else {
          setNotification({
            message: "Failed to update team",
            type: "error",
            show: true,
          });
        }
        console.error("Error updating team:", err);
      }
    } else {
      // Add new team
      try {
        const { data, status } = await API.post("/teams/", newTeam);
        if (status === 200 || status === 201) {
          setNotification({
            message: "Team added successfully",
            type: "success",
            show: true,
          });
        }
        setTeams([...teams, data]);
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
            message: "Failed to add team",
            type: "error",
            show: true,
          });
        }
        console.error("Error adding team:", err);
      }
    }

    // Reset form
    setNewTeam({ name: "", description: "" });
  };

  // Handle Delete Team
  const handleDeleteTeam = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      try {
        const { status } = await API.delete(`/teams/${id}/`);
        if (status === 200 || status === 204) {
          setNotification({
            message: "Team deleted successfully",
            type: "success",
            show: true,
          });
        }
        setTeams(teams.filter((team) => team.id !== id));
      } catch (err: any) {
        if (err.response && err.response.status === 403) {
          setNotification({
            message: "Only admins are allowed to perform this action",
            type: "error",
            show: true,
          });
        } else {
          setNotification({
            message: "Failed to delete team",
            type: "error",
            show: true,
          });
        }
        console.error("Error deleting team:", err);
      }
    }
  };

  // Open Edit Modal
  const openEditModal = (team: Team) => {
    setEditingTeam(team);
    setNewTeam({
      name: team.name,
      description: team.description,
    });
    setIsModalOpen(true);
    setIsEditing(true);
  };

  // Debugging: Ensure teams array is correctly populated
  return (
    <div>
      <NavBar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Teams</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          onClick={() => {
            setIsModalOpen(true);
            setIsEditing(false);
            setNewTeam({ name: "", description: "" });
          }}
          className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Team
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
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr key={team.id} className="hover:bg-gray-100 text-center">
                <td className="border border-gray-300 px-4 py-2">{team.id}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {team.name}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {team.description}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => openEditModal(team)}
                    className="text-yellow-500 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(team.id)}
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
        title={isEditing ? "Edit Team" : "Add Team"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTeam}
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
