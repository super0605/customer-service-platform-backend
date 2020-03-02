import * as request from "supertest";
import { mkTestApp } from "test/helpers";

const basePath = "/docs";

describe(basePath, () => {
  const app = mkTestApp();

  describe("GET", () => {
    it("should get successfully", async () => {
      const res = await request(app).get(basePath);

      expect(res.status).toBeLessThan(400);
    });
  });
});
