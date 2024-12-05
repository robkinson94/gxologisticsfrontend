import React from "react";
import { Link } from "react-router-dom";

const NavBar: React.FC = () => {
  return (
    <nav className="bg-blue-500 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-lg font-bold">GXO Logistics</h1>
        <div className="space-x-4">
          <Link to="/dashboard" className="hover:underline">
            Dashboard
          </Link>
          <Link to="/metrics" className="hover:underline">
            Metrics
          </Link>
          <Link to="/records" className="hover:underline">
            Records
          </Link>
          <Link to="/teams" className="hover:underline">
            Teams
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
