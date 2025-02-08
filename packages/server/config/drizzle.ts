import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./db.js";

(async () => {
    console.log("Migration en cours...");
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("Migration terminée !");
    process.exit(0);
})();