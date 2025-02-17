import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Bibliotheque from "./pages/Bibliotheque";
import Login from "./pages/Login";
import BookDetails from "./pages/BookDetails";
import RedirectPage from "./pages/RedirectPage";
import Register from "./pages/Register";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/bibliotheque", element: <Bibliotheque /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/books/:id", element: <BookDetails /> },
      { path: "/redirect", element: <RedirectPage /> },
    ],
  },
]);

export default router;