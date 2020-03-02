import { AccessTokensPostDto } from "src/dtos";
import * as request from "supertest";
import { registerNewUser } from "test/fixtures";
import { baseApiUrl, beforeAllWithCatch, mkTestApp } from "test/helpers";

const basePath = `${baseApiUrl}/access-tokens`;

describe(basePath, () => {
  const app = mkTestApp();

  describe("anonymous", () => {
    const sampleDto: AccessTokensPostDto = {
      login: "nonexistent@email.com",
      password: "my password"
    };

    describe("POST", () => {
      it("should fail for incorrect credentials", async () => {
        const res = await request(app)
          .post(basePath)
          .send(sampleDto);

        expect(res.status).toEqual(401);
      });
    });

    describe("GET", () => {
      it("should fail for incorrect token", async () => {
        const res = await request(app).get(`${basePath}/invalid-token`);

        expect(res.status).toEqual(400);
      });
    });
  });

  describe("any user", () => {
    /** set in the beforeAllWithCatch */
    let sampleDto: AccessTokensPostDto;
    /** set in the beforeAllWithCatch */
    let accessToken: string;

    beforeAllWithCatch(async () => {
      const res = await registerNewUser();
      sampleDto = res.accessTokensPostDto;
      accessToken = res.accessToken;
    });

    describe("POST", () => {
      it("should fail for incorrect credentials", async () => {
        const res = await request(app)
          .post(basePath)
          .send({
            login: sampleDto.login,
            password: "definitely not correct password"
          });

        expect(res.status).toEqual(401);
      });

      it("should pass for correct credentials", async () => {
        const res = await request(app)
          .post(basePath)
          .send(sampleDto);

        expect(res.status).toEqual(201);
        expect(res.body).toHaveProperty("accessToken");
        expect(res.body.accessToken).toBeDefined();
        expect(res.body.accessToken.length).toBeGreaterThan(0);
      });
    });

    describe("GET", () => {
      it("should pass for correct token", async () => {
        const res = await request(app).get(`${basePath}/${accessToken}`);

        expect(res.status).toEqual(200);
        expect(res.body.accessToken).toEqual(accessToken);
      });
    });
  });
});
