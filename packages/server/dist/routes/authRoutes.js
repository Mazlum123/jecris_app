import { Router } from "express";
import { register } from "../controllers/authController.js";
const router = Router();
router.post("/register", async (req, res) => {
    await register(req, res);
});
export default router;
