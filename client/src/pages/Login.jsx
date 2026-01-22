import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import ravionailogo from '../assets/logo_ravion.png'

const Login = () => {
  const [state, setState] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { axios, setToken } = useAppContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = state === "login" ? "/api/user/login" : "/api/user/register";

    try {
      const { data } = await axios.post(url, { name, email, password });
      if (data.success) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-gray-100">

      {/* ---------- LEFT SIDE LOGO SECTION ---------- */}
     <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-[#F5EEDF] to-purple-200 text-gray-900 p-10">

        
        <img 
          src={ravionailogo} 
          alt="Ravion AI Logo"
          className="h-70 w-180 mb-6 drop-shadow-xl"
        />

        <h1 className="text-4xl font-extrabold tracking-wide drop-shadow-lg">
          Ravion AI
        </h1>

        <p className="text-lg opacity-90 mt-3 text-center max-w-sm">
          Your AI companion for generating smart responses and stunning images.
        </p>

      </div>

      {/* ---------- RIGHT SIDE FORM SECTION ---------- */}
      <div className="flex justify-center items-center p-6">
        <form
          onSubmit={handleSubmit}
          className="backdrop-blur-xl bg-white/70 shadow-2xl border border-white/40 rounded-2xl 
          w-full max-w-sm p-8 flex flex-col gap-6"
        >
          {/* Title */}
          <p className="text-3xl font-bold text-center text-gray-800">
            <span className="text-purple-700">User</span>{" "}
            {state === "login" ? "Login" : "Sign Up"}
          </p>

          {/* Name Field - only for register */}
          {state === "register" && (
            <div className="w-full">
              <label className="text-gray-700 font-medium">Name</label>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                placeholder="Enter your name"
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 
                focus:ring-purple-500 outline-none transition"
                type="text"
                required
              />
            </div>
          )}

          {/* Email */}
          <div className="w-full">
            <label className="text-gray-700 font-medium">Email</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              placeholder="Enter your email"
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 
              focus:ring-purple-500 outline-none transition"
              type="email"
              required
            />
          </div>

          {/* Password */}
          <div className="w-full">
            <label className="text-gray-700 font-medium">Password</label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              placeholder="Enter your password"
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 
              focus:ring-purple-500 outline-none transition"
              type="password"
              required
            />
          </div>

          {/* Switch Login/Register */}
          {state === "register" ? (
            <p className="text-sm text-gray-700">
              Already have an account?{" "}
              <span
                onClick={() => setState("login")}
                className="text-purple-700 font-semibold cursor-pointer hover:underline"
              >
                Login here
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-700">
              Don’t have an account?{" "}
              <span
                onClick={() => setState("register")}
                className="text-purple-700 font-semibold cursor-pointer hover:underline"
              >
                Register now
              </span>
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 
            text-white font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 
            transition-all shadow-md"
          >
            {state === "register" ? "Create Account" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
