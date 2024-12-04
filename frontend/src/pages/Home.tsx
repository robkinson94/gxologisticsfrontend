import React from "react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800">
        Welcome to GXO Logistics
      </h1>
      <p className="mt-4 text-gray-600">
        Streamline your logistics data with ease.
      </p>
      <Link
        to="/login"
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
      >
        Login
      </Link>
    </div>
  );
};

export default Home;
