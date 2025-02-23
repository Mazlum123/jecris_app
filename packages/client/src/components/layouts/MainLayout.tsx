import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";
import "../../styles/layouts/_mainLayout.scss";
import CookieBanner from "../CookieBanner";

const MainLayout = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <CookieBanner />
    </div>
  );
};

export default MainLayout;
