import logger from "src/logger";
import { Sequelize } from "src/sequelize";
import * as Umzug from "umzug";
import { readSQLMigrations } from "./migrations";
import UmzugCompatibleMigration from "./umzug-compatible-migration";

interface MigrationManagerOptions {
  sequelize: Sequelize;
  sqlMigrationsDir: string;
}

type MigrationManager = Umzug.Umzug;

export async function mkMigrationManager({
  sequelize,
  sqlMigrationsDir
}: MigrationManagerOptions): Promise<MigrationManager> {
  const migrations = await readSQLMigrations(sqlMigrationsDir);
  const umzug = new Umzug({
    storage: "sequelize",
    storageOptions: { sequelize },
    logging: logger.log,

    migrations: migrations.map(
      migration => new UmzugCompatibleMigration(sequelize, migration)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any // incomplete umzug typings, so we use any here
  });

  return umzug;
}
