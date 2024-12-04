import React from "react";
import Summary from "./Summary";
import NavBar from "../components/NavBar";

const Dashboard: React.FC = () => {
  return (
    <div>
      <NavBar />
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex space-x-4 mt-6">
          <Summary />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
