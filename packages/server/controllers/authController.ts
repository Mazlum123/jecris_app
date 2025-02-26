import { Request, Response } from "express";
import { db } from "../config/db.js";
import { users } from "../models/userModel.js";
import { users as User } from "../models/userModel.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import validator from "validator";
import jwt from "jsonwebtoken";
import { sendPasswordSetupEmail } from "../utils/emailService.js";

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (existingUser.length === 0) {
            return res.status(401).json({
                status: 'error',
                message: "Email ou mot de passe incorrect.",
                data: null
            });
        }

        const user = existingUser[0];

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: 'error',
                message: "Email ou mot de passe incorrect.",
                data: null
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            status: 'success',
            message: "Connexion réussie !",
            token,
            username: user.email,
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email
                }
            }
        });

    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        res.status(500).json({
            status: 'error',
            message: "Erreur lors de la connexion.",
            data: null
        });
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const existingUser = await db.select().from(users).where(eq(users.email, email));
        if (existingUser.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: "Cet email est déjà utilisé.",
                data: null
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await db.insert(users).values({ email, password: hashedPassword }).returning();

        res.status(201).json({
            status: 'success',
            message: "Utilisateur créé avec succès !",
            data: {
                user: newUser[0]
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: "Erreur lors de l'inscription.",
            data: null
        });
    }
};

export const checkEmail = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                status: 'error',
                message: "L'email est requis.",
                data: null
            });
        }

        const isValidSyntax = validator.isEmail(email);

        if (!isValidSyntax) {
            return res.status(400).json({
                status: 'error',
                message: "L'email n'est pas valide.",
                data: null
            });
        }

        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
        const isAvailable = existingUser.length === 0;

        return res.status(200).json({
            status: 'success',
            message: null,
            data: {
                exists: true,
                available: isAvailable
            }
        });
    } catch (error) {
        console.error("Erreur lors de la vérification de l'email :", error);
        res.status(500).json({
            status: 'error',
            message: "Erreur serveur lors de la vérification de l'email.",
            data: null
        });
    }
};

export const handleGoogleAuth = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                status: 'error',
                message: "Email manquant.",
                data: null
            });
        }

        let existingUsers = await db.select().from(users).where(eq(users.email, email));
        let user = existingUsers[0];
        let isNewUser = false;

        if (!user) {
            const [newUser] = await db.insert(users).values({
                email,
                password: "",
            }).returning();

            user = newUser;
            isNewUser = true;

            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "1h" });
            await sendPasswordSetupEmail(user.email, token);
        } else {
            if (user.password) {
                return res.status(400).json({
                    status: 'error',
                    message: "Cet email est déjà utilisé. Veuillez vous connecter normalement.",
                    data: null
                });
            }
        }

        const sessionToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            status: 'success',
            message: isNewUser ? "Compte créé avec succès" : "Connexion réussie",
            token: sessionToken,
            data: {
                token: sessionToken,
                isNewUser,
                user: {
                    id: user.id,
                    email: user.email
                }
            }
        });
    } catch (error) {
        console.error("Erreur dans handleGoogleAuth:", error);
        res.status(500).json({
            status: 'error',
            message: "Erreur lors de l'authentification Google.",
            data: null
        });
    }
};

export const setPassword = async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({
            status: 'error',
            message: 'Token et nouveau mot de passe requis.',
            data: null
        });
    }

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        const userId = decoded.userId;

        const usersFound = await db.select().from(users).where(eq(users.id, userId));
        const user = usersFound[0];

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Utilisateur non trouvé.',
                data: null
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));

        return res.status(200).json({
            status: 'success',
            message: 'Mot de passe défini avec succès.',
            data: null
        });
    } catch (error: any) {
        console.error('Erreur lors de la définition du mot de passe:', error);
        return res.status(400).json({
            status: 'error',
            message: 'Lien expiré ou invalide.',
            data: null
        });
    }
};

export const logout = async (req: Request, res: Response) => {
    res.clearCookie("token");
    return res.status(200).json({
        status: 'success',
        message: "Déconnexion réussie !",
        data: null
    });
};