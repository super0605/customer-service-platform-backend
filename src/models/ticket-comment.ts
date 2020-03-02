import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  DefaultScope,
  ForeignKey,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import {
  TicketCommentsPostDto,
  TicketCommentsPutDto,
  TicketCommentsResponseDto
} from "src/dtos";
import { mustBeEmptyObject } from "src/errors";
import { hasDefinedValues } from "src/utils";
import Ticket from "./ticket";
import {
  GetExplicitUndefinedType,
  GetModelCreateInputType,
  Undefinable
} from "./type-magic";
import User from "./user";

type TicketCommentCreateInput = Omit<
  GetExplicitUndefinedType<GetModelCreateInputType<TicketComment>>,
  "added"
>;

type TicketCommentWithAssociationsCreateInput = TicketCommentCreateInput;

type TicketCommentUpdateInput = Undefinable<
  Omit<TicketCommentCreateInput, "added" | "commenterId" | "ticketId">
>;

type TicketCommentWithAssociationsUpdateInput = TicketCommentUpdateInput;

export type TicketCommentWithAssociations = TicketComment;

const protectedAttributes: Array<keyof TicketComment> = [];

@DefaultScope(() => ({
  attributes: { exclude: protectedAttributes }
}))
@Table({
  tableName: "ticket_comments",
  freezeTableName: true,
  timestamps: false
})
export default class TicketComment extends Model<TicketComment> {
  @PrimaryKey
  @Column({ field: "ticket_comments_id", autoIncrement: true })
  id!: number;

  @AllowNull(false)
  @ForeignKey(() => Ticket)
  @Column({ field: "tickets_id" })
  ticketId!: number;

  @BelongsTo(() => Ticket)
  ticket?: Ticket;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column({ field: "commenter_id" })
  commenterId!: number;

  @BelongsTo(() => User)
  commenter?: User;

  @AllowNull(false)
  @Column({ field: "comment", type: DataType.TEXT })
  comment!: string;

  @AllowNull(false)
  @Column({ field: "added", type: DataType.DATE })
  added!: Date;

  toJSON(): object {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attributes: any = Object.assign({}, this.get());
    for (const a of protectedAttributes) {
      delete attributes[a];
    }
    return attributes;
  }

  static async createWithAssociations(
    input: TicketCommentWithAssociationsCreateInput
  ): Promise<TicketCommentWithAssociations> {
    const added = new Date();

    return await TicketComment.create({
      ...input,
      added
    });
  }

  async updateWithAssociations(
    input: TicketCommentWithAssociationsUpdateInput
  ): Promise<void> {
    if (hasDefinedValues(input)) {
      await this.update(input);
    }
  }

  static async findByPkWithAssociations(
    id: number,
    {
      commenterId,
      orgId,
      issuerId
    }: { commenterId?: number; orgId?: number; issuerId?: number } = {}
  ): Promise<TicketCommentWithAssociations | null> {
    const ticketComment = await TicketComment.findOne({
      where: {
        id,
        ...(commenterId ? { commenterId } : {})
      },
      include: [
        ...(issuerId ? [{ model: Ticket, where: { issuerId } }] : []),
        ...(orgId
          ? [
              {
                model: User,
                where: {
                  orgId
                }
              }
            ]
          : [])
      ]
    });
    if (!ticketComment) return null;

    return ticketComment;
  }

  static async findAllWithAssociations({
    ticketId,
    orgId,
    issuerId
  }: {
    ticketId?: number;
    orgId?: number;
    issuerId?: number;
  } = {}): Promise<TicketCommentWithAssociations[]> {
    const ticketComments = await TicketComment.findAll({
      where: {
        ...(ticketId ? { ticketId } : {})
      },
      include: [
        ...(issuerId ? [{ model: Ticket, where: { issuerId } }] : []),
        ...(orgId ? [{ model: User, where: { orgId } }] : [])
      ]
    });

    return ticketComments;
  }

  static fromPostDtoToInput(
    commenterId: number,
    dto: TicketCommentsPostDto
  ): TicketCommentWithAssociationsCreateInput {
    const { comment, ticketId, ...rest } = dto;
    mustBeEmptyObject(rest);

    return {
      comment,
      commenterId,
      ticketId
    };
  }

  static fromPutDtoToInput(
    dto: TicketCommentsPutDto
  ): TicketCommentWithAssociationsUpdateInput {
    const { comment, ...rest } = dto;
    mustBeEmptyObject(rest);

    return {
      comment
    };
  }

  static toDtoWithAssociations(
    ticketComment: TicketCommentWithAssociations
  ): GetExplicitUndefinedType<TicketCommentsResponseDto> {
    return {
      added: ticketComment.added,
      comment: ticketComment.comment,
      commenterId: ticketComment.commenterId,
      id: ticketComment.id,
      ticketId: ticketComment.ticketId
    };
  }
}
