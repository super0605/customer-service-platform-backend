import sgMail = require("@sendgrid/mail");
import env from "src/env";
import {
  AuthNoPermissionError,
  mkSecurityManager
} from "src/auth";
import {
  ErrorEntityNotFoundDto,
  TicketsGetResponseDto,
  TicketsGetValidationQueryErrorDto,
  TicketsPostDto,
  TicketsPostValidationBodyErrorDto,
  TicketsPutDto,
  TicketsPutValidationBodyErrorDto,
  TicketsResponseDto
} from "src/dtos";
import {
  provideController
} from "src/ioc";



import {
  AuthorizedRequest
} from "src/middlewares/auth";
import {
  Complex,
  Lot,
  User,
  Ticket,
  UserLotRole,
  SystemRole
} from "src/models";
import {
  ModelEntityNotFoundError,
  ModelForeignEntityNotFoundError
} from "src/models/errors";
import {
  TicketWithAssociations
} from "src/models/ticket";
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Request,
  Response,
  Route,
  Security,
  SuccessResponse
} from "tsoa";

// must not use default export due to how tsoa generates routes
@Route("tickets")
// eslint-disable-next-line @typescript-eslint/no-use-before-define
@provideController(TicketsController)
export class TicketsController extends Controller {
  /**
   * @isInt orgId invalid integer number
   * @minimum orgId 1
   *
   * @isInt complexId invalid integer number
   * @minimum complexId 1
   *
   * @isInt primaryLotId invalid integer number
   * @minimum primaryLotId 1
   */
  @Security("AuthorizationHeaderBearer")
  @Response < TicketsGetValidationQueryErrorDto > (
    400,
    "Failed Request Query Validation"
    // TODO: example
  )
  @Get()
  public async getTickets(
    @Request() request: AuthorizedRequest,
    @Query() orgId ? : number,
    @Query() complexId ? : number,
    @Query() primaryLotId ? : number,
    @Query() lotId ? : number
    // TODO: optional inclusion of associations
    // @Query() withLots = false,
  ): Promise < TicketsGetResponseDto[] > {
    const securityManager = mkSecurityManager(request);
    securityManager.ensureAtLeastOne([
      "READ_TICKETS",
      "READ_TICKETS_OF_RELATED_ORG",
      "READ_TICKETS_ISSUED"
    ]);
    const relatedOrgId = request.user.orgId;

    const accessAll = securityManager.hasPermission("READ_TICKETS");
    const accessRelatedOrg = securityManager.hasPermission(
      "READ_TICKETS_OF_RELATED_ORG"
    );

    if (accessAll) {
      return (
        await Ticket.findAllWithAssociations({
          orgId,
          complexId,
          primaryLotId,
          lotId
        })
      ).map(t => Ticket.toGetDtoWithAssociations(t));
    } else {
      if (relatedOrgId) {
        if (orgId && relatedOrgId !== orgId) {
          throw new AuthNoPermissionError("READ_TICKETS");
        } else {
          if (accessRelatedOrg) {
            return (
              await Ticket.findAllWithAssociations({
                orgId: relatedOrgId,
                complexId,
                primaryLotId,
                lotId
              })
            ).map(t => Ticket.toGetDtoWithAssociations(t));
          } else {
            return (
              await Ticket.findAllWithAssociations({
                orgId: relatedOrgId,
                complexId,
                primaryLotId,
                issuerId: request.user.id,
                lotId
              })
            ).map(t => Ticket.toGetDtoWithAssociations(t));
          }
        }
      } else {
        throw new AuthNoPermissionError("READ_TICKETS");
      }
    }
  }

  /**
   * @isInt id invalid integer number
   * @minimum id 1
   */
  @Security("AuthorizationHeaderBearer")
  @Get("{id}")
  @Response < ErrorEntityNotFoundDto > (404, "Requested ticket is not found", {
    name: "ModelEntityNotFoundError",
    message: "Entity '123123' of type 'Ticket' is not found.",
    id: 123123,
    modelName: "Ticket"
  })
  public async getTicket(
    @Request() request: AuthorizedRequest,
    // TODO: optional inclusion of associations
    // @Query() withLots = false,
    id: number
  ): Promise < TicketsGetResponseDto > {
    const securityManager = mkSecurityManager(request);
    securityManager.ensureAtLeastOne([
      "READ_TICKETS",
      "READ_TICKETS_OF_RELATED_ORG",
      "READ_TICKETS_ISSUED"
    ]);
    const relatedOrgId = request.user.orgId;

    const accessAll = securityManager.hasPermission("READ_TICKETS");
    const accessRelatedOrg = securityManager.hasPermission(
      "READ_TICKETS_OF_RELATED_ORG"
    );

    if (accessAll) {
      const ticket = await Ticket.findByPkWithAssociations(id);
      if (!ticket) {
        throw new ModelEntityNotFoundError("Ticket", id);
      }
      return Ticket.toGetDtoWithAssociations(ticket);
    } else {
      if (relatedOrgId) {
        if (accessRelatedOrg) {
          const ticket = await Ticket.findByPkWithAssociations(id, {
            orgId: relatedOrgId
          });
          if (!ticket) {
            throw new ModelEntityNotFoundError("Ticket", id);
          }
          return Ticket.toGetDtoWithAssociations(ticket);
        } else {
          const ticket = await Ticket.findByPkWithAssociations(id, {
            orgId: relatedOrgId,
            issuerId: request.user.id
          });
          if (!ticket) {
            throw new ModelEntityNotFoundError("Ticket", id);
          }
          return Ticket.toGetDtoWithAssociations(ticket);
        }
      } else {
        throw new AuthNoPermissionError("READ_TICKETS");
      }
    }
  }

  @Security("AuthorizationHeaderBearer")
  @Post()
  @SuccessResponse(201)
  @Response < TicketsPostValidationBodyErrorDto > (
    400,
    "Failed Request Body Validation", {
      name: "ValidationError",
      type: "body",
      message: "Failed request body validation",
      fields: {
        primaryLotId: {
          value: 123123,
          rules: [{
            name: "foreignEntityExists",
            modelName: "Lot",
            message: "Associated entity '123123' of type 'Lot' not found"
          }]
        }
      }
    }
  )
  public async postTicket(
    @Request() request: AuthorizedRequest,
    @Body() dto: TicketsPostDto
  ): Promise < TicketsResponseDto > {
    const securityManager = mkSecurityManager(request);
    securityManager.ensureAtLeastOne([
      "CREATE_TICKET",
      "CREATE_TICKET_OF_RELATED_ORG",
      "CREATE_TICKET_OF_RELATED_LOT"
    ]);
    const relatedOrgId = request.user.orgId;

    const accessAll = securityManager.hasPermission("CREATE_TICKET");

    const input = Ticket.fromPostDtoToInput(request.user.id, dto);

    if (accessAll) {
      const ticket = await Ticket.createWithAssociations(input);
      this.setStatus(201);
      return Ticket.toDtoWithAssociations(ticket);
    } else {
      if (relatedOrgId) {
        if (securityManager.hasPermission("CREATE_TICKET_OF_RELATED_ORG")) {
          const lot = await Lot.findByPk(dto.primaryLotId, {
            include: [{
              model: Complex,
              where: {
                orgId: relatedOrgId
              }
            }]
          });
          if (!lot) {
            throw new ModelForeignEntityNotFoundError < Ticket > (
              "Lot",
              dto.primaryLotId,
              "primaryLotId"
            );
          }
        } else {
          const lot = await Lot.findByPk(dto.primaryLotId, {
            include: [{
              model: UserLotRole,
              where: {
                userId: request.user.id
              }
            }]
          });
          if (!lot) {
            throw new ModelForeignEntityNotFoundError < Ticket > (
              "Lot",
              dto.primaryLotId,
              "primaryLotId"
            );
          }
        }

        const ticket = await Ticket.createWithAssociations(input);


        const sm = await User.findOne({
          include: [{
            model: SystemRole,
            where: {
              name: "MANAGER",
            }
          }],
          where: {
            orgId: relatedOrgId
          }
        });


        if (sm) {

          sgMail.setApiKey(env.SENDGRID_API_KEY);



          sgMail.send({
            to: sm.primaryEmail || "nanomeko@gmail.com",
            from: 'hello@hello.town',
            templateId: env.SM_NOTIFICATION_OF_NEW_TICKET_EMAIL,
            subject: 'Your ticket was updated',
            dynamicTemplateData: {
              type: ticket.ticketType,
              title: ticket.title,
              description: ticket.description,
              link: 'https://hello.herokuapp.com/ticket-edit/' + ticket.id,
            },
          }).then(() => {
            console.log("Sent email");
          }, err => {
            console.error(err);
          });

        }
        this.setStatus(201);
        return Ticket.toDtoWithAssociations(ticket);
      } else {
        throw new AuthNoPermissionError("CREATE_TICKET");
      }
    }





  }

  /**
   * @isInt id invalid integer number
   * @minimum id 1
   */
  @Security("AuthorizationHeaderBearer")
  @Put("{id}")
  @SuccessResponse(204)
  @Response < TicketsPutValidationBodyErrorDto > (
    400,
    "Failed Request Body Validation", {
      name: "ValidationError",
      type: "body",
      message: "Failed request body validation",
      fields: {
        ticketStatus: {
          value: "OPEN123",
          rules: [{
            name: "foreignEntityExists",
            modelName: "TicketStatus",
            message: "Associated entity 'OPEN123' of type 'TicketStatus' not found"
          }]
        },
        ticketType: {
          rules: [{
            message: "should be one of the following; ['Problem', 'Question', 'Community notice']",
            name: "isEnum"
          }],
          value: "Problem 123"
        },
        problemCategory: {
          rules: [{
            message: "should be one of the following; ['Plumbing', 'Structural', 'Communal Areas', 'Electrical']",
            name: "isEnum"
          }],
          value: "Plumbing 123"
        }
      }
    }
  )
  @Response < ErrorEntityNotFoundDto > (404, "Requested ticket is not found", {
    name: "ModelEntityNotFoundError",
    message: "Entity '123123' of type 'Ticket' is not found.",
    id: 123123,
    modelName: "Ticket"
  })
  public async putTicket(
    @Request() request: AuthorizedRequest,
    @Body() dto: TicketsPutDto,
    id: number
  ): Promise < void > {
    const securityManager = mkSecurityManager(request);
    securityManager.ensureAtLeastOne([
      "UPDATE_TICKETS",
      "UPDATE_TICKETS_OF_RELATED_ORG"
    ]);
    const relatedOrgId = request.user.orgId;

    const accessAll = securityManager.hasPermission("UPDATE_TICKETS");

    let ticket: TicketWithAssociations;
    if (accessAll) {
      const nullable = await Ticket.findByPkWithAssociations(id);
      if (!nullable) {
        throw new ModelEntityNotFoundError("Ticket", id);
      }
      ticket = nullable;
    } else {
      if (relatedOrgId) {
        const nullable = await Ticket.findByPkWithAssociations(id, {
          orgId: relatedOrgId
        });
        if (!nullable) {
          throw new ModelEntityNotFoundError("Ticket", id);
        }
        ticket = nullable;
      } else {
        throw new AuthNoPermissionError("UPDATE_TICKETS");
      }
    }

    const input = Ticket.fromPutDtoToInput(dto);
    await ticket.updateWithAssociations(input);

    sgMail.setApiKey(env.SENDGRID_API_KEY);


    const creator = await User.findByPk(ticket.issuerId);

    const recipient = creator?.primaryEmail || 'nanomeko@gmail.com'
    console.log("Sending email to ticket issuer")
    console.log(recipient)

    console.log(recipient)
    console.log("Template ID")
    console.log(env.EMAIL_USERS_TICKET_UPDATED_ID)

    sgMail.send({
      to: recipient,
      from: 'hello@strata.town',
      templateId: env.EMAIL_USERS_TICKET_UPDATED_ID,
      subject: 'There was an update to your ticket',
      dynamicTemplateData: {
        title: ticket.title,
        link: 'https://strata-town.herokuapp.com/ticket-edit/' + ticket.id,
      },
    }).then(() => {
      console.log("Sent email");
    }, err => {
      console.error(err);
    });

  }
}
