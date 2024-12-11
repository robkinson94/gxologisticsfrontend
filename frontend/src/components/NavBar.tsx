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
    <nav className="bg-[#2E3033] text-white">
      <div className="container mx-auto flex flex-wrap items-center justify-between p-4">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-[#f0f0f0]">GXO Logistics</h1>
        </div>

        {/* Menu for larger screens */}
        <div className="hidden md:flex space-x-4">
          <Link to="/dashboard" className="text-[#f0f0f0] hover:underline">
            Dashboard
          </Link>
          <Link to="/metrics" className="text-[#f0f0f0] hover:underline">
            Metrics
          </Link>
          <Link to="/records" className="text-[#f0f0f0] hover:underline">
            Records
          </Link>
          <Link to="/teams" className="text-[#f0f0f0] hover:underline">
            Teams
          </Link>
          <button
            onClick={handleLogout}
            className="bg-[#ff3a00] px-4 py-2 rounded hover:bg-[#ff3a77] transition duration-300 text-[#f0f0f0]"
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
        className="hidden md:hidden bg-[#2E3033] text-white px-4 py-2"
      >
        <Link to="/dashboard" className="block py-2 hover:bg-[#1c1c1c] rounded">
          Dashboard
        </Link>
        <Link to="/metrics" className="block py-2 hover:bg-[#1c1c1c] rounded">
          Metrics
        </Link>
        <Link to="/records" className="block py-2 hover:bg-[#1c1c1c] rounded">
          Records
        </Link>
        <Link to="/teams" className="block py-2 hover:bg-[#1c1c1c] rounded">
          Teams
        </Link>
        <button
          onClick={handleLogout}
          className="block w-full text-left bg-[#ff3a00] py-2 mt-2 rounded hover:bg-[#ff3a77]"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
