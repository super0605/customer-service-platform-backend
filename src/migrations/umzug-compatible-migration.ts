import { Sequelize } from "src/sequelize";
import Migration from "./migration";

export default class UmzugCompatibleMigration {
  file: string;

  constructor(private sequelize: Sequelize, private migrationToRun: Migration) {
    this.file = migrationToRun.name;
  }

  async migration(): Promise<void> {
    return;
  }

  up(): Promise<void> {
    if (!this.migrationToRun.up) {
      throw new Error("Could not find migration method: up");
    }
    return this.migrationToRun.up(this.sequelize);
  }

  down(): Promise<void> {
    if (!this.migrationToRun.down) {
      throw new Error("Could not find migration method: down");
    }
    return this.migrationToRun.down(this.sequelize);
  }

  testFileName(needle: string): boolean {
    return this.migrationToRun.name.indexOf(needle) === 0;
  }
}
