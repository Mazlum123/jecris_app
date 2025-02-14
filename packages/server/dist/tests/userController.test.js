import request from "supertest";
import { app, server } from "../server.js";
import { db } from "../config/db.js";
import jwt from "jsonwebtoken";
describe("User Controller", () => {
    let token;
    beforeAll(async () => {
        token = jwt.sign({ id: 1, email: "test@test.com" }, process.env.JWT_SECRET, { expiresIn: "1h" });
    });
    test("Devrait renvoyer une erreur sans token", async () => {
        const res = await request(app).get("/api/users/me");
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty("error", "Accès refusé. Token manquant.");
    });
    test("Devrait renvoyer une erreur avec un token invalide", async () => {
        const res = await request(app)
            .get("/api/users/me")
            .set("Authorization", "Bearer faketoken");
        expect(res.status).toBe(403);
        expect(res.body).toHaveProperty("error", "Token invalide.");
    });
    test("Devrait retourner l'utilisateur connecté avec un token valide", async () => {
        const res = await request(app)
            .get("/api/users/me")
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("id");
        expect(res.body).toHaveProperty("email");
    });
    test("Devrait retourner la liste des utilisateurs avec un token valide", async () => {
        const res = await request(app)
            .get("/api/users")
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
    });
});
afterAll(async () => {
    try {
        if (db.$client) {
            await db.$client.end();
        }
        await new Promise((resolve, reject) => {
            server.close((err) => (err ? reject(err) : resolve()));
        });
    }
    catch (error) {
        console.error("🚨 Erreur lors de la fermeture du serveur :", error);
    }
});
