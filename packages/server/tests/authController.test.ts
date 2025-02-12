import request from "supertest";
import { app, server } from "../server.js";
import { db } from "../config/db.js";
import { users } from "../models/userModel.js";
import bcrypt from "bcrypt";

beforeEach(async () => {
    await db.delete(users);
});

describe("Auth Controller", () => {
    it("devrait enregistrer un nouvel utilisateur", async () => {
        const res = await request(app).post("/api/auth/register").send({
            email: "test@example.com",
            password: "password123"
        });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("message", "Utilisateur créé avec succès !");
        expect(res.body.user[0]).toHaveProperty("email", "test@example.com");
    });

    it("devrait refuser l'enregistrement si l'email est déjà utilisé", async () => {
        await db.insert(users).values({
            email: "test@example.com",
            password: await bcrypt.hash("password123", 10)
        });

        const res = await request(app).post("/api/auth/register").send({
            email: "test@example.com",
            password: "password123"
        });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error", "Cet email est déjà utilisé.");
    });

    it("devrait permettre la connexion avec un bon mot de passe", async () => {
        await db.insert(users).values({
            email: "test@example.com",
            password: await bcrypt.hash("password123", 10)
        });

        const res = await request(app).post("/api/auth/login").send({
            email: "test@example.com",
            password: "password123"
        });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("token");
    });

    it("devrait refuser la connexion avec un mauvais mot de passe", async () => {
        await db.insert(users).values({
            email: "test@example.com",
            password: await bcrypt.hash("password123", 10)
        });

        const res = await request(app).post("/api/auth/login").send({
            email: "test@example.com",
            password: "wrongpassword"
        });

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty("error", "Email ou mot de passe incorrect.");
    });
});

afterAll(async () => {
    try {
        if (db.$client) {
            await db.$client.end();
        }
        await new Promise<void>((resolve, reject) => {
            server.close((err) => (err ? reject(err) : resolve()));
        });
    } catch (error) {
        console.error("🚨 Erreur lors de la fermeture du serveur :", error);
    }
});