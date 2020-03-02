import * as request from "supertest";
import {
  complexesPostDtoFactory,
  lotsPostDtoFactory,
  ticketsPostDtoFactory,
  usersPostDtoFactory,
  ticketCommentsPostDtoFactory,
  ticketCommentsPutDtoFactory
} from "test/factories";
import {
  attachUsersToLot,
  createNewComplex,
  createNewLot,
  createNewOrg,
  createNewTicket,
  registerNewUser,
  createNewTicketComment
} from "test/fixtures";
import {
  baseApiUrl,
  beforeAllWithCatch,
  getAuthHeader,
  mkTestApp
} from "test/helpers";
import { TicketCommentsPostDto, TicketCommentsPutDto } from "src/dtos";

const basePath = `${baseApiUrl}/ticket-comments`;

describe(basePath, () => {
  const app = mkTestApp();

  describe("anonymous", () => {
    /** set up in beforeAllWithCatch */
    let ticketId: number;
    /** set up in beforeAllWithCatch */
    let ticketCommentId: number;

    beforeAllWithCatch(async () => {
      const org = await createNewOrg();

      const { user } = await registerNewUser(
        usersPostDtoFactory.build({ orgId: org.id })
      );

      const complex = await createNewComplex(
        complexesPostDtoFactory.build({ orgId: org.id })
      );

      const lot = await createNewLot(
        lotsPostDtoFactory.build({ complexId: complex.id })
      );

      const ticket = await createNewTicket(
        user.id,
        ticketsPostDtoFactory.build({
          primaryLotId: lot.id,
          lots: [{ id: lot.id }]
        })
      );
      ticketId = ticket.id;

      const ticketComment = await createNewTicketComment(
        user.id,
        ticketCommentsPostDtoFactory.build({ ticketId })
      );
      ticketCommentId = ticketComment.id;
    });

    describe("POST", () => {
      it("should fail to post", async () => {
        const dto: TicketCommentsPostDto = ticketCommentsPostDtoFactory.build({
          ticketId
        });
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

      it("should fail to get single", async () => {
        const res = await request(app).get(`${basePath}/${ticketCommentId}`);

        expect(res.status).toEqual(401);
      });
    });

    describe("PUT", () => {
      it("should fail to put", async () => {
        const dto: TicketCommentsPutDto = ticketCommentsPutDtoFactory.build();
        const res = await request(app)
          .put(`${basePath}/${ticketCommentId}`)
          .send(dto);

        expect(res.status).toEqual(401);
      });
    });
  });

  describe("STANDARD_USER", () => {
    /** set up in beforeAllWithCatch */
    let authHeader: string;
    /** set up in beforeAllWithCatch */
    let userId: number;
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
    /** set up in beforeAllWithCatch */
    let ticketId: number;
    /** set up in beforeAllWithCatch */
    let anotherTicketId: number;
    /** set up in beforeAllWithCatch */
    let relatedLotTicketId: number;
    /** set up in beforeAllWithCatch */
    let ticketCommentId: number;
    /** set up in beforeAllWithCatch */
    let sameTicketAnotherUserCommentId: number;
    /** set up in beforeAllWithCatch */
    let relatedLotTicketCommentId: number;
    /** set up in beforeAllWithCatch */
    let anotherTicketCommentId: number;

    beforeAllWithCatch(async () => {
      const org = await createNewOrg();
      orgId = org.id;

      const { accessToken, user } = await registerNewUser(
        usersPostDtoFactory.build({
          orgId,
          systemRole: "STANDARD_USER"
        })
      );
      authHeader = getAuthHeader(accessToken);
      userId = user.id;

      const { user: user2 } = await registerNewUser(
        usersPostDtoFactory.build({
          orgId,
          systemRole: "STANDARD_USER"
        })
      );
      const user2Id = user2.id;

      const complex = await createNewComplex(
        complexesPostDtoFactory.build({ orgId: orgId })
      );
      complexId = complex.id;

      const lot = await createNewLot(
        lotsPostDtoFactory.build({ complexId: complexId })
      );
      lotId = lot.id;

      await attachUsersToLot(lotId, {
        LOT_OWNER: [{ id: userId }, { id: user2Id }]
      });

      const ticket = await createNewTicket(
        userId,
        ticketsPostDtoFactory.build({
          primaryLotId: lotId,
          lots: [{ id: lotId }]
        })
      );
      ticketId = ticket.id;

      const relatedLotTicket = await createNewTicket(
        user2Id,
        ticketsPostDtoFactory.build({
          primaryLotId: lotId,
          lots: [{ id: lotId }]
        })
      );
      relatedLotTicketId = relatedLotTicket.id;

      const anotherOrg = await createNewOrg();
      anotherOrgId = anotherOrg.id;

      const { user: user3 } = await registerNewUser(
        usersPostDtoFactory.build({
          orgId: anotherOrgId,
          systemRole: "STANDARD_USER"
        })
      );
      const user3Id = user3.id;

      const anotherComplex = await createNewComplex(
        complexesPostDtoFactory.build({ orgId: anotherOrgId })
      );
      anotherComplexId = anotherComplex.id;

      const anotherLot = await createNewLot(
        lotsPostDtoFactory.build({ complexId: anotherComplexId })
      );
      anotherLotId = anotherLot.id;

      await attachUsersToLot(anotherLotId, { LOT_OWNER: [{ id: user3Id }] });

      const anotherTicket = await createNewTicket(
        user3Id,
        ticketsPostDtoFactory.build({
          primaryLotId: anotherLotId,
          lots: [{ id: anotherLotId }]
        })
      );
      anotherTicketId = anotherTicket.id;

      const ticketComment = await createNewTicketComment(
        userId,
        ticketCommentsPostDtoFactory.build({ ticketId })
      );
      ticketCommentId = ticketComment.id;

      const { user: manager } = await registerNewUser(
        usersPostDtoFactory.build({ orgId, systemRole: "MANAGER" })
      );

      const sameTicketAnotherUserComment = await createNewTicketComment(
        manager.id,
        ticketCommentsPostDtoFactory.build({ ticketId })
      );
      sameTicketAnotherUserCommentId = sameTicketAnotherUserComment.id;

      const relatedLotTicketComment = await createNewTicketComment(
        user2Id,
        ticketCommentsPostDtoFactory.build({ ticketId: relatedLotTicketId })
      );
      relatedLotTicketCommentId = relatedLotTicketComment.id;

      const anotherTicketComment = await createNewTicketComment(
        user3Id,
        ticketCommentsPostDtoFactory.build({ ticketId: anotherTicketId })
      );
      anotherTicketCommentId = anotherTicketComment.id;
    });

    describe("GET", () => {
      it("should get all ticket comments for issued ticket", async () => {
        const res = await request(app)
          .get(basePath)
          .query({ ticketId })
          .set("Authorization", authHeader);

        expect(res.status).toEqual(200);
      });

      it("should get comment for created ticket comment", async () => {
        const res = await request(app)
          .get(`${basePath}/${ticketCommentId}`)
          .set("Authorization", authHeader);

        expect(res.status).toEqual(200);
      });

      it("should not get same org ticket comment", async () => {
        const res = await request(app)
          .get(`${basePath}/${relatedLotTicketCommentId}`)
          .set("Authorization", authHeader);

        expect(res.status).toEqual(404);
      });

      it("should not get other org ticket comment", async () => {
        const res = await request(app)
          .get(`${basePath}/${anotherTicketCommentId}`)
          .set("Authorization", authHeader);

        expect(res.status).toEqual(404);
      });
    });

    describe("POST", () => {
      it("should post ticket comment of issued ticket", async () => {
        const dto: TicketCommentsPostDto = ticketCommentsPostDtoFactory.build({
          ticketId
        });
        const res = await request(app)
          .post(basePath)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(201);
      });

      it("should not post ticket comment of related lot ticket", async () => {
        const dto: TicketCommentsPostDto = ticketCommentsPostDtoFactory.build({
          ticketId: relatedLotTicketId
        });
        const res = await request(app)
          .post(basePath)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(404);
      });

      it("should not post ticket comment of other org", async () => {
        const dto: TicketCommentsPostDto = ticketCommentsPostDtoFactory.build({
          ticketId: anotherTicketId
        });
        const res = await request(app)
          .post(basePath)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(404);
      });
    });

    describe("PUT", () => {
      it("should put created ticket comment", async () => {
        const dto: TicketCommentsPutDto = ticketCommentsPutDtoFactory.build();
        const res = await request(app)
          .put(`${basePath}/${ticketCommentId}`)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(204);
      });

      it("should not put ticket comment of same ticket other user", async () => {
        const dto: TicketCommentsPutDto = ticketCommentsPutDtoFactory.build();
        const res = await request(app)
          .put(`${basePath}/${sameTicketAnotherUserCommentId}`)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(404);
      });

      it("should not put ticket comment of other org", async () => {
        const dto: TicketCommentsPutDto = ticketCommentsPutDtoFactory.build();
        const res = await request(app)
          .put(`${basePath}/${anotherTicketCommentId}`)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(404);
      });
    });
  });
});
