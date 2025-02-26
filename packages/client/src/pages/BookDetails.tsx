import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useParams } from "react-router-dom";

interface Book {
  id: number;
  title: string;
  description: string;
}

const fetchBook = async (id: string): Promise<Book> => {
  const response = await api.get(`/books/${id}`);
  return response.data;
};

const BookDetails = () => {
  const { id } = useParams();

  const { data: book, error, isLoading } = useQuery<Book, Error>({
    queryKey: ["book", id],
    queryFn: () => fetchBook(id!),
    enabled: !!id, // Pour s'assurer que la requête n'est exécutée que si `id` existe
  });

  if (isLoading) return <p>Chargement...</p>;
  if (error) return <p>Erreur lors de la récupération du livre.</p>;
  if (!book) return <p>Livre introuvable.</p>;

  return (
    <div>
      <h1>{book.title}</h1>
      <p>{book.description}</p>
    </div>
  );
};

export default BookDetails;