import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/main.scss";

const MainLayout = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
