import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage("");

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setErrors(["Passwords do not match."]);
      return;
    }

    try {
      const { data } = await API.post("/register/", {
        username: formData.email, // Automatically set username to email
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      });
      setSuccessMessage(
        data.message || "Registration successful! Please verify your email."
      );
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
      });

      // Redirect after successful registration
      setTimeout(() => {
        navigate("/login");
      }, 5000);
    } catch (err: any) {
      if (err.response && err.response.data) {
        setErrors(err.response.data.errors || ["Registration failed."]);
      } else {
        setErrors(["An unexpected error occurred. Please try again."]);
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-green-400 to-blue-500">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create Your Account
        </h2>

        {successMessage && (
          <p className="text-green-600 text-center bg-green-100 p-2 rounded mb-4">
            {successMessage}
          </p>
        )}
        {errors.length > 0 && (
          <div className="bg-red-100 p-3 rounded mb-4">
            {errors.map((error, idx) => (
              <p key={idx} className="text-red-600">
                {error}
              </p>
            ))}
          </div>
        )}

        <label className="block mb-3">
          <span className="text-gray-700">Email</span>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full mt-1 px-4 py-2 border rounded-lg shadow-sm focus:ring focus:ring-blue-300 focus:border-blue-500"
            placeholder="Enter your email"
            required
          />
        </label>

        <label className="block mb-3">
          <span className="text-gray-700">Password</span>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full mt-1 px-4 py-2 border rounded-lg shadow-sm focus:ring focus:ring-indigo-300 focus:border-indigo-500"
            placeholder="Enter a strong password"
            required
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700">Confirm Password</span>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full mt-1 px-4 py-2 border rounded-lg shadow-sm focus:ring focus:ring-pink-300 focus:border-pink-500"
            placeholder="Confirm your password"
            required
          />
        </label>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 shadow-md transition duration-300"
        >
          Register
        </button>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            Login here
          </a>
        </p>
      </form>
    </div>
  );
};

export default Register;
