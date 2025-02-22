import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import '../../../styles/components/features/books/_book-reader.scss';

interface BookPage {
  bookId: number;
  title: string;
  pageNumber: number;
  totalPages: number;
  content: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

const BookReader = () => {
  const { bookId, pageNumber } = useParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(parseInt(pageNumber || '1'));

  const { data: pageData, isLoading, error } = useQuery<BookPage>({
    queryKey: ['book-page', bookId, currentPage],
    queryFn: async () => {
      const response = await api.get<ApiResponse<BookPage>>(`/read/${bookId}/${currentPage}`);
      return response.data.data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (page: number) => {
      return await api.post('/read/save-progress', {
        bookId: parseInt(bookId || '0'),
        lastPageRead: page
      });
    }
  });

  const saveProgress = useCallback(async () => {
    if (currentPage > 0) {
      try {
        await saveMutation.mutateAsync(currentPage);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
      }
    }
  }, [currentPage, saveMutation]);

  useEffect(() => {
    const timer = setTimeout(saveProgress, 2000);
    return () => clearTimeout(timer);
  }, [saveProgress]);

  const handlePageChange = useCallback((newPage: number) => {
    if (pageData && newPage >= 1 && newPage <= pageData.totalPages) {
      setCurrentPage(newPage);
      navigate(`/read/${bookId}/${newPage}`);
    }
  }, [pageData, bookId, navigate]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft' && pageData?.hasPreviousPage) {
      handlePageChange(currentPage - 1);
    } else if (event.key === 'ArrowRight' && pageData?.hasNextPage) {
      handlePageChange(currentPage + 1);
    }
  }, [currentPage, pageData, handlePageChange]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  if (isLoading) {
    return (
      <div className="reader-loading">
        <div className="loading-spinner"></div>
        <p>Chargement de la page...</p>
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="reader-error">
        <p>Une erreur est survenue lors du chargement de la page.</p>
        <div className="error-actions">
          <button onClick={() => window.location.reload()}>Réessayer</button>
          <button onClick={() => navigate('/bibliotheque-personnelle')}>
            Retour à ma bibliothèque
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="book-reader">
      <div className="reader-header">
        <h1>{pageData.title}</h1>
        <div className="page-info">
          Page {currentPage} sur {pageData.totalPages}
        </div>
      </div>

      <div className="reader-content">
        {pageData.content}
      </div>

      <div className="reader-controls">
        <button 
          className={`btn-previous ${!pageData.hasPreviousPage ? 'disabled' : ''}`}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!pageData.hasPreviousPage}
        >
          Page précédente
        </button>

        <div className="page-navigation">
          <input
            type="number"
            min={1}
            max={pageData.totalPages}
            value={currentPage}
            onChange={(e) => {
              const newPage = parseInt(e.target.value);
              if (!isNaN(newPage)) {
                handlePageChange(newPage);
              }
            }}
          />
          <span>/ {pageData.totalPages}</span>
        </div>

        <button 
          className={`btn-next ${!pageData.hasNextPage ? 'disabled' : ''}`}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!pageData.hasNextPage}
        >
          Page suivante
        </button>
      </div>

      <div className="reader-toolbar">
        <button onClick={() => navigate('/bibliotheque-personnelle')}>
          Retour à ma bibliothèque
        </button>
      </div>
    </div>
  );
};

export default BookReader;