import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AppContext } from "../Context/AppContext";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";

const LoginForm = () => {
  const [state, setState] = useState("Login");
  const { setShowLogin, login, register } = useContext(AppContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("patient");

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (state === "Login") {
      const success = await login(email, password, role);
      if (success) setShowLogin(false);
    } else {
      const success = await register(name, email, password, role);
      if (success) setShowLogin(false);
    }
  };

  // Disable scroll when popup is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-10 backdrop-blur-sm bg-black/30 flex justify-center items-center">
      <motion.form
        onSubmit={onSubmitHandler}
        initial={{ opacity: 0.2, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative bg-white p-10 rounded-xl text-slate-500 w-96"
      >
        <h1 className="text-center text-2xl text-neutral-700 font-medium">
          {state}
        </h1>
        <p className="text-sm mb-4">
          {state === "Login"
            ? "Welcome back! Please sign in to continue."
            : "Create your account to get started."}
        </p>

        {state !== "Login" && (
          <div className="border px-6 py-2 rounded-full mt-4">
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              className="outline-none text-sm w-full"
              type="text"
              placeholder="Full Name"
              required
            />
          </div>
        )}

        <div className="border px-6 py-2 rounded-full mt-4">
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="outline-none text-sm w-full"
            type="email"
            placeholder="Email Address"
            required
          />
        </div>

        <div className="border px-6 py-2 rounded-full mt-4 flex items-center gap-2">
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className="outline-none text-sm w-full"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-gray-500 hover:text-gray-700 text-base leading-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          </button>
        </div>

        <div className="mt-4">
          <p className="text-sm mb-2">Continue as</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole("patient")}
              className={`py-2 rounded-full border text-sm ${
                role === "patient"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-600 border-slate-300"
              }`}
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => setRole("doctor")}
              className={`py-2 rounded-full border text-sm ${
                role === "doctor"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-600 border-slate-300"
              }`}
            >
              Doctor
            </button>
          </div>
        </div>

        <p className="text-sm text-blue-600 my-4 cursor-pointer">
          Forgot password?
        </p>

        <button className="bg-blue-600 w-full text-white py-2 rounded-full cursor-pointer">
          {state === "Login" ? "Login" : "Create Account"}
        </button>

        {state === "Login" ? (
          <p className="mt-5 text-center">
            Don't have an account?{" "}
            <span
              className="text-blue-600 cursor-pointer"
              onClick={() => setState("Sign up")}
            >
              Sign up
            </span>
          </p>
        ) : (
          <p className="mt-5 text-center">
            Already have an account?{" "}
            <span
              className="text-blue-600 cursor-pointer"
              onClick={() => setState("Login")}
            >
              Login
            </span>
          </p>
        )}

        <button
          onClick={() => setShowLogin(false)}
          type="button"
          className="absolute top-5 right-5 text-xl font-bold text-gray-500 hover:text-black"
        >
          ✕
        </button>
      </motion.form>
    </div>
  );
};

export default LoginForm;
