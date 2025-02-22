import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";
import "../../styles/layouts/_mainLayout.scss";

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
