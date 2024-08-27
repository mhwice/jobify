import { Outlet, useLoaderData, redirect, useNavigate } from "react-router-dom";
import Wrapper from "../assets/wrappers/Dashboard";
import { SmallSidebar, BigSidebar, Navbar } from "../components/index";
import { createContext, useContext, useState } from "react";
import { checkDefaultTheme } from "../App";
import customFetch from "../utils/customFetch";
import { toast } from "react-toastify";

export const loader = async () => {
  try {
    const { data } = await customFetch.get("/users/current-user");
    return data;
  } catch (error) {
    return redirect("/");
  }
}

const DashboardContext = createContext();

const DashboardLayout = () => {

  const { user } = useLoaderData();
  const navigate = useNavigate();

  const [showSidebar, setShowSidebar] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(checkDefaultTheme());

  const toggleDarkTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    document.body.classList.toggle("dark-theme", !isDarkTheme);
    localStorage.setItem("darkTheme", !isDarkTheme);
  }

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  }

  const logoutUser = async () => {
    try {
      navigate("/");
      await customFetch.get("/auth/logout");
      toast.success("Logout successfull");
    } catch (error) {
      // toast.error("Logout failed");
    }
  }

  return (
    <DashboardContext.Provider value={{
      user,
      showSidebar,
      isDarkTheme,
      toggleSidebar,
      toggleDarkTheme,
      logoutUser
    }}>
      <Wrapper>
      <main className="dashboard">
        <SmallSidebar />
        <BigSidebar />
        <div>
          <Navbar />
          <div className="dashboard-page">
            <Outlet context={{ user }} />
          </div>
        </div>
      </main>
    </Wrapper>
    </DashboardContext.Provider>
  );
}

export const useDashboardContext = () => useContext(DashboardContext);
export default DashboardLayout;