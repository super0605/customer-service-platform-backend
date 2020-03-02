import { AuthNoPermissionError, mkSecurityManager } from "src/auth";
import {
  ErrorEntityNotFoundDto,
  TicketCommentsGetValidationQueryErrorDto,
  TicketCommentsPostDto,
  TicketCommentsPostValidationBodyErrorDto,
  TicketCommentsPutDto,
  TicketCommentsPutValidationBodyErrorDto,
  TicketCommentsResponseDto
} from "src/dtos";
import { provideController } from "src/ioc";
import { AuthorizedRequest } from "src/middlewares/auth";
import { Ticket, TicketComment } from "src/models";
import {
  ModelEntityNotFoundError,
  ModelForeignEntityNotFoundError
} from "src/models/errors";
import { TicketCommentWithAssociations } from "src/models/ticket-comment";
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
@Route("ticket-comments")
// eslint-disable-next-line @typescript-eslint/no-use-before-define
@provideController(TicketCommentsController)
export class TicketCommentsController extends Controller {
  /**
   * @isInt ticketId invalid integer number
   * @minimum ticketId 1
   */
  @Security("AuthorizationHeaderBearer")
  @Response<TicketCommentsGetValidationQueryErrorDto>(
    400,
    "Failed Request Query Validation"
    // TODO: example
  )
  @Get()
  public async getTicketComments(
    @Request() request: AuthorizedRequest,
    @Query() ticketId: number
  ): Promise<TicketCommentsResponseDto[]> {
    const securityManager = mkSecurityManager(request);
    securityManager.ensureAtLeastOne([
      "READ_TICKET_COMMENTS",
      "READ_TICKET_COMMENTS_OF_RELATED_ORG",
      "READ_TICKET_COMMENTS_ISSUED"
    ]);
    const relatedOrgId = request.user.orgId;

    const accessAll = securityManager.hasPermission("READ_TICKET_COMMENTS");
    const accessRelatedOrg = securityManager.hasPermission(
      "READ_TICKET_COMMENTS_OF_RELATED_ORG"
    );

    if (accessAll) {
      return (
        await TicketComment.findAllWithAssociations({ ticketId })
      ).map(t => TicketComment.toDtoWithAssociations(t));
    } else {
      if (relatedOrgId) {
        if (accessRelatedOrg) {
          return (
            await TicketComment.findAllWithAssociations({
              orgId: relatedOrgId,
              ticketId
            })
          ).map(t => TicketComment.toDtoWithAssociations(t));
        } else {
          return (
            await TicketComment.findAllWithAssociations({
              ticketId,
              issuerId: request.user.id
            })
          ).map(t => TicketComment.toDtoWithAssociations(t));
        }
      } else {
        throw new AuthNoPermissionError("READ_TICKET_COMMENTS");
      }
    }
  }

  /**
   * @isInt id invalid integer number
   * @minimum id 1
   */
  @Security("AuthorizationHeaderBearer")
  @Get("{id}")
  @Response<ErrorEntityNotFoundDto>(
    404,
    "Requested ticket comment is not found",
    {
      name: "ModelEntityNotFoundError",
      message: "Entity '123123' of type 'TicketComment' is not found.",
      id: 123123,
      modelName: "TicketComment"
    }
  )
  public async getTicketComment(
    @Request() request: AuthorizedRequest,
    id: number
  ): Promise<TicketCommentsResponseDto> {
    const securityManager = mkSecurityManager(request);
    securityManager.ensureAtLeastOne([
      "READ_TICKET_COMMENTS",
      "READ_TICKET_COMMENTS_OF_RELATED_ORG",
      "READ_TICKET_COMMENTS_ISSUED"
    ]);
    const relatedOrgId = request.user.orgId;

    const accessAll = securityManager.hasPermission("READ_TICKET_COMMENTS");
    const accessRelatedOrg = securityManager.hasPermission(
      "READ_TICKET_COMMENTS_OF_RELATED_ORG"
    );

    if (accessAll) {
      const ticketComment = await TicketComment.findByPkWithAssociations(id);
      if (!ticketComment) {
        throw new ModelEntityNotFoundError("TicketComment", id);
      }
      return TicketComment.toDtoWithAssociations(ticketComment);
    } else {
      if (relatedOrgId) {
        if (accessRelatedOrg) {
          const ticketComment = await TicketComment.findByPkWithAssociations(
            id,
            {
              orgId: relatedOrgId
            }
          );
          if (!ticketComment) {
            throw new ModelEntityNotFoundError("TicketComment", id);
          }
          return TicketComment.toDtoWithAssociations(ticketComment);
        } else {
          const ticketComment = await TicketComment.findByPkWithAssociations(
            id,
            {
              issuerId: request.user.id
            }
          );
          if (!ticketComment) {
            throw new ModelEntityNotFoundError("TicketComment", id);
          }
          return TicketComment.toDtoWithAssociations(ticketComment);
        }
      } else {
        throw new AuthNoPermissionError("READ_TICKET_COMMENTS");
      }
    }
  }

  @Security("AuthorizationHeaderBearer")
  @Post()
  @SuccessResponse(201)
  @Response<TicketCommentsPostValidationBodyErrorDto>(
    400,
    "Failed Request Body Validation"
    // TODO: add example
  )
  public async postTicketComment(
    @Request() request: AuthorizedRequest,
    @Body() dto: TicketCommentsPostDto
  ): Promise<TicketCommentsResponseDto> {
    const securityManager = mkSecurityManager(request);
    securityManager.ensureAtLeastOne([
      "CREATE_TICKET_COMMENT",
      "CREATE_TICKET_COMMENT_OF_RELATED_ORG",
      "CREATE_TICKET_COMMENT_ISSUED"
    ]);
    const relatedOrgId = request.user.orgId;

    const accessAll = securityManager.hasPermission("CREATE_TICKET_COMMENT");
    const accessRelatedOrg = securityManager.hasPermission(
      "CREATE_TICKET_COMMENT_OF_RELATED_ORG"
    );

    const input = TicketComment.fromPostDtoToInput(request.user.id, dto);

    if (accessAll) {
      const ticketComment = await TicketComment.createWithAssociations(input);
      this.setStatus(201);
      return TicketComment.toDtoWithAssociations(ticketComment);
    } else {
      if (relatedOrgId) {
        if (accessRelatedOrg) {
          const ticket = await Ticket.findByPkWithAssociations(dto.ticketId, {
            orgId: relatedOrgId
          });
          if (!ticket) {
            throw new ModelForeignEntityNotFoundError<TicketCommentsPostDto>(
              "Ticket",
              dto.ticketId,
              "ticketId"
            );
          }
        } else {
          const ticket = await Ticket.findByPkWithAssociations(dto.ticketId, {
            issuerId: request.user.id
          });
          if (!ticket) {
            throw new ModelForeignEntityNotFoundError<TicketCommentsPostDto>(
              "Ticket",
              dto.ticketId,
              "ticketId"
            );
          }
        }

        const ticketComment = await TicketComment.createWithAssociations(input);
        this.setStatus(201);
        return TicketComment.toDtoWithAssociations(ticketComment);
      } else {
        throw new AuthNoPermissionError("CREATE_TICKET_COMMENT");
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
  @Response<TicketCommentsPutValidationBodyErrorDto>(
    400,
    "Failed Request Body Validation"
    // TODO: add example
  )
  @Response<ErrorEntityNotFoundDto>(
    404,
    "Requested ticket comment is not found",
    {
      name: "ModelEntityNotFoundError",
      message: "Entity '123123' of type 'TicketComment' is not found.",
      id: 123123,
      modelName: "TicketComment"
    }
  )
  public async putTicketComment(
    @Request() request: AuthorizedRequest,
    @Body() dto: TicketCommentsPutDto,
    id: number
  ): Promise<void> {
    const securityManager = mkSecurityManager(request);
    securityManager.ensureAtLeastOne([
      "UPDATE_TICKET_COMMENTS",
      "UPDATE_TICKET_COMMENTS_CREATED"
    ]);
    const commenterId = request.user.id;

    const accessAll = securityManager.hasPermission("UPDATE_TICKET_COMMENTS");

    let ticketComment: TicketCommentWithAssociations;
    if (accessAll) {
      const nullable = await TicketComment.findByPkWithAssociations(id);
      if (!nullable) {
        throw new ModelEntityNotFoundError("TicketComment", id);
      }
      ticketComment = nullable;
    } else {
      const nullable = await TicketComment.findByPkWithAssociations(id, {
        commenterId
      });
      if (!nullable) {
        throw new ModelEntityNotFoundError("TicketComment", id);
      }
      ticketComment = nullable;
    }
    const input = TicketComment.fromPutDtoToInput(dto);
    await ticketComment.updateWithAssociations(input);
  }
}
