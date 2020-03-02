import { ComplexesPostDto, ComplexesPutDto } from "src/dtos";
import { UnreachableError } from "src/errors";
import * as request from "supertest";
import {
  complexesPostDtoFactory,
  complexesPutDtoFactory,
  usersPostDtoFactory
} from "test/factories";
import { createNewComplex, createNewOrg, registerNewUser } from "test/fixtures";
import {
  baseApiUrl,
  beforeAllWithCatch,
  getAuthHeader,
  mkTestApp
} from "test/helpers";

const basePath = `${baseApiUrl}/complexes`;

describe(basePath, () => {
  const app = mkTestApp();

  describe("anonymous", () => {
    /** set up in beforeAllWithCatch */
    let orgId: number;

    beforeAllWithCatch(async () => {
      const org = await createNewOrg();
      orgId = org.id;
    });

    describe("POST", () => {
      it("should fail to post", async () => {
        const dto: ComplexesPostDto = complexesPostDtoFactory.build({ orgId });
        const res = await request(app)
          .post(basePath)
          .send(dto);

        expect(res.status).toEqual(401);
      });
    });

    describe("GET", () => {
      it("should fail to get", async () => {
        const res = await request(app).get(basePath);

        expect(res.status).toEqual(401);
      });
    });

    describe("PUT", () => {
      it("should fail to put", async () => {
        const dto: ComplexesPutDto = complexesPutDtoFactory.build();
        const res = await request(app)
          .put(`${basePath}/1231231`)
          .send(dto);

        expect(res.status).toEqual(401);
      });
    });
  });

  describe("MANAGER", () => {
    /** set up in beforeAllWithCatch */
    let authHeader: string;
    /** set up in beforeAllWithCatch */
    let orgId: number;
    /** set up in beforeAllWithCatch */
    let anotherOrgId: number;
    /** set up in beforeAllWithCatch */
    let complexId: number;
    /** set up in beforeAllWithCatch */
    let anotherComplexId: number;

    beforeAllWithCatch(async () => {
      const { accessToken, user } = await registerNewUser(
        usersPostDtoFactory.build({
          systemRole: "MANAGER"
        })
      );
      authHeader = getAuthHeader(accessToken);
      if (!user.orgId) {
        throw new UnreachableError();
      }
      orgId = user.orgId;

      const anotherOrg = await createNewOrg();
      anotherOrgId = anotherOrg.id;

      const complex = await createNewComplex(
        complexesPostDtoFactory.build({ orgId: orgId })
      );
      complexId = complex.id;

      const anotherComplex = await createNewComplex(
        complexesPostDtoFactory.build({ orgId: anotherOrgId })
      );
      anotherComplexId = anotherComplex.id;
    });

    describe("POST", () => {
      it("should post complex of related org", async () => {
        const dto: ComplexesPostDto = complexesPostDtoFactory.build({ orgId });
        const res = await request(app)
          .post(basePath)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(201);
      });

      it("should fail to post complex of other org", async () => {
        const dto: ComplexesPostDto = complexesPostDtoFactory.build({
          orgId: anotherOrgId
        });
        const res = await request(app)
          .post(basePath)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(401);
      });
    });

    describe("PUT", () => {
      it("should put complex of related org", async () => {
        const dto: ComplexesPutDto = complexesPutDtoFactory.build();
        const res = await request(app)
          .put(`${basePath}/${complexId}`)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(204);
      });

      it("should deactivate complex of related org", async () => {
        const dto: ComplexesPutDto = {
          isActive: false
        };
        const res = await request(app)
          .put(`${basePath}/${complexId}`)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(204);
      });

      it("should fail to put complex of other org", async () => {
        const dto: ComplexesPutDto = complexesPutDtoFactory.build();
        const res = await request(app)
          .put(`${basePath}/${anotherComplexId}`)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(404);
      });
    });

    describe("GET", () => {
      it("should get", async () => {
        const res = await request(app)
          .get(basePath)
          .set("Authorization", authHeader);

        expect(res.status).toEqual(200);
      });

      it("should get complex of related org", async () => {
        const res = await request(app)
          .get(`${basePath}/${complexId}`)
          .set("Authorization", authHeader);

        expect(res.status).toEqual(200);
      });

      it("should fail to get complex of other org", async () => {
        const res = await request(app)
          .get(`${basePath}/${anotherComplexId}`)
          .set("Authorization", authHeader);

        expect(res.status).toEqual(404);
      });
    });
  });

  describe("MANAGER_ADMIN", () => {
    /** set up in beforeAllWithCatch */
    let authHeader: string;
    /** set up in beforeAllWithCatch */
    let orgId: number;
    /** set up in beforeAllWithCatch */
    let complexId: number;

    beforeAllWithCatch(async () => {
      const org = await createNewOrg();

      const { accessToken } = await registerNewUser(
        usersPostDtoFactory.build({
          systemRole: "MANAGER_ADMIN",
          orgId: org.id
        })
      );
      authHeader = getAuthHeader(accessToken);
      orgId = org.id;

      const complex = await createNewComplex(
        complexesPostDtoFactory.build({ orgId: orgId })
      );
      complexId = complex.id;
    });

    describe("POST", () => {
      it("should post complex", async () => {
        const dto: ComplexesPostDto = complexesPostDtoFactory.build({ orgId });
        const res = await request(app)
          .post(basePath)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(201);
      });
    });

    describe("PUT", () => {
      it("should put complex", async () => {
        const dto: ComplexesPutDto = complexesPutDtoFactory.build();
        const res = await request(app)
          .put(`${basePath}/${complexId}`)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(204);
      });

      it("should deactivate complex", async () => {
        const dto: ComplexesPutDto = {
          isActive: false
        };
        const res = await request(app)
          .put(`${basePath}/${complexId}`)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(204);
      });

      it("should fail to put missing complex", async () => {
        const nonExistentId = "12312312313";
        const dto: ComplexesPutDto = complexesPutDtoFactory.build();
        const res = await request(app)
          .post(`${basePath}/${nonExistentId}`)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(404);
      });
    });

    describe("GET", () => {
      it("should get", async () => {
        const res = await request(app)
          .get(basePath)
          .set("Authorization", authHeader);
        expect(Array.isArray(res.body)).toBeTruthy();
        // expect(res.body).toBeType("array");
      });
    });
  });
});
