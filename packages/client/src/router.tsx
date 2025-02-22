import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./components/layouts/MainLayout";
import Home from "./pages/Home";
import Bibliotheque from "./pages/Bibliotheque";
import BibliothequePersonnelle from "./pages/BibliothequePersonnelle";
import Login from "./pages/Login";
import BookDetails from "./pages/BookDetails";
import RedirectPage from "./pages/RedirectPage";
import Register from "./pages/Register";
import Cart from "./components/Cart";
import BookReader from "./components/features/books/BookReader";

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
    ],
  },
]);

export default router;