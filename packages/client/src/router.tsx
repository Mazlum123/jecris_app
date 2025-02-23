import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./components/layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Bibliotheque from "./pages/Bibliotheque";
import BibliothequePersonnelle from "./pages/BibliothequePersonnelle";
import Login from "./pages/Login";
import Profil from "./pages/Profil";
import Dashboard from "./pages/Dashboard";
import BookDetails from "./pages/BookDetails";
import RedirectPage from "./pages/RedirectPage";
import Register from "./pages/Register";
import Cart from "./components/Cart";
import BookReader from "./components/features/books/BookReader";
import SuccessPage from "./pages/SuccessPage";
import CancelPage from "./pages/CancelPage";
import Contact from "./pages/Contact";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/bibliotheque", element: <Bibliotheque /> },
      { path: "/bibliotheque-personnelle", element: <BibliothequePersonnelle /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/books/:id", element: <BookDetails /> },
      { path: "/redirect", element: <RedirectPage /> },
      { path: "/cart", element: <Cart /> },
      { path: "/read/:bookId/:pageNumber", element: <BookReader /> },
      { path: "/success", element: <SuccessPage /> },
      { path: "/cancel", element: <CancelPage /> },
      { path: "/contact", element: <Contact /> },
      // Routes protégées
      {
        element: <ProtectedRoute />,
        children: [
          { path: "bibliotheque-personnelle", element: <BibliothequePersonnelle /> },
          { path: "profil", element: <Profil /> },
          { path: "dashboard", element: <Dashboard /> }
        ]
      }
    ],
  },
]);

export default router;
