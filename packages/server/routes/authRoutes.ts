import { Router, Request, Response } from "express";
import { register, login, logout, checkEmail, setPassword } from "../controllers/authController.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

// ✅ Routes classiques sans async wrapper
router.post("/register", (req: Request, res: Response) => {
    register(req, res);
});

router.post("/login", (req: Request, res: Response) => {
    login(req, res);
});

router.post("/check-email", (req: Request, res: Response) => {
    checkEmail(req, res);
});

router.post("/logout", (req: Request, res: Response) => {
    logout(req, res);
});

router.post("/set-password", (req: Request, res: Response) => {
    setPassword(req, res);
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
    (req: Request, res: Response) => {
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