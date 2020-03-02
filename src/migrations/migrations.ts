import { Sequelize } from "src/sequelize";
import { generatorToArray, traverseDirectory } from "src/utils";
import Migration from "./migration";

export async function readSQLMigrations(sqlDir: string): Promise<Migration[]> {
  const arr = await generatorToArray(traverseDirectory(sqlDir, ".sql"));
  arr.sort((a, b) => {
    if (a.filename < b.filename) {
      return -1;
    } else if (a.filename > b.filename) {
      return 1;
    } else {
      return 0;
    }
  });
  return arr.map(({ filename, content }) => ({
    name: filename,
    async up(sequelize: Sequelize) {
      await sequelize.query(content);
    }
  }));
}
