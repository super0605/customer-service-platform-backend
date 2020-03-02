import { OrgsPostDto, OrgsPutDto } from "src/dtos";
import { UnreachableError } from "src/errors";
import * as request from "supertest";
import { orgsPostDtoFactory, usersPostDtoFactory } from "test/factories";
import {
  createNewOrg,
  loginAsNewManagerAdmin,
  registerNewUser
} from "test/fixtures";
import {
  baseApiUrl,
  beforeAllWithCatch,
  getAuthHeader,
  mkTestApp
} from "test/helpers";

const basePath = `${baseApiUrl}/orgs`;

describe(basePath, () => {
  const app = mkTestApp();

  describe("anonymous", () => {
    describe("POST", () => {
      it("should fail to post", async () => {
        const dto: OrgsPostDto = orgsPostDtoFactory.build();
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
        const dto: OrgsPutDto = orgsPostDtoFactory.build();
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
    });

    describe("POST", () => {
      it("should fail to post", async () => {
        const dto: OrgsPostDto = orgsPostDtoFactory.build();
        const res = await request(app)
          .post(basePath)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(401);
      });
    });

    describe("PUT", () => {
      it("should fail to put", async () => {
        const dto: OrgsPutDto = orgsPostDtoFactory.build();
        const res = await request(app)
          .put(`${basePath}/${orgId}`)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(401);
      });
    });

    describe("GET", () => {
      it("should fail to get", async () => {
        const res = await request(app)
          .get(basePath)
          .set("Authorization", authHeader);

        expect(res.status).toEqual(401);
      });

      it("should get their org", async () => {
        const res = await request(app)
          .get(`${basePath}/${orgId}`)
          .set("Authorization", authHeader);

        expect(res.status).toEqual(200);
      });

      it("should get their org with profile image", async () => {
        const res = await request(app)
          .get(`${basePath}/${orgId}`)
          .query({
            withProfileImage: true
          })
          .set("Authorization", authHeader);

        expect(res.status).toEqual(200);
        expect(res.body.profileImage).toBeDefined();
      });

      it("should fail to get other org", async () => {
        const { id: otherOrgId } = await createNewOrg();

        const res = await request(app)
          .get(`${basePath}/${otherOrgId}`)
          .set("Authorization", authHeader);

        expect(res.status).toEqual(401);
      });
    });
  });

  describe("MANAGER_ADMIN", () => {
    /** set up in beforeAllWithCatch */
    let authHeader: string;

    beforeAllWithCatch(async () => {
      const accessToken = await loginAsNewManagerAdmin();
      authHeader = getAuthHeader(accessToken);
    });

    describe("POST", () => {
      it("should not be able to create org", async () => {
        const dto: OrgsPostDto = orgsPostDtoFactory.build();
        const res = await request(app)
          .post(basePath)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(401);
      });
    });

    describe("PUT", () => {
      it("should not be able to update other org", async () => {
        const org = await createNewOrg();
        const dto: OrgsPutDto = orgsPostDtoFactory.build();
        const res = await request(app)
          .put(`${basePath}/${org.id}`)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(401);
      });

      it("should not be able to update missing org", async () => {
        const nonExistentId = "12312312313";
        const dto: OrgsPutDto = orgsPostDtoFactory.build();
        const res = await request(app)
          .post(`${basePath}/${nonExistentId}`)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(404);
      });
    });
  });
});
