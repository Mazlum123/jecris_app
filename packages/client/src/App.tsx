import { useEffect, useState } from "react";
import { api } from "./api/api";

interface Book {
  id: number;
  title: string;
  description: string;
}

const App = () => {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    api.get<Book[]>("/books")
      .then((response) => {
        console.log("📚 Livres reçus :", response.data);
        setBooks(response.data);
      })
      .catch((error) => console.error("🚨 Erreur API :", error));
  }, []);

  return (
    <div>
      <h1>Bienvenue sur Jecris !</h1>
      <ul>
        {books.map((book) => (
          <li key={book.id}>
            <strong>{book.title}</strong> - {book.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
