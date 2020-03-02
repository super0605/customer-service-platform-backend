import { LotsPostDto, LotsPutDto } from "src/dtos";
import { UnreachableError } from "src/errors";
import * as request from "supertest";
import {
  complexesPostDtoFactory,
  complexesPutDtoFactory,
  lotsPostDtoFactory,
  lotsPutDtoFactory,
  usersPostDtoFactory
} from "test/factories";
import {
  createNewComplex,
  createNewLot,
  createNewOrg,
  registerNewUser
} from "test/fixtures";
import {
  baseApiUrl,
  beforeAllWithCatch,
  getAuthHeader,
  mkTestApp
} from "test/helpers";

const basePath = `${baseApiUrl}/lots`;

describe(basePath, () => {
  const app = mkTestApp();

  describe("anonymous", () => {
    /** set up in beforeAllWithCatch */
    let complexId: number;

    beforeAllWithCatch(async () => {
      const complex = await createNewComplex();
      complexId = complex.id;
    });

    describe("POST", () => {
      it("should fail to post", async () => {
        const dto: LotsPostDto = lotsPostDtoFactory.build({ complexId });
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
        const dto: LotsPutDto = complexesPutDtoFactory.build();
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
    /** set up in beforeAllWithCatch */
    let lotId: number;
    /** set up in beforeAllWithCatch */
    let anotherLotId: number;

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

      const lot = await createNewLot(
        lotsPostDtoFactory.build({ complexId: complexId })
      );
      lotId = lot.id;

      const anotherLot = await createNewLot(
        lotsPostDtoFactory.build({ complexId: anotherComplexId })
      );
      anotherLotId = anotherLot.id;
    });

    describe("POST", () => {
      it("should post lot of related org", async () => {
        const dto: LotsPostDto = lotsPostDtoFactory.build({ complexId });
        const res = await request(app)
          .post(basePath)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(201);
      });

      it("should fail to post lot of other org", async () => {
        const dto: LotsPostDto = lotsPostDtoFactory.build({
          complexId: anotherComplexId
        });
        const res = await request(app)
          .post(basePath)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(401);
      });
    });

    describe("PUT", () => {
      it("should put lot of related org", async () => {
        const dto: LotsPutDto = lotsPutDtoFactory.build();
        const res = await request(app)
          .put(`${basePath}/${lotId}`)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(204);
      });

      it("should deactivate lot of related org", async () => {
        const dto: LotsPutDto = {
          isActive: false
        };
        const res = await request(app)
          .put(`${basePath}/${lotId}`)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(204);
      });

      it("should fail to put lot of other org", async () => {
        const dto: LotsPutDto = lotsPutDtoFactory.build();
        const res = await request(app)
          .put(`${basePath}/${anotherLotId}`)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(404);
      });

      it("should set users to lot", async () => {
        const { user } = await registerNewUser(
          usersPostDtoFactory.build({
            systemRole: "STANDARD_USER",
            orgId: orgId
          })
        );
        const userId = user.id;

        const dto: LotsPutDto = {
          roles: {
            LOT_OWNER: [
              {
                id: userId
              }
            ]
          }
        };

        const res = await request(app)
          .put(`${basePath}/${lotId}`)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(204);
      });

      it("should get lot with users", async () => {
        const { user } = await registerNewUser(
          usersPostDtoFactory.build({
            systemRole: "STANDARD_USER",
            orgId: orgId
          })
        );
        const userId = user.id;

        const dto: LotsPutDto = {
          roles: {
            LOT_OWNER: [
              {
                id: userId
              }
            ]
          }
        };

        // TODO: attach users to lot directly instead of reusing API endpoint
        await request(app)
          .put(`${basePath}/${lotId}`)
          .set("Authorization", authHeader)
          .send(dto);

        const res = await request(app)
          .get(`${basePath}/${lotId}`)
          .query({
            withRolesAndUsers: true
          })
          .set("Authorization", authHeader);

        expect(res.body.roles).toBeDefined();
      });
    });

    describe("GET", () => {
      it("should get", async () => {
        const res = await request(app)
          .get(basePath)
          .set("Authorization", authHeader);

        expect(res.status).toEqual(200);
      });

      it("should get lot of related org", async () => {
        const res = await request(app)
          .get(`${basePath}/${lotId}`)
          .set("Authorization", authHeader);

        expect(res.status).toEqual(200);
      });

      it("should fail to get lot of other org", async () => {
        const res = await request(app)
          .get(`${basePath}/${anotherLotId}`)
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
    /** set up in beforeAllWithCatch */
    let lotId: number;

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

      const complex = await createNewComplex(
        complexesPostDtoFactory.build({ orgId: orgId })
      );
      complexId = complex.id;

      const lot = await createNewLot(lotsPostDtoFactory.build({ complexId }));
      lotId = lot.id;
    });

    describe("POST", () => {
      it("should post lot", async () => {
        const dto: LotsPostDto = lotsPostDtoFactory.build({ complexId });
        const res = await request(app)
          .post(basePath)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(201);
      });
    });

    describe("PUT", () => {
      it("should put lot", async () => {
        const dto: LotsPutDto = lotsPutDtoFactory.build();
        const res = await request(app)
          .put(`${basePath}/${lotId}`)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(204);
      });

      it("should deactivate lot", async () => {
        const dto: LotsPutDto = {
          isActive: false
        };
        const res = await request(app)
          .put(`${basePath}/${lotId}`)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(204);
      });

      it("should fail to put missing lot", async () => {
        const nonExistentId = "12312312313";
        const dto: LotsPutDto = lotsPutDtoFactory.build();
        const res = await request(app)
          .post(`${basePath}/${nonExistentId}`)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(404);
      });

      it("should set users to lot", async () => {
        const { user } = await registerNewUser(
          usersPostDtoFactory.build({
            systemRole: "STANDARD_USER",
            orgId: orgId
          })
        );
        const userId = user.id;

        const dto: LotsPutDto = {
          roles: {
            LOT_OWNER: [
              {
                id: userId
              }
            ]
          }
        };

        const res = await request(app)
          .put(`${basePath}/${lotId}`)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(204);
      });

      it("should get lot with users", async () => {
        const { user } = await registerNewUser(
          usersPostDtoFactory.build({
            systemRole: "STANDARD_USER",
            orgId: orgId
          })
        );
        const userId = user.id;

        const dto: LotsPutDto = {
          roles: {
            LOT_OWNER: [
              {
                id: userId
              }
            ]
          }
        };

        // TODO: attach users to lot directly instead of reusing API endpoint
        await request(app)
          .put(`${basePath}/${lotId}`)
          .set("Authorization", authHeader)
          .send(dto);

        const res = await request(app)
          .get(`${basePath}/${lotId}`)
          .query({
            withRolesAndUsers: true
          })
          .set("Authorization", authHeader);

        expect(res.body.roles).toBeDefined();
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
