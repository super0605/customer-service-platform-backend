import { UsersPostDto, UsersPutDto } from "src/dtos";
import { User } from "src/models";
import * as request from "supertest";
import { usersPostDtoFactory, usersPutDtoFactory } from "test/factories";
import { createNewOrg, registerNewUser } from "test/fixtures";
import {
  baseApiUrl,
  beforeAllWithCatch,
  getAuthHeader,
  mkTestApp
} from "test/helpers";

const basePath = `${baseApiUrl}/users`;

describe(basePath, () => {
  const app = mkTestApp();

  describe("anonymous", () => {
    describe("POST", () => {
      it("should fail to post", async () => {
        const dto: UsersPostDto = usersPostDtoFactory.build();
        const res = await request(app)
          .post(basePath)
          .send(dto);

        expect(res.status).toEqual(401);
      });
    });

    describe("PUT", () => {
      it("should fail to put", async () => {
        const dto: UsersPutDto = usersPutDtoFactory.build();
        const res = await request(app)
          .put(`${basePath}/123123`)
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
  });

  describe("MANAGER", () => {
    /** set up in beforeAllWithCatch */
    let authHeader: string;
    /** set up in beforeAllWithCatch */
    let userId: number;
    /** set up in beforeAllWithCatch */
    let orgId: number;

    beforeAllWithCatch(async () => {
      const org = await createNewOrg();

      const { accessToken, user } = await registerNewUser(
        usersPostDtoFactory.build({
          systemRole: "MANAGER",
          orgId: org.id
        })
      );
      authHeader = getAuthHeader(accessToken);
      userId = user.id;
      orgId = org.id;
    });

    describe("POST", () => {
      it("should not be able to create manager", async () => {
        const dto: UsersPostDto = usersPostDtoFactory.build({
          systemRole: "MANAGER"
        });
        const res = await request(app)
          .post(basePath)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(401);
      });

      it("should not be able to create manager admin", async () => {
        const dto: UsersPostDto = usersPostDtoFactory.build({
          systemRole: "MANAGER_ADMIN"
        });
        const res = await request(app)
          .post(basePath)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(401);
      });
    });

    describe("PUT", () => {
      describe("self update", () => {
        it("should update their personal details", async () => {
          const dto: UsersPutDto = usersPutDtoFactory.build({
            systemRole: undefined
          });

          const res = await request(app)
            .put(`${basePath}/${userId}`)
            .set("Authorization", authHeader)
            .send(dto);

          expect(res.status).toEqual(204);
        });

        it("should update their profile image", async () => {
          const { profileImage } = usersPutDtoFactory.build();
          const dto: UsersPutDto = {
            profileImage
          };

          const res = await request(app)
            .put(`${basePath}/${userId}`)
            .set("Authorization", authHeader)
            .send(dto);

          expect(res.status).toEqual(204);

          const user = await User.withProfileImageFindByPk(userId);
          expect(user?.profileImage?.imageUrl).toEqual(profileImage);
        });

        it("should not be able to update their system role", async () => {
          const dto: UsersPutDto = {
            systemRole: "MANAGER_ADMIN"
          };

          const res = await request(app)
            .put(`${basePath}/${userId}`)
            .set("Authorization", authHeader)
            .send(dto);

          expect(res.status).toEqual(401);
        });
      });

      describe("other user update", () => {
        /** set up in beforeAllWithCatch */
        let otherUserId: number;
        /** set up in beforeAllWithCatch */
        let otherUserSystemRole: string;

        beforeAllWithCatch(async () => {
          const dto = usersPostDtoFactory.build();
          const { user } = await registerNewUser(dto);
          otherUserId = user.id;
          otherUserSystemRole = dto.systemRole;
        });

        it("should not be able to update other user personal details", async () => {
          const dto: UsersPutDto = usersPutDtoFactory.build({
            systemRole: undefined
          });

          const res = await request(app)
            .put(`${basePath}/${otherUserId}`)
            .set("Authorization", authHeader)
            .send(dto);

          expect(res.status).toEqual(401);
        });

        it("should not be able to update other user system role", async () => {
          const dto: UsersPutDto = {
            systemRole:
              otherUserSystemRole === "MANAGER" ? "MANAGER_ADMIN" : "MANAGER"
          };

          const res = await request(app)
            .put(`${basePath}/${otherUserId}`)
            .set("Authorization", authHeader)
            .send(dto);

          expect(res.status).toEqual(401);
        });
      });
    });

    describe("GET", () => {
      it("should get successfully", async () => {
        const res = await request(app)
          .get(basePath)
          .set("Authorization", authHeader);
        expect(Array.isArray(res.body)).toBeTruthy();
        // expect(res.body).toBeType("array");
      });

      it("should get their user", async () => {
        const res = await request(app)
          .get(`${basePath}/${userId}`)
          .set("Authorization", authHeader);

        expect(res.status).toEqual(200);
      });

      it("should get their user with profile image", async () => {
        const res = await request(app)
          .get(`${basePath}/${userId}`)
          .query({
            withProfileImage: true
          })
          .set("Authorization", authHeader);

        expect(res.status).toEqual(200);
        expect(res.body.profileImage).toBeDefined();
      });

      it("should get other user", async () => {
        const { user } = await registerNewUser(
          usersPostDtoFactory.build({ orgId: orgId })
        );
        const otherUserId = user.id;

        const res = await request(app)
          .get(`${basePath}/${otherUserId}`)
          .set("Authorization", authHeader);

        expect(res.status).toEqual(200);
      });

      it("should not get user from other org", async () => {
        const otherOrg = await createNewOrg();
        const { user } = await registerNewUser(
          usersPostDtoFactory.build({ orgId: otherOrg.id })
        );
        const otherUserId = user.id;
        const res = await request(app)
          .get(`${basePath}/${otherUserId}`)
          .set("Authorization", authHeader);

        expect(res.status).toEqual(404);
      });

      it("should not get nonexistent user", async () => {
        const nonexistentId = 12312312;
        const res = await request(app)
          .get(`${basePath}/${nonexistentId}`)
          .set("Authorization", authHeader);

        expect(res.status).toEqual(404);
      });
    });
  });

  describe("MANAGER_ADMIN", () => {
    /** set up in beforeAllWithCatch */
    let authHeader: string;
    /** set up in beforeAllWithCatch */
    let userId: number;
    /** set up in beforeAllWithCatch */
    let orgId: number;

    beforeAllWithCatch(async () => {
      const org = await createNewOrg();

      const { accessToken, user } = await registerNewUser(
        usersPostDtoFactory.build({
          systemRole: "MANAGER_ADMIN",
          orgId: org.id
        })
      );
      authHeader = getAuthHeader(accessToken);
      userId = user.id;
      orgId = org.id;
    });

    describe("POST", () => {
      it("should not be able to create manager without org", async () => {
        const dto: UsersPostDto = usersPostDtoFactory.build({
          systemRole: "MANAGER"
        });
        const res = await request(app)
          .post(basePath)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(400);
      });

      it("should be able to create manager", async () => {
        const dto: UsersPostDto = usersPostDtoFactory.build({
          systemRole: "MANAGER",
          orgId
        });
        const res = await request(app)
          .post(basePath)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(201);
      });

      it("should be able to create manager admin", async () => {
        const dto: UsersPostDto = usersPostDtoFactory.build({
          systemRole: "MANAGER_ADMIN",
          orgId
        });
        const res = await request(app)
          .post(basePath)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(201);
      });
    });

    describe("PUT", () => {
      describe("self update", () => {
        it("should update their personal details", async () => {
          const dto: UsersPutDto = usersPutDtoFactory.build({
            systemRole: undefined
          });

          const res = await request(app)
            .put(`${basePath}/${userId}`)
            .set("Authorization", authHeader)
            .send(dto);

          expect(res.status).toEqual(204);
        });

        it("should update their system role", async () => {
          const dto: UsersPutDto = {
            systemRole: "MANAGER"
          };

          const res = await request(app)
            .put(`${basePath}/${userId}`)
            .set("Authorization", authHeader)
            .send(dto);

          expect(res.status).toEqual(204);
        });
      });

      describe("other user update", () => {
        /** set up in beforeAllWithCatch */
        let otherUserId: number;
        /** set up in beforeAllWithCatch */
        let otherUserSystemRole: string;

        beforeAllWithCatch(async () => {
          const dto = usersPostDtoFactory.build({ orgId });
          const { user } = await registerNewUser(dto);
          otherUserId = user.id;
          otherUserSystemRole = dto.systemRole;
        });

        it("should not be able to update other user personal details", async () => {
          const dto: UsersPutDto = usersPutDtoFactory.build({
            systemRole: undefined
          });

          const res = await request(app)
            .put(`${basePath}/${otherUserId}`)
            .set("Authorization", authHeader)
            .send(dto);

          expect(res.status).toEqual(401);
        });

        it("should update other user system role", async () => {
          const dto: UsersPutDto = {
            systemRole:
              otherUserSystemRole === "MANAGER" ? "MANAGER_ADMIN" : "MANAGER"
          };

          const res = await request(app)
            .put(`${basePath}/${otherUserId}`)
            .set("Authorization", authHeader)
            .send(dto);

          expect(res.status).toEqual(204);
        });

        it("should disable other manager admin", async () => {
          const { user } = await registerNewUser(
            usersPostDtoFactory.build({ systemRole: "MANAGER_ADMIN", orgId })
          );
          const otherUserId = user.id;

          const dto: UsersPutDto = {
            systemRole: "NOT_ACTIVE"
          };

          const res = await request(app)
            .put(`${basePath}/${otherUserId}`)
            .set("Authorization", authHeader)
            .send(dto);

          expect(res.status).toEqual(204);
        });

        it("should disable other manager", async () => {
          const { user } = await registerNewUser(
            usersPostDtoFactory.build({ systemRole: "MANAGER", orgId })
          );
          const otherUserId = user.id;

          const dto: UsersPutDto = {
            systemRole: "NOT_ACTIVE"
          };

          const res = await request(app)
            .put(`${basePath}/${otherUserId}`)
            .set("Authorization", authHeader)
            .send(dto);

          expect(res.status).toEqual(204);
        });
      });
    });

    describe("GET", () => {
      it("should get successfully", async () => {
        const res = await request(app)
          .get(basePath)
          .set("Authorization", authHeader);
        expect(Array.isArray(res.body)).toBeTruthy();
        // expect(res.body).toBeType("array");
      });

      it("should get their user", async () => {
        const res = await request(app)
          .get(`${basePath}/${userId}`)
          .set("Authorization", authHeader);

        expect(res.status).toEqual(200);
      });

      it("should get other user", async () => {
        const { user } = await registerNewUser(
          usersPostDtoFactory.build({ orgId })
        );
        const otherUserId = user.id;

        const res = await request(app)
          .get(`${basePath}/${otherUserId}`)
          .set("Authorization", authHeader);

        expect(res.status).toEqual(200);
      });

      it("should not get nonexistent user", async () => {
        const nonexistentId = 12312312;
        const res = await request(app)
          .get(`${basePath}/${nonexistentId}`)
          .set("Authorization", authHeader);

        expect(res.status).toEqual(404);
      });
    });
  });
});
