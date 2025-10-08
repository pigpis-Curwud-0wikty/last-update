import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../../App";

const Login = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
<<<<<<< HEAD
=======
  const [loading, setLoading] = useState(false);
>>>>>>> f928bb6 (last update)

  const handleSubmit = async (e) => {
    e.preventDefault();

<<<<<<< HEAD
    try {
      const response = await axios.post(
        `${backendUrl}/api/Account/login`,
        { email, password }
      );

      const statusCode = response.data.statuscode;
      const body = response.data.responseBody;

      if (statusCode === 200 && body?.data?.token) {
        const token = body.data.token;
        setToken(token);
        localStorage.setItem("token", token);
        toast.success(body.message || "Login successful");
      } else {
        console.warn("⚠️ Login failed:", response.data);
        toast.error(body?.message || "Login failed");
      }
    } catch (error) {
      console.error("Axios Error:", error);

      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
        toast.error(
          error.response.data?.message ||
            `Server error: ${error.response.status}`
        );
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error("No response from server");
      } else {
        console.error("Error setting up request:", error.message);
        toast.error(error.message);
      }
=======
    if (!email || !password) {
      toast.warn("Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      // ✅ Proper API request with correct content type
      const response = await axios.post(
        `${backendUrl}/api/Account/login`,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json-patch+json",
            Accept: "text/plain",
          },
        }
      );

      // ✅ Handle API response according to schema
      const { statuscode, responseBody } = response.data || {};
      const token = responseBody?.data?.token;
      const roles = responseBody?.data?.roles || [];

      if (statuscode === 200 && token) {
        setToken(token);
        localStorage.setItem("token", token);
        localStorage.setItem("roles", JSON.stringify(roles));
        toast.success(responseBody?.message || "Login successful");
      } else {
        // Handle backend-provided error messages
        const errMsg =
          responseBody?.message ||
          responseBody?.errors?.messages?.join(", ") ||
          "Login failed. Please check your credentials.";
        toast.error(errMsg);
      }
    } catch (error) {
      console.error("Login Error:", error);

      // ✅ Error with HTTP response (server responded but not 2xx)
      if (error.response) {
        const { status, data } = error.response;
        const apiMessage =
          data?.responseBody?.message ||
          data?.responseBody?.errors?.messages?.join(", ") ||
          "Unexpected error occurred.";

        switch (status) {
          case 400:
            toast.error(apiMessage || "Bad Request — please check your input.");
            break;
          case 401:
            toast.error(apiMessage || "Unauthorized — invalid email or password.");
            break;
          case 500:
            toast.error(apiMessage || "Internal Server Error — please try again later.");
            break;
          default:
            toast.error(apiMessage || `Server returned status ${status}`);
        }
      }

      // ✅ Error with no response (e.g., network issue)
      else if (error.request) {
        toast.error("No response from the server. Please check your connection.");
      }

      // ✅ Something went wrong before sending the request
      else {
        toast.error(`Error setting up the request: ${error.message}`);
      }
    } finally {
      setLoading(false);
>>>>>>> f928bb6 (last update)
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full">
<<<<<<< HEAD
      <div className="bg-white shadow-md rounded-lg px-8 py-6 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-3 min-w-72">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Email Address
            </p>
            <input
              className="rounded-md w-full px-3 py-2 border border-gray-300 outline-none"
              type="email"
=======
      <div className="bg-white shadow-md rounded-lg px-8 py-6 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">Admin Panel</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Email Address</p>
            <input
              type="email"
              className="rounded-md w-full px-3 py-2 border border-gray-300 outline-none"
>>>>>>> f928bb6 (last update)
              placeholder="Enter Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
<<<<<<< HEAD
            />
          </div>
          <div className="mb-3 min-w-72">
            <p className="text-sm font-medium text-gray-700 mb-2">Password</p>
            <input
              className="rounded-md w-full px-3 py-2 border border-gray-300 outline-none"
              type="password"
=======
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Password</p>
            <input
              type="password"
              className="rounded-md w-full px-3 py-2 border border-gray-300 outline-none"
>>>>>>> f928bb6 (last update)
              placeholder="Enter Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
<<<<<<< HEAD
            />
          </div>
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded-md w-full cursor-pointer"
          >
            Login
=======
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"
            } text-white px-4 py-2 rounded-md w-full transition`}
          >
            {loading ? "Logging in..." : "Login"}
>>>>>>> f928bb6 (last update)
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
