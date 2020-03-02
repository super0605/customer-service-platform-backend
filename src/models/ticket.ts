import * as A from "fp-ts/lib/Array";
import { flow } from "fp-ts/lib/function";
import { pipe } from "fp-ts/lib/pipeable";
import { Op, Transaction } from "sequelize";
import {
  AllowNull,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  DefaultScope,
  ForeignKey,
  HasMany,
  Length,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import {
  TicketsGetResponseDto,
  TicketsPostDto,
  TicketsPutDto,
  TicketsResponseDto
} from "src/dtos";
import { mustBeEmptyObject, UnreachableError } from "src/errors";
import { groupBy, hasDefinedValues, uniquefyStringArray } from "src/utils";
import Attachment from "./attachment";
import Complex from "./complex";
import {
  ModelEntityNotFoundError,
  ModelForeignEntityNotFoundError
} from "./errors";
import Image from "./image";
import Lot from "./lot";
import { ProblemCategory } from "./problem-category";
import TicketAttachment from "./ticket-attachment";
import TicketLot from "./ticket-lot";
import TicketStatus, { PredefinedTicketStatus } from "./ticket-status";
import TicketTag from "./ticket-tag";
import TicketTicketTag from "./ticket-ticket-tag";
import { TicketType } from "./ticket-type";
import {
  GetExplicitUndefinedType,
  GetModelCreateInputType,
  Undefinable
} from "./type-magic";
import User from "./user";

type TicketCreateInput = Omit<
  GetExplicitUndefinedType<GetModelCreateInputType<Ticket>>,
  "ticketStatusId" | "issued" | "profileImageId" | "closed"
>;

type WithProfileImageCreateInput = {
  profileImage: string | null | undefined;
};

type WithTagsCreateInput = {
  // TODO: arrays on input should not be undefined
  // add conversion to empty array at mapping toInput function
  tags: string[] | undefined;
};

type WithLotsCreateInput = {
  lots: Array<{ id: number }>;
};

type WithAttachmentsCreateInput = {
  attachments: string[];
};

type TicketWithAssociationsCreateInput = TicketCreateInput &
  WithProfileImageCreateInput &
  WithTagsCreateInput &
  WithLotsCreateInput &
  WithAttachmentsCreateInput;

type TicketUpdateInput = Undefinable<
  Omit<TicketCreateInput, "primaryLotId" | "issuerId" | "issued" | "closed">
>;

type WithProfileImageUpdateInput = {
  profileImage: string | null;
};

type WithStatusUpdateInput = {
  ticketStatus: string;
};

type WithTagsUpdateInput = {
  tags: string[];
};

type WithAttachmentsUpdateInput = {
  attachments: string[];
};

type TicketWithAssociationsUpdateInput = TicketUpdateInput &
  Undefinable<WithProfileImageUpdateInput> &
  Undefinable<WithStatusUpdateInput> &
  Undefinable<WithTagsUpdateInput> &
  Undefinable<WithAttachmentsUpdateInput>;

// TODO: add option to grab tickets without lots and without attachments
export type TicketWithAssociations = Ticket &
  WithStatus &
  WithTags &
  WithLots &
  WithAttachments;

const protectedAttributes: Array<keyof Ticket> = [];

@DefaultScope(() => ({
  attributes: { exclude: protectedAttributes }
}))
@Table({
  tableName: "tickets",
  freezeTableName: true,
  timestamps: false
})
export default class Ticket extends Model<Ticket> {
  @PrimaryKey
  @Column({ field: "tickets_id", autoIncrement: true })
  id!: number;

  @AllowNull(false)
  @ForeignKey(() => Lot)
  @Column({ field: "primary_lots_id" })
  primaryLotId!: number;

  @BelongsTo(() => Lot, "primary_lots_id")
  primaryLot?: Lot;

  @AllowNull(false)
  @Column({ field: "ticket_type" })
  ticketType!: TicketType;

  @Column({ field: "problem_category" })
  problemCategory?: ProblemCategory;

  @AllowNull(false)
  @Length({ max: 255 })
  @Column({ field: "title" })
  title!: string;

  @AllowNull(false)
  @Column({ field: "urgent" })
  isUrgent!: boolean;

  @AllowNull(false)
  @Column({ field: "affects_multiple_properties" })
  affectsMultipleProperties!: boolean;

  @Column({ field: "description", type: DataType.TEXT })
  description?: string;

  @AllowNull(false)
  @Column({ field: "issued", type: DataType.DATE })
  issued!: Date;

  @Column({ field: "closed", type: DataType.DATE })
  closed?: Date;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column({ field: "issuer_id" })
  issuerId!: number;

  @BelongsTo(() => User, "issuer_id")
  issuer?: User;

  @ForeignKey(() => User)
  @Column({ field: "executive_id" })
  executiveId?: number;

  @BelongsTo(() => User, "executive_id")
  executive?: User;

  @AllowNull(false)
  @ForeignKey(() => TicketStatus)
  @Column({ field: "ticket_statuses_id" })
  ticketStatusId!: number;

  @BelongsTo(() => TicketStatus)
  ticketStatus?: TicketStatus;

  @ForeignKey(() => Image)
  @Column({ field: "profile_image_id" })
  profileImageId?: number;

  @BelongsTo(() => Image)
  profileImage?: Image;

  @BelongsToMany(
    () => TicketTag,
    () => TicketTicketTag
  )
  ticketTags?: TicketTag[];

  @BelongsToMany(
    () => Lot,
    () => TicketLot
  )
  lots?: Lot[];

  @HasMany(() => TicketAttachment)
  ticketAttachments?: TicketAttachment[];

  @BelongsToMany(
    () => Attachment,
    () => TicketAttachment
  )
  attachments?: Attachment[];

  toJSON(): object {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attributes: any = Object.assign({}, this.get());
    for (const a of protectedAttributes) {
      delete attributes[a];
    }
    return attributes;
  }

  private static withStatusUnsafe<T extends Ticket>(ticket: T): T & WithStatus {
    if (!ticket.ticketStatus) {
      throw new UnreachableError();
    }

    return ticket as T & WithStatus;
  }

  private static withTagsUnsafe<T extends Ticket>(ticket: T): T & WithTags {
    if (!ticket.ticketTags) {
      throw new UnreachableError();
    }

    return ticket as T & WithTags;
  }

  private static withLotsUnsafe<T extends Ticket>(ticket: T): T & WithLots {
    if (!ticket.lots) {
      throw new UnreachableError();
    }

    return ticket as T & WithLots;
  }

  private static withAttachmentsUnsafe<T extends Ticket>(
    ticket: T
  ): T & WithAttachments {
    if (!ticket.attachments) {
      throw new UnreachableError();
    }

    return ticket as T & WithAttachments;
  }

  static async createWithAssociations({
    profileImage,
    tags,
    lots,
    attachments,
    ...input
  }: TicketWithAssociationsCreateInput): Promise<TicketWithAssociations> {
    const ticketStatus = PredefinedTicketStatus.Open;
    const issued = new Date();

    // primaryLot must be in the list of lots
    // so auto populate it if its not there
    if (!lots.find(l => l.id === input.primaryLotId)) {
      lots.push({ id: input.primaryLotId });
    }

    const ticketStatusObj = await TicketStatus.findOne({
      where: { status: ticketStatus }
    });
    if (!ticketStatusObj) {
      throw new ModelForeignEntityNotFoundError<Ticket>(
        "TicketStatus",
        ticketStatus,
        "ticketStatus"
      );
    }

    if (!Ticket.sequelize) {
      throw new UnreachableError();
    }

    if (profileImage) {
      if (tags && tags.length) {
        const tagObjs = await TicketTag.findAll({
          where: { tag: { [Op.in]: tags } }
        });
        const tagObjsDict: { [tagName: string]: TicketTag } = {};
        for (const tagObj of tagObjs) {
          tagObjsDict[tagObj.tag] = tagObj;
        }

        // TODO: fix groupBy typings
        const grouped = groupBy(t => {
          if (tagObjsDict[t]) {
            return ["found", t] as const;
          } else {
            return ["notfound", t] as const;
          }
        }, tags);
        const found = grouped.found || [];
        const notfound = grouped.notfound || [];

        const ticket = await Ticket.sequelize.transaction(async transaction => {
          const ticket = await Ticket.create(
            {
              ...input,
              // TODO: rename ticketStatus to just status
              ticketStatusId: ticketStatusObj.id,
              issued,
              // TODO: rename ticketTag to just tag
              ticketTags: notfound.map(tag => ({ tag })),
              // TODO: image url uniqueness problem
              // what if we provide same url that is already used?
              // what if image is created but other validation fails? why doesn't it have transaction?
              // same for users images and other places
              // well, all other relations, really
              profileImage: {
                imageUrl: profileImage
              },
              attachments: attachments.map(a => ({ attachmentUrl: a }))
            },
            {
              transaction,
              include: [
                { model: TicketTag },
                { model: Image },
                { model: Attachment }
              ]
            }
          );
          ticket.ticketStatus = ticketStatusObj;
          await Promise.all([
            ticket.$set(
              "lots",
              lots.map(l => l.id),
              { transaction }
            ),
            ticket.$add(
              "ticketTags",
              found.map(t => tagObjsDict[t]),
              { transaction }
            )
          ]);
          return ticket;
        });
        // TODO: remove
        ticket.lots = (await ticket.$get("lots")) as Lot[];

        return pipe(
          ticket,
          Ticket.withStatusUnsafe,
          Ticket.withTagsUnsafe,
          Ticket.withLotsUnsafe,
          Ticket.withAttachmentsUnsafe
        );
      } else {
        const ticket = await Ticket.sequelize.transaction(async transaction => {
          const ticket = await Ticket.create(
            {
              ...input,
              ticketStatusId: ticketStatusObj.id,
              issued,
              // TODO: image url uniqueness problem
              // what if we provide same url that is already used?
              // what if image is created but other validation fails? why doesn't it have transaction?
              // same for users images and other places
              // well, all other relations, really
              profileImage: {
                imageUrl: profileImage
              },
              attachments: attachments.map(a => ({ attachmentUrl: a }))
            },
            { transaction, include: [{ model: Image }, { model: Attachment }] }
          );

          await ticket.$set(
            "lots",
            lots.map(l => l.id),
            { transaction }
          );

          ticket.ticketStatus = ticketStatusObj;
          ticket.ticketTags = [];
          return ticket;
        });
        // TODO: remove
        ticket.lots = (await ticket.$get("lots")) as Lot[];

        return pipe(
          ticket,
          Ticket.withStatusUnsafe,
          Ticket.withTagsUnsafe,
          Ticket.withLotsUnsafe,
          Ticket.withAttachmentsUnsafe
        );
      }
    } else {
      if (tags && tags.length) {
        const tagObjs = await TicketTag.findAll({
          where: { tag: { [Op.in]: tags } }
        });
        const tagObjsDict: { [tagName: string]: TicketTag } = {};
        for (const tagObj of tagObjs) {
          tagObjsDict[tagObj.tag] = tagObj;
        }

        // TODO: fix groupBy typings
        const grouped = groupBy(t => {
          if (tagObjsDict[t]) {
            return ["found", t] as const;
          } else {
            return ["notfound", t] as const;
          }
        }, tags);
        const found = grouped.found || [];
        const notfound = grouped.notfound || [];

        if (!Ticket.sequelize) {
          throw new UnreachableError();
        }

        const ticket = await Ticket.sequelize.transaction(async transaction => {
          const ticket = await Ticket.create(
            {
              ...input,
              ticketStatusId: ticketStatusObj.id,
              issued,
              ticketTags: notfound.map(tag => ({ tag })),
              attachments: attachments.map(a => ({ attachmentUrl: a }))
            },
            {
              transaction,
              include: [{ model: TicketTag }, { model: Attachment }]
            }
          );
          ticket.ticketStatus = ticketStatusObj;
          await Promise.all([
            ticket.$add(
              "ticketTags",
              found.map(t => tagObjsDict[t]),
              { transaction }
            ),
            ticket.$set(
              "lots",
              lots.map(l => l.id),
              { transaction }
            )
          ]);

          return ticket;
        });

        // TODO: remove
        ticket.lots = (await ticket.$get("lots")) as Lot[];

        return pipe(
          ticket,
          Ticket.withStatusUnsafe,
          Ticket.withTagsUnsafe,
          Ticket.withLotsUnsafe,
          Ticket.withAttachmentsUnsafe
        );
      } else {
        const ticket = await Ticket.sequelize.transaction(async transaction => {
          const ticket = await Ticket.create(
            {
              ...input,
              ticketStatusId: ticketStatusObj.id,
              issued,
              attachments: attachments.map(a => ({ attachmentUrl: a }))
            },
            { transaction, include: [{ model: Attachment }] }
          );

          await ticket.$set(
            "lots",
            lots.map(l => l.id),
            { transaction }
          );

          ticket.ticketStatus = ticketStatusObj;
          ticket.ticketTags = [];
          return ticket;
        });

        // TODO: remove
        ticket.lots = (await ticket.$get("lots")) as Lot[];

        return pipe(
          ticket,
          Ticket.withStatusUnsafe,
          Ticket.withTagsUnsafe,
          Ticket.withLotsUnsafe,
          Ticket.withAttachmentsUnsafe
        );
      }
    }
  }

  async updateProfileImage(
    { profileImage }: WithProfileImageUpdateInput,
    { transaction }: { transaction?: Transaction } = {}
  ): Promise<void> {
    // get image obj if its not there
    let profileImageObj: Image | null | undefined;
    if (this.profileImageId && !this.profileImage) {
      // NOTE: dont use transaction for selects
      profileImageObj = await Image.findOne({
        where: { id: this.profileImageId }
      });
      if (!profileImageObj) {
        throw new UnreachableError();
      }
    } else {
      profileImageObj = this.profileImage;
    }

    if (profileImage === null) {
      if (profileImageObj == null) {
        // skip
      } else {
        // TODO: delete old image?
        await this.update({ profileImageId: null }, { transaction });
      }
    } else {
      if (profileImageObj == null) {
        await this.$create(
          "profileImage",
          { imageUrl: profileImage },
          { transaction }
        );
      } else {
        if (profileImage === profileImageObj.imageUrl) {
          // skip
        } else {
          // TODO: delete old image?
          await this.$create(
            "profileImage",
            { imageUrl: profileImage },
            { transaction }
          );
        }
      }
    }
  }

  async updateStatus(
    { ticketStatus }: WithStatusUpdateInput,
    { transaction }: { transaction?: Transaction } = {}
  ): Promise<void> {



      const currentStatusString = this.ticketStatus?.status || "UNDEFINED"


    const updatedStatusObject = await TicketStatus.findOne({
      where: {
        status: ticketStatus.toUpperCase()
      }
    });

    const updatedStatusId = updatedStatusObject?.id || -1


    console.log("current ticket status string")
    console.log(currentStatusString)


    console.log("Updated ticket status string")
    console.log(ticketStatus)


    if (updatedStatusId === this.ticketStatusId) {
      // skip
    } else {
      await this.update({
        ticketStatusId: updatedStatusId,
        closed: ticketStatus === PredefinedTicketStatus.Closed ? new Date() : null
      }, {
        transaction
      });
    }
    }

  async updateTags(
    { tags }: WithTagsUpdateInput,
    { transaction }: { transaction?: Transaction } = {}
  ): Promise<void> {
    const tagObjs = await TicketTag.findAll({
      where: { tag: { [Op.in]: tags } }
    });
    const tagObjsDict: { [tagName: string]: TicketTag } = {};
    for (const tagObj of tagObjs) {
      tagObjsDict[tagObj.tag] = tagObj;
    }

    // TODO: fix groupBy typings
    const grouped = groupBy(t => {
      if (tagObjsDict[t]) {
        return ["found", t] as const;
      } else {
        return ["notfound", t] as const;
      }
    }, tags);
    const found = grouped.found || [];
    const notfound = grouped.notfound || [];

    if (!Ticket.sequelize) {
      throw new UnreachableError();
    }

    const newlyCreated = await TicketTag.bulkCreate(
      notfound.map(tag => ({ tag })),
      { transaction }
    );
    await TicketTicketTag.destroy({
      where: { ticketId: this.id },
      transaction
    });
    await this.$set(
      "ticketTags",
      [...found.map(t => tagObjsDict[t]), ...newlyCreated],
      { transaction }
    );
  }

  async updateAttachments(
    { attachments }: WithAttachmentsUpdateInput,
    { transaction }: { transaction?: Transaction } = {}
  ): Promise<void> {
    // TODO: delete old? only create those that not already present?
    const objs = await Attachment.bulkCreate(
      attachments.map(a => ({ attachmentUrl: a })),
      { transaction }
    );
    await this.$set("attachments", objs, { transaction });
  }

  async updateWithAssociations({
    ticketStatus,
    profileImage,
    tags,
    attachments,
    ...input
  }: TicketWithAssociationsUpdateInput): Promise<void> {
    if (
      profileImage === undefined &&
      ticketStatus === undefined &&
      tags === undefined &&
      attachments === undefined &&
      hasDefinedValues(input)
    ) {
      await this.update(input);
    } else {
      await this.sequelize.transaction(async transaction => {
        const updates: Promise<unknown>[] = [];

        if (hasDefinedValues(input)) {
          updates.push(this.update(input, { transaction }));
        }

        if (profileImage !== undefined) {
          updates.push(
            this.updateProfileImage({ profileImage }, { transaction })
          );
        }

        if (ticketStatus !== undefined) {
          updates.push(this.updateStatus({ ticketStatus }, { transaction }));
        }

        if (tags !== undefined) {
          updates.push(this.updateTags({ tags }, { transaction }));
        }

        if (attachments !== undefined) {
          updates.push(
            this.updateAttachments({ attachments }, { transaction })
          );
        }

        await Promise.all(updates);
      });
    }
  }

  static async findByPkWithAssociations(
    id: number,
    { orgId, issuerId }: { orgId?: number; issuerId?: number } = {}
  ): Promise<TicketWithAssociations | null> {
    const nullable = await Ticket.findOne({
      where: {
        id,
        ...(issuerId ? { issuerId } : {})
      },
      include: [
        { model: TicketStatus },
        { model: TicketTag },
        { model: Image },
        { model: Attachment },
        {
          model: Lot,
          as: "lots",
          ...(orgId ? { include: [{ model: Complex }] } : {})
        }
      ]
    });
    if (!nullable) return null;
    const ticket = pipe(
      nullable,
      Ticket.withStatusUnsafe,
      Ticket.withTagsUnsafe,
      Ticket.withLotsUnsafe,
      Ticket.withAttachmentsUnsafe
    );
    if (orgId) {
      const notThisOrg = ticket.lots.some(l => {
        if (!l.complex) {
          throw new UnreachableError();
        }
        return l.complex.orgId !== orgId;
      });
      if (notThisOrg) {
        throw new ModelEntityNotFoundError("Ticket", id);
      }
    }

    return ticket;
  }

  static async findAllWithAssociations({
    orgId,
    complexId,
    primaryLotId,
    lotId,
    issuerId
  }: {
    orgId?: number;
    complexId?: number;
    primaryLotId?: number;
    lotId?: number;
    issuerId?: number;
  } = {}): Promise<TicketWithAssociations[]> {
    const tickets = await Ticket.findAll({
      where: {
        ...(primaryLotId ? { primaryLotId } : {}),
        ...(issuerId ? { issuerId } : {})
      },
      include: [
        { model: TicketStatus },
        { model: TicketTag },
        { model: Image },
        { model: Attachment },
        // TODO: fix sometimes unnecessary includes
        { model: Lot, as: "lots", include: [{ model: Complex }] }
      ]
    });

    return pipe(
      tickets,
      A.map(
        flow(
          Ticket.withStatusUnsafe,
          Ticket.withTagsUnsafe,
          Ticket.withLotsUnsafe,
          Ticket.withAttachmentsUnsafe
        )
      ),
      A.filter(t => {
        if (!orgId) return true;
        const notThisOrg = t.lots.some(l => {
          if (!l.complex) {
            throw new UnreachableError();
          }
          return l.complex.orgId !== orgId;
        });
        if (notThisOrg) return false;
        return true;
      }),
      A.filter(t => {
        if (!complexId) return true;
        const hasComplex = t.lots.some(l => {
          // TODO: add lot With Complex type or something like that
          if (!l.complex) {
            throw new UnreachableError();
          }
          return l.complex.id === complexId;
        });
        if (hasComplex) return true;
        return false;
      }),
      A.filter(t => {
        if (!lotId) return true;
        const hasLot = t.lots.some(l => l.id === lotId);
        if (hasLot) return true;
        return false;
      })
    );
  }

  static fromPostDtoToInput(
    issuerId: number,
    dto: TicketsPostDto
  ): TicketWithAssociationsCreateInput {
    const {
      ticketType,
      problemCategory,
      executiveId,
      description,
      primaryLotId,
      profileImage,
      title,
      affectsMultipleProperties,
      isUrgent,
      tags,
      lots,
      attachments,
      ...rest
    } = dto;
    mustBeEmptyObject(rest);

    const uniqueTags = uniquefyStringArray(tags);

    return {
      primaryLotId,
      ticketType,
      problemCategory,
      executiveId,
      description,
      profileImage,
      issuerId,
      title,
      affectsMultipleProperties,
      isUrgent,
      tags: uniqueTags,
      lots,
      attachments: attachments || []
    };
  }

  static fromPutDtoToInput(
    dto: TicketsPutDto
  ): TicketWithAssociationsUpdateInput {
    const {
      description,
      executiveId,
      problemCategory,
      ticketStatus,
      ticketType,
      profileImage,
      title,
      affectsMultipleProperties,
      isUrgent,
      tags,
      attachments,
      ...rest
    } = dto;
    mustBeEmptyObject(rest);

    const uniqueTags = tags ? uniquefyStringArray(tags) : undefined;

    return {
      profileImage,
      ticketStatus,
      ticketType,
      description,
      executiveId,
      problemCategory,
      title,
      isUrgent,
      affectsMultipleProperties,
      tags: uniqueTags,
      attachments
    };
  }

  static toDtoWithAssociations(
    ticket: TicketWithAssociations
  ): GetExplicitUndefinedType<TicketsResponseDto> {
    return {
      closed: ticket.closed,
      description: ticket.description,
      executiveId: ticket.executiveId,
      id: ticket.id,
      issued: ticket.issued,
      issuerId: ticket.issuerId,
      primaryLotId: ticket.primaryLotId,
      problemCategory: ticket.problemCategory,
      ticketStatus: ticket.ticketStatus.status,
      ticketType: ticket.ticketType,
      profileImage: ticket.profileImage?.imageUrl,
      title: ticket.title,
      affectsMultipleProperties: ticket.affectsMultipleProperties,
      isUrgent: ticket.isUrgent,
      tags: ticket.ticketTags.map(t => t.tag),
      attachments: ticket.attachments.map(a => a.attachmentUrl)
    };
  }

  static toGetDtoWithAssociations(
    ticket: TicketWithAssociations
  ): GetExplicitUndefinedType<TicketsGetResponseDto> {
    return {
      ...Ticket.toDtoWithAssociations(ticket),
      // TODO: deal with no-associations lots better
      lots: ticket.lots.map(l => Lot.toDto(l))
    };
  }
}

export type WithStatus = {
  ticketStatus: TicketStatus;
};

export type WithTags = {
  ticketTags: TicketTag[];
};

export type WithLots = {
  lots: Lot[];
};

export type WithAttachments = {
  attachments: Attachment[];
};
