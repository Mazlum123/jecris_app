import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../api";
import { useCart } from "../context/useCart";
import "../styles/pages/_bibliotheque.scss";

interface Book {
  id: number; // ✅ Reste un number
  title: string;
  description: string;
  price: number;
  isFree: boolean;
  author?: string; // author est optionnel
}

const fetchBooks = async (): Promise<Book[]> => {
  const response = await api.get("/books");
  return response.data;
};

const Bibliotheque = () => {
  const { addToCart } = useCart();

  // ✅ Correction de la signature de useMutation sans utiliser `any`
  const addToPersonalLibrary = useMutation<void, Error, string>({
    mutationFn: async (bookId: string) => {
      const response = await api.post("/user-books", { bookId });
      return response.data;
    },
    onSuccess: () => {
      alert("Livre ajouté à votre bibliothèque personnelle !");
    },
    onError: () => {
      alert("Erreur lors de l'ajout du livre.");
    },
  });

  const { data: books, error, isLoading } = useQuery<Book[], Error>({
    queryKey: ["books"],
    queryFn: fetchBooks,
  });

  if (isLoading) return <p>Chargement...</p>;
  if (error) return <p>Erreur lors de la récupération des livres.</p>;

  return (
    <div className="bibliotheque-container">
      <h1>📚 Bibliothèque Publique</h1>
      <div className="bento-grid">
        {books?.map((book) => (
          <div key={book.id} className="bento-card">
            <h3>{book.title}</h3>
            <p>{book.description}</p>
            <p><strong>Auteur : </strong>{book.author ?? "Auteur inconnu"}</p>
            <p><strong>Prix : </strong>{book.isFree ? "Gratuit" : `${book.price} €`}</p>

            {/* ✅ Si le livre est gratuit */}
            {book.isFree ? (
              <button
                onClick={() => addToPersonalLibrary.mutate(book.id.toString())} // ✅ Conversion explicite en string
                disabled={addToPersonalLibrary.status === "pending"}
              >
                {addToPersonalLibrary.status === "pending" ? "Ajout..." : "Ajouter à ma bibliothèque"}
              </button>
            ) : (
              // ✅ Si le livre est payant
              <button onClick={() => addToCart({
                ...book,
                id: book.id.toString(), // ✅ Conversion explicite en string
                author: book.author ?? "Auteur inconnu", // ✅ Fournit une valeur par défaut
              })}>
                Ajouter au panier 🛒
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bibliotheque;