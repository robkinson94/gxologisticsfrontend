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
  const [loading, setLoading] = useState(true); // Loading state
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
      } finally {
        setLoading(false); // Stop loading spinner
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
        handleApiError(err, "Failed to update team");
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
        handleApiError(err, "Failed to add team");
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
        handleApiError(err, "Failed to delete team");
      }
    }
  };

  const handleApiError = (err: any, defaultMessage: string) => {
    if (err.response && err.response.status === 403) {
      setNotification({
        message: "Only admins are allowed to perform this action",
        type: "error",
        show: true,
      });
    } else {
      setNotification({
        message: defaultMessage,
        type: "error",
        show: true,
      });
    }
    console.error(defaultMessage, err);
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

  const LoadingSpinner = () => (
    <div role="status" className="flex justify-center my-4">
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
  );

  return (
    <div>
      <NavBar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Teams</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
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
                  <th className="border border-gray-300 px-4 py-2">
                    Description
                  </th>
                  <th className="border border-gray-300 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr key={team.id} className="hover:bg-gray-100 text-center">
                    <td className="border border-gray-300 px-4 py-2">
                      {team.id}
                    </td>
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
          </>
        )}
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
