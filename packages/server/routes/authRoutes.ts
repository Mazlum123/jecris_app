import { Router, Request, Response, NextFunction } from "express";
import { register, login, logout, checkEmail, setPassword } from "../controllers/authController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

// Modifions le typage
type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

// Wrapper pour convertir nos handlers en Promise<void>
const asyncHandler = (handler: AsyncHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await handler(req, res, next);
        } catch (error) {
            next(error);
        }
    };
};

// Routes avec validation
router.post("/register", validateRequest(registerSchema), asyncHandler(async (req, res) => {
    await register(req, res);
}));

router.post("/login", validateRequest(loginSchema), asyncHandler(async (req, res) => {
    await login(req, res);
}));

router.post("/check-email", asyncHandler(async (req, res) => {
    await checkEmail(req, res);
}));

router.post("/logout", asyncHandler(async (req, res) => {
    await logout(req, res);
}));

router.post("/set-password", asyncHandler(async (req, res) => {
    await setPassword(req, res);
}));

// Route Google OAuth - Redirection vers Google
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback Google OAuth
router.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/login" }),
    asyncHandler(async (req: Request, res: Response) => {
        const user = req.user as { id: number; email: string };

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: "1h" }
        );

        res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
    })
);

export default router;