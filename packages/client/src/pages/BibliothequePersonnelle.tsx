import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import "../styles/pages/_bibliotheque.scss";

interface Book {
  id: number;
  title: string;
  description: string;
}

const fetchUserBooks = async (): Promise<Book[]> => {
  const token = localStorage.getItem("authToken"); // ✅ Récupère le token JWT

  const response = await api.get("/user-books", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

const BibliothequePersonnelle = () => {
  const { data: books, error, isLoading } = useQuery<Book[], Error>({
    queryKey: ["user-books"],
    queryFn: fetchUserBooks,
  });

  if (isLoading) return <p>Chargement...</p>;
  if (error) return <p>Erreur lors de la récupération de votre bibliothèque.</p>;

  return (
    <div className="bibliotheque-container">
      <h1>📖 Ma Bibliothèque Personnelle</h1>
      {books?.length === 0 ? (
        <p>Aucun livre dans votre bibliothèque.</p>
      ) : (
        <div className="bento-grid">
          {books?.map((book) => (
            <div key={book.id} className="bento-card">
              <h3>{book.title}</h3>
              <p>{book.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BibliothequePersonnelle;