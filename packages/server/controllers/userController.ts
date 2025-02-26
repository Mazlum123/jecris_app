import { Request, Response } from "express";
import { db } from "../config/db.js";
import { users } from "../models/userModel.js";
import { eq, and, not } from "drizzle-orm";

export const getUsers = async (req: Request, res: Response) => {
    try {
        const allUsers = await db.select({
            id: users.id,
            email: users.email,
            createdAt: users.createdAt
        }).from(users).execute();

        res.status(200).json({
            status: 'success',
            message: "Utilisateurs récupérés avec succès",
            data: allUsers,
            users: allUsers
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: "Erreur lors de la récupération des utilisateurs.",
            data: null
        });
    }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                status: 'error',
                message: "Utilisateur non authentifié",
                data: null
            });
            return;
        }

        const userData = await db
            .select({
                id: users.id,
                email: users.email,
                createdAt: users.createdAt
            })
            .from(users)
            .where(eq(users.id, req.user.id))
            .limit(1);

        // Si l'utilisateur n'est pas trouvé dans la base de données
        if (!userData.length) {
            res.status(404).json({
                status: 'error',
                message: "Utilisateur non trouvé",
                data: null
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            message: "Profil récupéré avec succès",
            data: userData[0],
            user: userData[0]
        });
    } catch (error) {
        console.error("Erreur getMe:", error);
        res.status(500).json({
            status: 'error',
            message: "Erreur lors de la récupération de l'utilisateur.",
            data: null
        });
    }
};

// Si vous avez besoin d'ajouter une mise à jour du profil
export const updateMe = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                status: 'error',
                message: "Utilisateur non authentifié",
                data: null
            });
            return;
        }

        const { email } = req.body;

        // Vérifier si l'email est déjà utilisé
        if (email) {
            const existingUser = await db
                .select()
                .from(users)
                .where(and(
                    eq(users.email, email),
                    not(eq(users.id, req.user.id))
                ))
                .limit(1);

            if (existingUser.length) {
                res.status(400).json({
                    status: 'error',
                    message: "Cet email est déjà utilisé",
                    data: null
                });
                return;
            }
        }

        // Mettre à jour l'utilisateur
        const updatedUser = await db
            .update(users)
            .set({ 
                email: email || req.user.email,
            })
            .where(eq(users.id, req.user.id))
            .returning();

        res.status(200).json({
            status: 'success',
            message: "Profil mis à jour avec succès",
            data: updatedUser[0],
            user: updatedUser[0]
        });
    } catch (error) {
        console.error("Erreur updateMe:", error);
        res.status(500).json({
            status: 'error',
            message: "Erreur lors de la mise à jour du profil.",
            data: null
        });
    }
};