import * as sut from "src/auth/auth";

describe("auth/auth", () => {
  const sampleUser: sut.User = {
    id: 123123
  };

  const samplePayload: sut.JwtTokenPayload = {
    id: sampleUser.id
  };

  describe("generateAccessToken", () => {
    it("should generate successfully", async () => {
      const token = await sut.generateAccessToken(sampleUser);

      expect(token).toBeDefined();
      expect(token.length).toBeGreaterThan(0);
    });
  });

  describe("parseAccessToken", () => {
    it("should parse generated successfully", async () => {
      const token = await sut.generateAccessToken(sampleUser);

      const parsed = await sut.parseAccessToken(token);

      expect(parsed).toEqual(samplePayload);
    });

    it("should throw if incorrect token", () => {
      expect(sut.parseAccessToken("not-a-valid-token")).rejects.toThrow();
    });
  });
});
