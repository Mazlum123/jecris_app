import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validateRequest = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.body);
            next();
        } catch (error) {
            // Vérifions que c'est bien une erreur Zod
            if (error instanceof ZodError) {
                res.status(400).json({
                    status: 'error',
                    message: "Données invalides",
                    errors: error.errors
                });
            } else {
                res.status(500).json({
                    status: 'error',
                    message: "Erreur de validation inattendue",
                    errors: []
                });
            }
        }
    };
};