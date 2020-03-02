import * as path from "path";
import generateTsoa from "src/generateTsoa";
import logger from "src/logger";
import { mkMigrationManager } from "src/migrations";
import { mkSeedManager } from "src/seeds";
import { mkSequelize } from "src/sequelize";
import { iocModulePath, tsoaBuildDir } from "test/helpers";
import setupPostgres from "./setup-postgres";

// async function initModelFirst(connString: string): Promise<void> {
//   const sequelize = mkSequelize(connString);
//   await sequelize.sync({ force: true });

//   const seedManager = mkSeedManager({ sequelize });
//   await seedManager.apply();
// }

async function initDbFirst(connString: string): Promise<void> {
  const sqlDir = path.join(__dirname, "../../migrations");

  const sequelize = mkSequelize(connString);
  const migrationManager = await mkMigrationManager({
    sequelize,
    sqlMigrationsDir: sqlDir
  });
  await migrationManager.up();

  const seedManager = mkSeedManager({ sequelize });
  await seedManager.apply();
}

export = async function(): Promise<void> {
  const dbnameModelFirst = "strata-api-model-first";
  const dbnameDbFirst = "strata-api-db-first";

  const [
    {
      connString1: connStringModelFirst,
      connString2: connStringDbFirst,
      container
    }
  ] = await Promise.all([
    setupPostgres(dbnameModelFirst, dbnameDbFirst),
    generateTsoa({
      output: tsoaBuildDir,
      iocModule: iocModulePath
    })
  ]);

  // can't parallelize it because of sequelize global state
  // await initModelFirst(connStringModelFirst);
  await initDbFirst(connStringDbFirst);

  // global.* can be accessed in teardown.ts but not in the tests
  global.__PGCONTAINER__ = container;

  // process.env.* can be accessed in tests but its a bug
  // this is a hack until proper api is released
  // check https://github.com/facebook/jest/issues/7184#issuecomment-492122367
  process.env.__PGCONNSTRING_MODEL_FIRST__ = connStringModelFirst;
  process.env.__PGCONNSTRING_DB_FIRST__ = connStringDbFirst;

  logger.log(`Jest Global E2E Setup.`);
};
