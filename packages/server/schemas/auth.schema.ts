import { z } from 'zod';

// Schema basique pour login
export const loginSchema = z.object({
    email: z.string().email("Email invalide"),
    password: z.string().min(1, "Mot de passe requis")
});

// Schema basique pour register
export const registerSchema = z.object({
    email: z.string().email("Email invalide"),
    password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères")
});