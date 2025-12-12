import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

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
  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/login`, {
        email,
        password,
      });

      if (data.success) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        // setUser(data.user);
        return true;
      }
      return false;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  // REGISTER
  const register = async (name, email, password) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/register`, {
        name,
        email,
        password,
      });

      if (data.success) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        // setUser(data.user);
        return true;
      }
      return false;
    } catch (err) {
      console.log(err);
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
