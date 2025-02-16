import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <h1>Accueil</h1>,
  },
  {
    path: "/login",
    element: <h1>Connexion</h1>,
  },
  {
    path: "/bibliotheque",
    element: <h1>Bibliothèque</h1>,
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
