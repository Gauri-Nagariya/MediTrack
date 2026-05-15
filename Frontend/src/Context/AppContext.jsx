import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { message } from "antd";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const getApiErrorMessage = (err, fallbackMessage) => {
    if (err?.response?.data?.message) return err.response.data.message;
    if (err?.response?.data?.error) return err.response.data.error;
    if (err?.message) return err.message;
    return fallbackMessage;
  };

  const loadUser = async () => {
    try {
      if (!token) {
  setLoading(false);
  return;
}

      const { data } = await axios.get(`${backendUrl}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) setUser(data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false); // done loading
    }
  };

  useEffect(() => {
    loadUser();
  }, [token]);

  // LOGIN
  const login = async (email, password, role) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/login`, {
        email,
        password,
        role,
      });

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("meditrack-show-tour-after-signup", "true");
        setToken(data.token);
        // setUser(data.user);
        return true;
      }
      message.error(data.message || "Login failed");
      return false;
    } catch (err) {
      console.log(err);
      message.error(getApiErrorMessage(err, "Login failed"));
      return false;
    }
  };

  // REGISTER
  const register = async (name, email, password, role) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/register`, {
        name,
        email,
        password,
        role,
      });

      if (data.success) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        // setUser(data.user);
        return true;
      }
      message.error(data.message || "Registration failed");
      return false;
    } catch (err) {
      console.log(err);
      message.error(getApiErrorMessage(err, "Registration failed"));
      return false;
    }
  };

  // LOGOUT
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    // setShowLogin(true);
  };

  // useEffect(() => {
  //   if (token) loadUser();
  // }, [token]);

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        showLogin,
        backendUrl,
        setShowLogin,
        login,
        register,
        logout,
        loading, // expose loading
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
