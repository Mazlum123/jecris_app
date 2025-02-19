import { Router } from "express";
import { register, login, logout, checkEmail } from "../controllers/authController.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

// ✅ Routes classiques
router.post("/register", async (req, res) => {
    await register(req, res);
});

router.post("/login", async (req, res) => {
    await login(req, res);
});

router.post("/check-email", async (req, res) => {
    await checkEmail(req, res);
});

router.post("/logout", async (req, res) => {
    await logout(req, res);
});

// ✅ Route Google OAuth - Redirection vers Google
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// ✅ Callback Google OAuth
router.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/login" }),
    (req, res) => {
        const user = req.user as { id: number; email: string };

        // Générer un JWT pour l'utilisateur authentifié
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: "1h" }
        );

        // Rediriger vers le frontend avec le token JWT
        res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
    }
);

export default router;