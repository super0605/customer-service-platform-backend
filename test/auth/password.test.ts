import * as sut from "src/auth/password";

describe("auth/password", () => {
  describe("generatePassword", () => {
    it("should not generate equal passwords", () => {
      const res1 = sut.generatePassword();
      const res2 = sut.generatePassword();

      expect(res1).toBeTruthy();
      expect(res2).toBeTruthy();
      expect(res1).not.toEqual(res2);
    });
  });

  describe("generatePasswordHashWithSalt", () => {
    it("should generate successfully", async () => {
      const { salt, passwordHash } = await sut.generatePasswordHashWithSalt(
        "my password"
      );

      expect(salt).toBeDefined();
      expect(salt.length).toBeGreaterThan(0);
      expect(passwordHash).toBeDefined();
      expect(passwordHash.length).toBeGreaterThan(0);
    });
  });

  describe("generatePasswordHash", () => {
    it("should generate with explicit salt successfully", async () => {
      const hash = await sut.generatePasswordHash(
        "qwerqwerqwerqwerqwer",
        "my password"
      );

      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe("comparePasswordWithHash", () => {
    it("should compare same password", async () => {
      const salt = "qwerqwerqwerqwerqwer";
      const password = "my password";
      const hash = await sut.generatePasswordHash(salt, password);
      const result = await sut.comparePasswordWithHash(salt, hash, password);
      expect(result).toBe(true);
    });

    it("should not compare different passwords", async () => {
      const salt = "qwerqwerqwerqwerqwer";
      const hash = await sut.generatePasswordHash(salt, "my password 1");
      const result = await sut.comparePasswordWithHash(
        salt,
        hash,
        "my password 2"
      );
      expect(result).toBe(false);
    });
  });
});
