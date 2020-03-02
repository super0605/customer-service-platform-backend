import * as path from "path";
import { mkApp } from "../app";
import env from "../env";
import generateTsoa from "../generateTsoa";
import logger from "../logger";
import { mkMigrationManager } from "../migrations";
import { mkSeedManager } from "../seeds";
import { mkSequelize } from "../sequelize";

(async (): Promise<void> => {
  const { output } = await generateTsoa({ output: "build" });

  const sequelize = mkSequelize(env.DATABASE_URL);

  const migrationManager = await mkMigrationManager({
    sequelize,
    sqlMigrationsDir: path.join(__dirname, "../../migrations")
  });
  await migrationManager.up();

  const seedManager = mkSeedManager({ sequelize });
  await seedManager.apply();

  const app = mkApp({ sequelize, tsoaBuildDir: output });

  const port = env.PORT;
  app.listen(port, () => {
    logger.log(
      `App is running at http://localhost:${port} in ${app.get("env")} mode`
    );
    logger.log("  Press CTRL-C to stop\n");
  });
})();
