import { TicketsPostDto, TicketsPutDto } from "src/dtos";
import { Ticket } from "src/models";
import * as request from "supertest";
import {
  complexesPostDtoFactory,
  lotsPostDtoFactory,
  ticketsPostDtoFactory,
  ticketsPutDtoFactory,
  usersPostDtoFactory
} from "test/factories";
import {
  attachUsersToLot,
  createNewComplex,
  createNewLot,
  createNewOrg,
  createNewTicket,
  registerNewUser
} from "test/fixtures";
import {
  baseApiUrl,
  beforeAllWithCatch,
  getAuthHeader,
  mkTestApp
} from "test/helpers";

const basePath = `${baseApiUrl}/tickets`;

describe(basePath, () => {
  const app = mkTestApp();

  describe("anonymous", () => {
    /** set up in beforeAllWithCatch */
    let lotId: number;
    /** set up in beforeAllWithCatch */
    let ticketId: number;

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
      lotId = lot.id;

      const ticket = await createNewTicket(
        user.id,
        ticketsPostDtoFactory.build({
          primaryLotId: lotId,
          lots: [{ id: lotId }]
        })
      );
      ticketId = ticket.id;
    });

    describe("POST", () => {
      it("should fail to post", async () => {
        const dto: TicketsPostDto = ticketsPostDtoFactory.build({
          primaryLotId: lotId,
          lots: [{ id: lotId }]
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
        const res = await request(app).get(`${basePath}/${ticketId}`);

        expect(res.status).toEqual(401);
      });
    });

    describe("PUT", () => {
      it("should fail to put", async () => {
        const dto: TicketsPutDto = ticketsPutDtoFactory.build();
        const res = await request(app)
          .put(`${basePath}/${ticketId}`)
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
    let relatedComplexLotId: number;

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

      const relatedComplexLot = await createNewLot(
        lotsPostDtoFactory.build({ complexId })
      );
      relatedComplexLotId = relatedComplexLot.id;
    });

    describe("GET", () => {
      it("should get all issued tickets", async () => {
        const res = await request(app)
          .get(basePath)
          .set("Authorization", authHeader);

        expect(res.status).toEqual(200);
      });

      it("should get issued ticket", async () => {
        const res = await request(app)
          .get(`${basePath}/${ticketId}`)
          .set("Authorization", authHeader);

        expect(res.status).toEqual(200);
      });

      it("should not get same org ticket", async () => {
        const res = await request(app)
          .get(`${basePath}/${relatedLotTicketId}`)
          .set("Authorization", authHeader);

        expect(res.status).toEqual(404);
      });

      it("should not get other org ticket", async () => {
        const res = await request(app)
          .get(`${basePath}/${anotherTicketId}`)
          .set("Authorization", authHeader);

        expect(res.status).toEqual(404);
      });
    });

    describe("POST", () => {
      it("should post ticket of related lot", async () => {
        const dto: TicketsPostDto = ticketsPostDtoFactory.build({
          primaryLotId: lotId,
          lots: [{ id: lotId }]
        });
        const res = await request(app)
          .post(basePath)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(201);
      });

      it("should not post ticket of related complex other lot", async () => {
        const dto: TicketsPostDto = ticketsPostDtoFactory.build({
          primaryLotId: relatedComplexLotId,
          lots: [{ id: relatedComplexLotId }]
        });
        const res = await request(app)
          .post(basePath)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(404);
      });

      it("should not post ticket of other org", async () => {
        const dto: TicketsPostDto = ticketsPostDtoFactory.build({
          primaryLotId: anotherLotId,
          lots: [{ id: anotherLotId }]
        });
        const res = await request(app)
          .post(basePath)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(404);
      });
    });

    describe("PUT", () => {
      it("should not put issued ticket", async () => {
        const dto: TicketsPutDto = ticketsPutDtoFactory.build();
        const res = await request(app)
          .put(`${basePath}/${ticketId}`)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(401);
      });

      it("should not put ticket of related lot", async () => {
        const dto: TicketsPutDto = ticketsPutDtoFactory.build();
        const res = await request(app)
          .put(`${basePath}/${relatedLotTicketId}`)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(401);
      });

      it("should not put ticket of other org", async () => {
        const dto: TicketsPutDto = ticketsPutDtoFactory.build();
        const res = await request(app)
          .put(`${basePath}/${anotherTicketId}`)
          .set("Authorization", authHeader)
          .send(dto);

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
    let relatedComplexLotId: number;

    beforeAllWithCatch(async () => {
      const org = await createNewOrg();
      orgId = org.id;

      const { accessToken, user } = await registerNewUser(
        usersPostDtoFactory.build({
          orgId,
          systemRole: "MANAGER"
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

      const relatedComplexLot = await createNewLot(
        lotsPostDtoFactory.build({ complexId })
      );
      relatedComplexLotId = relatedComplexLot.id;
    });

    describe("GET", () => {
      it("should get all issued tickets", async () => {
        const res = await request(app)
          .get(basePath)
          .set("Authorization", authHeader);

        expect(res.status).toEqual(200);
      });

      it("should get issued ticket", async () => {
        const res = await request(app)
          .get(`${basePath}/${ticketId}`)
          .set("Authorization", authHeader);

        expect(res.status).toEqual(200);
      });

      it("should get same org ticket", async () => {
        const res = await request(app)
          .get(`${basePath}/${relatedLotTicketId}`)
          .set("Authorization", authHeader);

        expect(res.status).toEqual(200);
      });

      it("should not get other org ticket", async () => {
        const res = await request(app)
          .get(`${basePath}/${anotherTicketId}`)
          .set("Authorization", authHeader);

        expect(res.status).toEqual(404);
      });
    });

    describe("POST", () => {
      it("should post ticket of related lot", async () => {
        const dto: TicketsPostDto = ticketsPostDtoFactory.build({
          primaryLotId: lotId,
          lots: [{ id: lotId }]
        });
        const res = await request(app)
          .post(basePath)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(201);
      });

      it("should post ticket of related complex other lot", async () => {
        const dto: TicketsPostDto = ticketsPostDtoFactory.build({
          primaryLotId: relatedComplexLotId,
          lots: [{ id: relatedComplexLotId }]
        });
        const res = await request(app)
          .post(basePath)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(201);
      });

      it("should not post ticket of other org", async () => {
        const dto: TicketsPostDto = ticketsPostDtoFactory.build({
          primaryLotId: anotherLotId,
          lots: [{ id: anotherLotId }]
        });
        const res = await request(app)
          .post(basePath)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(404);
      });
    });

    describe("PUT", () => {
      it("should put issued ticket", async () => {
        const dto: TicketsPutDto = ticketsPutDtoFactory.build();
        const res = await request(app)
          .put(`${basePath}/${ticketId}`)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(204);
        const ticket = await Ticket.findByPkWithAssociations(ticketId);
        if (dto.profileImage !== undefined) {
          expect(ticket?.profileImage?.imageUrl).toEqual(dto.profileImage);
        }
      });

      it("should put ticket of related lot", async () => {
        const dto: TicketsPutDto = ticketsPutDtoFactory.build();
        const res = await request(app)
          .put(`${basePath}/${relatedLotTicketId}`)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(204);
      });

      it("should not put ticket of other org", async () => {
        const dto: TicketsPutDto = ticketsPutDtoFactory.build();
        const res = await request(app)
          .put(`${basePath}/${anotherTicketId}`)
          .set("Authorization", authHeader)
          .send(dto);

        expect(res.status).toEqual(404);
      });
    });
  });
});
