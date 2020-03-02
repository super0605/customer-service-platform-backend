import logger from "src/logger";
import { Sequelize } from "src/sequelize";
import seeds from "./seeds";

interface SeedManagerOptions {
  sequelize: Sequelize; // its implicitly required by all the models so we make this requirement explicit, although it is not used directly
}

interface SeedManager {
  apply: () => Promise<void>;
}

export function mkSeedManager(_: SeedManagerOptions): SeedManager {
  return {
    async apply(): Promise<void> {
      if (!seeds.length) {
        logger.log("No seeds to apply, continue.");
        return;
      }

      logger.log("Applying seeds ...");
      for (const seed of seeds) {
        logger.debug(`Testing if needed seed '${seed.name}' ...`);
        if ((await seed.test()) === "apply") {
          logger.log(`Applying seed '${seed.name}' ...`);
          await seed.apply();
        }
      }
      logger.log("Seeds applied.");
    }
  };
}
