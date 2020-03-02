import * as path from "path";
import * as sut from "src/migrations/migrations";

describe("migrations/migrations", () => {
  describe("readSQLMigrations", () => {
    const sqlDir = path.join(__dirname, "__sql__");
    it("should pass", async () => {
      const migrations = await sut.readSQLMigrations(sqlDir);
      expect(migrations.length).toBeGreaterThan(0);
    });

    it("should read in alphabetical order", async () => {
      const migrations = await sut.readSQLMigrations(sqlDir);

      const names = migrations.map(m => m.name);
      const sortedNames = [
        "001-initial.sql",
        "002-second.sql",
        "011-initial.sql"
      ];
      expect(names).toEqual(sortedNames);
    });

    it("should ignore nonsql", async () => {
      const migrations = await sut.readSQLMigrations(sqlDir);
      const found = migrations.find(m => path.extname(m.name) !== ".sql");
      expect(found).toBeUndefined();
    });
  });
});
