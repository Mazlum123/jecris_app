import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import "../styles/pages/_bibliotheque.scss";

interface Book {
  id: number;
  title: string;
  description: string;
}

const fetchBooks = async (): Promise<Book[]> => {
  const response = await api.get("/books");
  return response.data;
};

const Bibliotheque = () => {
  const { data: books, error, isLoading } = useQuery<Book[], Error>({
    queryKey: ["books"],
    queryFn: fetchBooks,
  });

  if (isLoading) return <p>Chargement...</p>;
  if (error) return <p>Erreur lors de la récupération des livres.</p>;

  return (
    <div className="bibliotheque-container">
      <h1>Bibliothèque</h1>
      <div className="bento-grid">
        {books?.map((book) => (
          <div key={book.id} className="bento-card">
            <h3>{book.title}</h3>
            <p>{book.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bibliotheque;
