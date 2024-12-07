import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage("");
    setIsLoading(true); // Start loading spinner

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setErrors(["Passwords do not match."]);
      setIsLoading(false); // Stop loading spinner
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
    } finally {
      setIsLoading(false); // Stop loading spinner
    }
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

        {isLoading && <LoadingSpinner />}

        {!isLoading && (
          <>
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
          </>
        )}

        <p className="mt-6 text-center text-gray-600">
          <Link to="/login" className="block py-2 hover:color-blue-600 rounded">
            Already have an account? Click here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
