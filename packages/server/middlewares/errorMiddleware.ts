import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

export const errorHandler = (
  err: Error | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      message: 'Données invalides',
      errors: err.format() // Utilisation de format() au lieu de .errors
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  console.error('Erreur non gérée:', err);
  res.status(500).json({
    status: 'error',
    message: 'Erreur interne du serveur'
  });
};