import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { Transaction } from "sequelize";
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
  LotsGetResponseDto,
  LotsPostDto,
  LotsPutDto,
  LotsResponseDto
} from "src/dtos";
import { mustBeEmptyObject, UnreachableError } from "src/errors";
import { groupBy, hasDefinedValues, uniquefyStringArray } from "src/utils";
import Attachment from "./attachment";
import { ClassificationType } from "./classification-type";
import Complex from "./complex";
import { ModelForeignEntityNotFoundError } from "./errors";
import Image from "./image";
import LotAttachment from "./lot-attachment";
import LotImage from "./lot-image";
import { OccupierType } from "./occupier-type";
import Role from "./role";
import Ticket from "./ticket";
import TicketLot from "./ticket-lot";
import {
  GetExplicitUndefinedType,
  GetModelCreateInputType,
  Undefinable
} from "./type-magic";
import User from "./user";
import UserLotRole, { WithRole, WithUser } from "./user-lot-role";

type LotCreateInput = Omit<
  GetExplicitUndefinedType<GetModelCreateInputType<Lot>>,
  "profileImageId" | "deactivatedAt" | "isActive"
>;

type WithProfileImageCreateInput = {
  profileImage: string | null | undefined;
};

type WithImagesCreateInput = {
  images: string[];
};

type WithRolesAndUsersCreateInput = {
  roles: {
    [roleName: string]: Array<{
      id: number;
    }>;
  };
};

type WithAttachmentsCreateInput = {
  attachments: string[];
};

type LotWithAssociationsCreateInput = LotCreateInput &
  WithProfileImageCreateInput &
  WithImagesCreateInput &
  WithRolesAndUsersCreateInput &
  WithAttachmentsCreateInput;

type LotUpdateInput = Undefinable<
  Omit<LotCreateInput, "complexId"> & {
    isActive: boolean;
  }
>;

type WithProfileImageUpdateInput = {
  profileImage: string | null | undefined;
};

type WithImagesUpdateInput = {
  images: string[] | undefined;
};

type WithRolesAndUsersUpdateInput = {
  roles: {
    [roleName: string]: Array<{
      id: number;
    }>;
  };
};

type WithAttachmentsUpdateInput = {
  attachments: string[];
};

type LotWithAssociationsUpdateInput = LotUpdateInput &
  Undefinable<WithProfileImageUpdateInput> &
  Undefinable<WithImagesUpdateInput> &
  Undefinable<WithRolesAndUsersUpdateInput> &
  Undefinable<WithAttachmentsUpdateInput>;

export type LotWithAssociations = Lot &
  WithImages &
  WithRolesAndUsers &
  WithAttachments;

// TODO: change type of protectedAttributes to Array<keyof <ModelName>> for all models
const protectedAttributes: Array<keyof Lot> = [];

@DefaultScope(() => ({
  attributes: { exclude: protectedAttributes }
}))
@Table({ tableName: "lots", freezeTableName: true, timestamps: false })
export default class Lot extends Model<Lot> {
  @PrimaryKey
  @Column({ field: "lots_id", autoIncrement: true })
  id!: number;

  @Column({ field: "occupier" })
  occupier?: OccupierType;

  @Column({ field: "classification" })
  classification?: ClassificationType;

  @Column({ field: "storeys" })
  storeys?: number;

  @Length({ max: 255 })
  @Column({ field: "characteristics" })
  characteristics?: string;

  @Column({ field: "floor_area", type: DataType.INTEGER })
  floorArea?: number; // TODO: unit of measure

  @Column({ field: "land_area", type: DataType.INTEGER })
  landArea?: number; // TODO: unit of measure

  @Column({ field: "build_date", type: DataType.DATEONLY })
  buildDate?: Date;

  @AllowNull(false)
  @Length({ max: 255 })
  @Column({ field: "address1" })
  address1!: string;

  @Length({ max: 255 })
  @Column({ field: "address2" })
  address2?: string;

  @AllowNull(false)
  @Length({ max: 45 })
  @Column({ field: "suburb" })
  suburb!: string;

  @AllowNull(false)
  @Length({ max: 45 })
  @Column({ field: "state" })
  state!: string;

  @AllowNull(false)
  @Length({ max: 6, min: 6 })
  @Column({ field: "postcode" })
  postcode!: string;

  @Length({ max: 45 })
  @Column({ field: "gps_latitude" })
  gpsLatitude!: string;

  @Length({ max: 45 })
  @Column({ field: "gps_longitude" })
  gpsLongitude!: string;

  @ForeignKey(() => Complex)
  @AllowNull(false)
  @Column({ field: "complexes_id" })
  complexId!: number;

  @BelongsTo(() => Complex)
  complex?: Complex;

  @Column({ field: "deactivated_at", type: DataType.DATE })
  deactivatedAt?: Date;

  @BelongsToMany(
    () => Role,
    () => UserLotRole
  )
  roles?: Role[];

  @BelongsToMany(
    () => User,
    () => UserLotRole
  )
  users?: User[];

  @HasMany(() => UserLotRole)
  userLotRoles?: UserLotRole[];

  get isActive(): boolean {
    return !this.getDataValue("deactivatedAt");
  }

  @HasMany(() => Ticket)
  primaryTickets?: Ticket[];

  @ForeignKey(() => Image)
  @Column({ field: "profile_image_id" })
  profileImageId?: number;

  @BelongsTo(() => Image)
  profileImage?: Image;

  @HasMany(() => LotImage)
  lotImages?: LotImage[];

  @BelongsToMany(
    () => Image,
    () => LotImage
  )
  images?: Image[];

  @BelongsToMany(
    () => Ticket,
    () => TicketLot
  )
  tickets?: Ticket[];

  @HasMany(() => LotAttachment)
  lotAttachments?: LotAttachment[];

  @BelongsToMany(
    () => Attachment,
    () => LotAttachment
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

  private static withImagesUnsafe<T extends Lot>(lot: T): T & WithImages {
    if (!lot.images) {
      throw new UnreachableError();
    }

    return lot as T & WithImages;
  }

  private static withProfileImageUnsafe<T extends Lot & WithImages>(lot: T): T {
    if (lot.profileImageId) {
      const found = lot.images.find(i => i.id === lot.profileImageId);
      if (!found) {
        throw new UnreachableError();
      }

      lot.profileImage = found;
    }

    return lot;
  }

  private static withRolesAndUsersUnsafe<T extends Lot>(
    lot: T
  ): T & WithRolesAndUsers {
    if (!lot.userLotRoles) {
      throw new UnreachableError();
    }
    for (const userLotRole of lot.userLotRoles) {
      if (!userLotRole.user) {
        throw new UnreachableError();
      }
      if (!userLotRole.role) {
        throw new UnreachableError();
      }
    }

    return lot as T & WithRolesAndUsers;
  }

  private static withAttachmentsUnsafe<T extends Lot>(
    lot: T
  ): T & WithAttachments {
    if (!lot.attachments) {
      throw new UnreachableError();
    }

    return lot as T & WithAttachments;
  }

  static async createWithAssociatons({
    images,
    profileImage,
    roles,
    attachments,
    ...input
  }: LotWithAssociationsCreateInput): Promise<LotWithAssociations> {
    if (profileImage) {
      const foundProfileImage = images.find(i => i === profileImage);
      if (!foundProfileImage) {
        images.push(profileImage);
      }
    }

    if (!Lot.sequelize) {
      throw new UnreachableError();
    }

    const lot = await Lot.sequelize.transaction(async transaction => {
      const lot = pipe(
        await Lot.create(
          {
            ...input,
            images: images.map(i => ({ imageUrl: i })),
            attachments: attachments.map(a => ({ attachmentUrl: a }))
          },
          {
            transaction,
            include: [{ model: Image, as: "images" }, { model: Attachment }]
          }
        ),
        Lot.withImagesUnsafe,
        Lot.withAttachmentsUnsafe
      );

      if (profileImage) {
        const profileImageObj = lot.images.find(
          i => i.imageUrl === profileImage
        );
        if (!profileImageObj) {
          throw new UnreachableError();
        }
        const profileImageId = profileImageObj.id;
        await lot.update({ profileImageId }, { transaction });
      }

      if (hasDefinedValues(roles)) {
        await lot.updateRolesAndUsers({ roles }, { transaction });
        // need separate $get to grab inclusions
        const userLotRoles = (await lot.$get("userLotRoles", {
          include: [{ model: User }, { model: Role }]
        })) as UserLotRole[];
        // TODO: check if $get assigns the property automatically
        lot.userLotRoles = userLotRoles;
      } else {
        lot.userLotRoles = [];
      }
      return lot;
    });
    return pipe(lot, Lot.withProfileImageUnsafe, Lot.withRolesAndUsersUnsafe);
  }

  private async ensureProfileImage(): Promise<Image | null> {
    if (this.profileImage) {
      return this.profileImage;
    } else if (this.profileImageId) {
      const image = (await this.$get("profileImage")) as Image | null;
      return image;
    } else {
      return null;
    }
  }

  // TODO: check that transaction is required in complex update functions in all models
  async updateProfileImageAndImages(
    {
      profileImage,
      images
    }: WithProfileImageUpdateInput & WithImagesUpdateInput,
    { transaction }: { transaction?: Transaction } = {}
  ): Promise<void> {
    const newProfileImage =
      profileImage !== undefined
        ? profileImage
        : (await this.ensureProfileImage())?.imageUrl;

    if (newProfileImage && images) {
      const found = images.find(i => i === newProfileImage);
      if (!found) {
        images.push(newProfileImage);
      }
    }

    if (images) {
      // TODO: reuse existing images if they didnt change
      const objs = await Image.bulkCreate(
        images.map(i => ({ imageUrl: i })),
        { transaction }
      );
      await this.$set("images", objs, { transaction });

      // TODO: autochange of profileimageid is unintuitive
      if (newProfileImage) {
        const profileImageObj = objs.find(i => i.imageUrl === newProfileImage);
        if (!profileImageObj) {
          throw new UnreachableError();
        }
        const profileImageId = profileImageObj.id;
        await this.update({ profileImageId }, { transaction });
      } else {
        await this.update({ profileImageId: null }, { transaction });
      }
    } else {
      if (newProfileImage) {
        const profileImageObj = await Image.create(
          {
            imageUrl: newProfileImage
          },
          { transaction }
        );
        await this.$add("images", profileImageObj, { transaction });
        await this.update(
          { profileImageId: profileImageObj.id },
          { transaction }
        );
      } else {
        // TODO: remove it from images if old profile image was not null?
        await this.update({ profileImageId: null }, { transaction });
      }
    }
  }

  async updateRolesAndUsers(
    { roles }: WithRolesAndUsersUpdateInput,
    { transaction }: { transaction?: Transaction } = {}
  ): Promise<void> {
    const allRoles = await Role.findAll();

    const roleNames = Object.keys(roles);
    // TODO: better to grab only specified roles, but there aren't gonna be lots of them so its ok

    const allRolesByRoleName: { [roleName: string]: Role } = {};
    for (const r of allRoles) {
      allRolesByRoleName[r.roleName] = r;
    }

    const userLotRoles: {
      userId: number;
      roleId: number;
      lotId: number;
    }[] = [];
    for (const rn of roleNames) {
      const r = allRolesByRoleName[rn];
      if (!r) {
        throw new ModelForeignEntityNotFoundError<LotsPutDto>(
          "Role",
          rn,
          "roles"
        );
      }

      // TODO: validate that user cannot be assigned to lot from another org
      for (const { id: userId } of roles[rn]) {
        userLotRoles.push({
          userId,
          roleId: r.id,
          lotId: this.id
        });
      }
    }

    await UserLotRole.destroy({
      where: {
        lotId: this.id
      },
      transaction
    });
    await UserLotRole.bulkCreate(userLotRoles, { transaction });
  }

  async updateValues(
    { isActive, ...input }: LotUpdateInput,
    { transaction }: { transaction?: Transaction } = {}
  ): Promise<void> {
    if (isActive === undefined) {
      await this.update(input, { transaction });
    } else {
      if (isActive === this.isActive) {
        await this.update(input, { transaction });
      } else {
        if (isActive) {
          await this.update(
            {
              ...input,
              deactivatedAt: null
            },
            { transaction }
          );
        } else {
          await this.update(
            {
              ...input,
              deactivatedAt: new Date()
            },
            { transaction }
          );
        }
      }
    }
  }

  async updateAttachments(
    { attachments }: WithAttachmentsUpdateInput,
    { transaction }: { transaction?: Transaction } = {}
  ): Promise<void> {
    const objs = await Attachment.bulkCreate(
      attachments.map(i => ({ attachmentUrl: i })),
      { transaction }
    );
    await this.$set("attachments", objs, { transaction });
  }

  async updateWithAssociations({
    images,
    profileImage,
    roles,
    attachments,
    ...input
  }: LotWithAssociationsUpdateInput): Promise<void> {
    if (
      images === undefined &&
      profileImage === undefined &&
      roles === undefined &&
      attachments === undefined &&
      hasDefinedValues(input)
    ) {
      await this.updateValues(input);
    } else {
      await this.sequelize.transaction(async transaction => {
        const updates: Promise<unknown>[] = [];

        if (hasDefinedValues(input)) {
          updates.push(this.updateValues(input, { transaction }));
        }

        if (images !== undefined || profileImage !== undefined) {
          updates.push(
            this.updateProfileImageAndImages(
              { profileImage, images },
              { transaction }
            )
          );
        }

        if (roles !== undefined) {
          updates.push(this.updateRolesAndUsers({ roles }, { transaction }));
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
    { orgId }: { orgId?: number } = {}
  ): Promise<LotWithAssociations | null> {
    return pipe(
      await Lot.findOne({
        where: {
          id
        },
        include: [
          { model: Image, as: "profileImage" },
          { model: Image, as: "images" },
          { model: Attachment },
          { model: UserLotRole, include: [{ model: User }, { model: Role }] },
          ...(orgId ? [{ model: Complex, where: { orgId } }] : [])
        ]
      }),
      O.fromNullable,
      O.map(lot =>
        pipe(
          lot,
          Lot.withImagesUnsafe,
          Lot.withProfileImageUnsafe,
          Lot.withRolesAndUsersUnsafe,
          Lot.withAttachmentsUnsafe
        )
      ),
      O.toNullable
    );
  }

  static async findAllWithAssociations({
    orgId,
    complexId
  }: { orgId?: number; complexId?: number } = {}): Promise<
    LotWithAssociations[]
  > {
    return pipe(
      await Lot.findAll({
        where: {
          ...(complexId ? { complexId } : {})
        },
        include: [
          { model: Image, as: "profileImage" },
          { model: Image, as: "images" },
          { model: Attachment },
          { model: UserLotRole, include: [{ model: User }, { model: Role }] },
          ...(orgId ? [{ model: Complex, where: { orgId } }] : [])
        ]
      }),
      A.map(lot =>
        pipe(
          lot,
          Lot.withImagesUnsafe,
          Lot.withProfileImageUnsafe,
          Lot.withRolesAndUsersUnsafe,
          Lot.withAttachmentsUnsafe
        )
      )
    );
  }

  static fromPostDtoToInput(dto: LotsPostDto): LotWithAssociationsCreateInput {
    const {
      address1,
      complexId,
      gpsLatitude,
      gpsLongitude,
      postcode,
      state,
      suburb,
      address2,
      buildDate,
      characteristics,
      classification,
      floorArea,
      landArea,
      occupier,
      storeys,
      images,
      profileImage,
      attachments,
      ...rest
    } = dto;
    mustBeEmptyObject(rest);

    const uniqueImages = uniquefyStringArray(images || []);
    const uniqueAttachments = uniquefyStringArray(attachments || []);

    return {
      address1,
      suburb,
      state,
      postcode,
      gpsLongitude,
      gpsLatitude,
      complexId,
      profileImage,
      storeys,
      classification,
      characteristics,
      buildDate,
      address2,
      floorArea,
      images: uniqueImages,
      landArea,
      occupier,
      roles: {},
      attachments: uniqueAttachments
    };
  }

  static fromPutDtoToInput(dto: LotsPutDto): LotWithAssociationsUpdateInput {
    const {
      address1,
      profileImage,
      images,
      storeys,
      occupier,
      landArea,
      floorArea,
      classification,
      characteristics,
      buildDate,
      address2,
      suburb,
      state,
      postcode,
      isActive,
      gpsLatitude,
      gpsLongitude,
      roles,
      attachments,
      ...rest
    } = dto;
    mustBeEmptyObject(rest);

    const uniqueImages = pipe(
      images,
      O.fromNullable,
      O.map(uniquefyStringArray),
      O.toUndefined
    );
    const uniqueAttachments = pipe(
      attachments,
      O.fromNullable,
      O.map(uniquefyStringArray),
      O.toUndefined
    );

    return {
      address1,
      roles,
      occupier,
      landArea,
      images: uniqueImages,
      floorArea,
      address2,
      buildDate,
      characteristics,
      classification,
      storeys,
      profileImage,
      gpsLatitude,
      gpsLongitude,
      postcode,
      state,
      suburb,
      isActive,
      attachments: uniqueAttachments
    };
  }

  static toDtoWithAssociations(
    lot: LotWithAssociations
  ): GetExplicitUndefinedType<LotsResponseDto> {
    return {
      address1: lot.address1,
      address2: lot.address2,
      buildDate: lot.buildDate,
      characteristics: lot.characteristics,
      classification: lot.classification,
      complexId: lot.complexId,
      floorArea: lot.floorArea,
      gpsLatitude: lot.gpsLatitude,
      gpsLongitude: lot.gpsLongitude,
      id: lot.id,
      images: lot.images.map(i => i.imageUrl),
      isActive: lot.isActive,
      landArea: lot.landArea,
      occupier: lot.occupier,
      postcode: lot.postcode,
      profileImage: lot.profileImage?.imageUrl,
      state: lot.state,
      storeys: lot.storeys,
      suburb: lot.suburb,
      attachments: lot.attachments.map(a => a.attachmentUrl)
    };
  }

  static toGetDtoWithAssociations(
    lot: LotWithAssociations
  ): GetExplicitUndefinedType<LotsGetResponseDto> {
    return {
      ...Lot.toDtoWithAssociations(lot),
      roles: groupBy(
        ulr => [ulr.role.roleName, User.toDto(ulr.user)],
        lot.userLotRoles
      )
    };
  }

  static toDto(lot: Lot): GetExplicitUndefinedType<LotsResponseDto> {
    return {
      address1: lot.address1,
      address2: lot.address2,
      buildDate: lot.buildDate,
      characteristics: lot.characteristics,
      classification: lot.classification,
      complexId: lot.complexId,
      floorArea: lot.floorArea,
      gpsLatitude: lot.gpsLatitude,
      gpsLongitude: lot.gpsLongitude,
      id: lot.id,
      isActive: lot.isActive,
      landArea: lot.landArea,
      occupier: lot.occupier,
      postcode: lot.postcode,
      state: lot.state,
      storeys: lot.storeys,
      suburb: lot.suburb,
      profileImage: undefined,
      images: undefined,
      attachments: undefined
    };
  }
}

export type WithRolesAndUsers = {
  userLotRoles: (UserLotRole & WithRole & WithUser)[];
};

export type WithImages = {
  images: Image[];
};

export type WithAttachments = {
  attachments: Attachment[];
};
