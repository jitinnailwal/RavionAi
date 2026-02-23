import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import RavionLogo from "../components/RavionLogo";

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
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-[#0F172A] relative overflow-hidden">

      {/* ── Ocean wave layers ── */}
      <div className="absolute inset-0 pointer-events-none" style={{zIndex: 0}}>

        {/* Wave 1 — deepest, slowest */}
        <div className="absolute bottom-0 left-0 w-full" style={{height: '45%'}}>
          <svg className="absolute bottom-0 left-0" style={{width: '200%', height: '100%', animation: 'wave-drift 25s linear infinite'}}
            viewBox="0 0 2880 320" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,224 C320,280,560,160,720,200 C880,240,1040,300,1200,260 C1360,220,1520,160,1680,200 C1840,240,2000,300,2160,260 C2320,220,2560,180,2720,220 L2880,240 L2880,320 L0,320 Z"
              fill="rgba(30,58,138,0.25)"/>
          </svg>
        </div>

        {/* Wave 2 — middle layer */}
        <div className="absolute bottom-0 left-0 w-full" style={{height: '38%'}}>
          <svg className="absolute bottom-0 left-0" style={{width: '200%', height: '100%', animation: 'wave-drift 18s linear infinite', animationDirection: 'reverse'}}
            viewBox="0 0 2880 320" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,256 C240,200,480,280,720,240 C960,200,1200,160,1440,210 C1680,260,1920,300,2160,250 C2400,200,2640,180,2880,230 L2880,320 L0,320 Z"
              fill="rgba(59,130,246,0.12)"/>
          </svg>
        </div>

        {/* Wave 3 — front, fastest */}
        <div className="absolute bottom-0 left-0 w-full" style={{height: '30%'}}>
          <svg className="absolute bottom-0 left-0" style={{width: '200%', height: '100%', animation: 'wave-drift 15s linear infinite'}}
            viewBox="0 0 2880 320" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,288 C360,240,600,300,840,270 C1080,240,1320,200,1560,240 C1800,280,2040,310,2280,280 C2520,250,2700,230,2880,260 L2880,320 L0,320 Z"
              fill="rgba(99,102,241,0.10)"/>
          </svg>
        </div>

        {/* Wave 4 — front accent, violet tint */}
        <div className="absolute bottom-0 left-0 w-full" style={{height: '22%'}}>
          <svg className="absolute bottom-0 left-0" style={{width: '200%', height: '100%', animation: 'wave-drift 22s linear infinite', animationDirection: 'reverse'}}
            viewBox="0 0 2880 320" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,300 C280,270,560,310,840,290 C1120,270,1400,250,1680,280 C1960,310,2240,290,2520,270 L2880,290 L2880,320 L0,320 Z"
              fill="rgba(139,92,246,0.08)"/>
          </svg>
        </div>

        {/* Subtle ambient glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#3B82F6]/6 rounded-full blur-3xl"></div>
      </div>

      {/* ---------- LEFT SIDE LOGO SECTION ---------- */}
      <div className="hidden lg:flex flex-col justify-center items-center p-10 relative z-1">

        {/* SVG Logo — Atom/orbital with circuit nodes */}
        <div className="logo-animate mb-10">
          <RavionLogo size={160} />
        </div>

        {/* Logo Text */}
        <h1 className="logo-title-animate text-5xl font-extrabold tracking-[0.25em] text-gradient uppercase">
          Ravion AI
        </h1>
        <p className="logo-title-animate text-sm tracking-[0.35em] text-text-muted mt-2 uppercase">
          Say Hi to Ravion
        </p>

      </div>

      {/* ---------- RIGHT SIDE FORM SECTION ---------- */}
      <div className="flex justify-center items-center p-6 relative z-1">
        <div className="login-card-glow">
        <form
          onSubmit={handleSubmit}
          className="glass glow-gradient rounded-2xl relative z-1
          w-full max-w-sm p-8 flex flex-col gap-6"
        >
          {/* Title */}
          <p className="text-3xl font-bold text-center text-primary">
            <span className="text-gradient">User</span>{" "}
            {state === "login" ? "Login" : "Sign Up"}
          </p>

          {/* Name Field - only for register */}
          {state === "register" && (
            <div className="w-full">
              <label className="text-text-muted font-medium text-sm">Name</label>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                placeholder="Enter your name"
                className="mt-1 w-full p-3 bg-bg-surface border border-border-subtle rounded-lg
                focus:ring-2 focus:ring-accent-blue text-primary placeholder:text-text-muted outline-none transition"
                type="text"
                required
              />
            </div>
          )}

          {/* Email */}
          <div className="w-full">
            <label className="text-text-muted font-medium text-sm">Email</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              placeholder="Enter your email"
              className="mt-1 w-full p-3 bg-bg-surface border border-border-subtle rounded-lg
              focus:ring-2 focus:ring-accent-blue text-primary placeholder:text-text-muted outline-none transition"
              type="email"
              required
            />
          </div>

          {/* Password */}
          <div className="w-full">
            <label className="text-text-muted font-medium text-sm">Password</label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              placeholder="Enter your password"
              className="mt-1 w-full p-3 bg-bg-surface border border-border-subtle rounded-lg
              focus:ring-2 focus:ring-accent-blue text-primary placeholder:text-text-muted outline-none transition"
              type="password"
              required
            />
          </div>

          {/* Switch Login/Register */}
          {state === "register" ? (
            <p className="text-sm text-text-muted">
              Already have an account?{" "}
              <span
                onClick={() => setState("login")}
                className="text-accent-blue font-semibold cursor-pointer hover:underline"
              >
                Login here
              </span>
            </p>
          ) : (
            <p className="text-sm text-text-muted">
              Don't have an account?{" "}
              <span
                onClick={() => setState("register")}
                className="text-accent-blue font-semibold cursor-pointer hover:underline"
              >
                Register now
              </span>
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-accent-blue to-accent-violet
            text-white font-semibold text-lg glow-btn cursor-pointer"
          >
            {state === "register" ? "Create Account" : "Login"}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
