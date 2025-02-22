import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

export const errorHandler = (
  err: unknown, // Utilisez 'unknown' pour une meilleure sécurité
  req: Request,
  res: Response,
  next: NextFunction
): void => { // <-- Retourne 'void' au lieu de 'Response'
  if (err instanceof ZodError) {
    res.status(400).json({
      status: 'error',
      message: 'Données invalides',
      errors: err.format(),
    });
    return; // Utilisez 'return' pour arrêter l'exécution
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  console.error('Erreur non gérée:', err);
  res.status(500).json({
    status: 'error',
    message: 'Erreur interne du serveur',
  });
};