
// Type générique pour toutes les réponses API
export interface ApiResponse<T = unknown> {
    status: 'success' | 'error';
    message?: string;
    data: T | null;
  }
  
  // Type pour les erreurs API
  export interface ApiError {
    response?: {
      data?: {
        message?: string;
      };
    };
    message: string;
  }
  
  // Type pour les erreurs asynchrones
  export interface AsyncActionError {
    message: string;
    status?: number;
  }
  
  // Type pour les réponses d'authentification
  export interface AuthResponse {
    status: 'success' | 'error';
    data: {
      token: string;
      user: {
        id: number;
        email: string;
      };
    };
    message?: string;
  }
  
  // Type pour les livres
  export interface Book {
    id: number;
    title: string;
    description: string;
    price: number;
    isFree: boolean;
    author?: string;
  }
  
  // Type pour la réponse de Stripe
  export interface StripeResponse {
    sessionUrl: string;
  }
  
  // Type pour le panier
  export interface CartItem extends Book {
    quantity: number;
  }
  
  // Type pour les livres de l'utilisateur
  export interface UserBook extends Book {
    lastPageRead?: number;
    addedAt: string;
  }