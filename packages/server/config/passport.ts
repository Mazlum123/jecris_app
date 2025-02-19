import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { db } from "../config/db.js";
import { users } from "../models/userModel.js";
import dotenv from "dotenv";
import { eq } from "drizzle-orm";

dotenv.config();

// ✅ Vérifie que les variables d'environnement sont bien définies
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Google OAuth credentials are not set in environment variables.");
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === "production"
        ? "https://jecris-api.up.railway.app/api/auth/google/callback"
        : "http://localhost:4000/api/auth/google/callback", 
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (error: any, user?: any) => void
    ) => {
      try {
        // ✅ Vérifie si l'email est présent
        const email = profile.emails?.[0]?.value || "";

        if (!email) {
          return done(new Error("Aucun email valide trouvé dans le profil Google."), false);
        }

        // ✅ Recherche de l'utilisateur dans la base
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        let user;

        if (existingUser.length > 0) {
          user = existingUser[0];
        } else {
          // ✅ Crée un nouvel utilisateur s'il n'existe pas
          const newUser = await db
            .insert(users)
            .values({
              email: email,
              password: "", // Pas de mot de passe car connexion via Google
            })
            .returning();

          user = newUser[0];
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// ✅ Sérialisation de l'utilisateur pour la session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// ✅ Désérialisation de l'utilisateur à partir de la session
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (user.length > 0) {
      done(null, user[0]);
    } else {
      done(new Error("Utilisateur non trouvé"), false);
    }
  } catch (error) {
    done(error, false);
  }
});