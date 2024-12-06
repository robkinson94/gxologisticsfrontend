import React from "react";
import { Link, useNavigate } from "react-router-dom";

const NavBar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  return (
    <nav className="bg-blue-500 text-white">
      <div className="container mx-auto flex flex-wrap items-center justify-between p-4">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">GXO Logistics</h1>
        </div>

        {/* Menu for larger screens */}
        <div className="hidden md:flex space-x-4">
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
          <button
            onClick={handleLogout}
            className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition duration-300"
          >
            Logout
          </button>
        </div>

        {/* Hamburger menu for mobile */}
        <div className="md:hidden">
          <button
            className="text-white focus:outline-none"
            onClick={() =>
              document.getElementById("mobile-menu")?.classList.toggle("hidden")
            }
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className="hidden md:hidden bg-blue-400 text-white px-4 py-2"
      >
        <Link to="/dashboard" className="block py-2 hover:bg-blue-600 rounded">
          Dashboard
        </Link>
        <Link to="/metrics" className="block py-2 hover:bg-blue-600 rounded">
          Metrics
        </Link>
        <Link to="/records" className="block py-2 hover:bg-blue-600 rounded">
          Records
        </Link>
        <Link to="/teams" className="block py-2 hover:bg-blue-600 rounded">
          Teams
        </Link>
        <button
          onClick={handleLogout}
          className="block w-full text-left bg-red-600 py-2 mt-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
