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
  ComplexesPostDto,
  ComplexesPutDto,
  ComplexesResponseDto
} from "src/dtos";
import { mustBeEmptyObject, UnreachableError } from "src/errors";
import { hasDefinedValues, uniquefyStringArray } from "src/utils";
import Attachment from "./attachment";
import { ClassificationType } from "./classification-type";
import ComplexAttachment from "./complex-attachment";
import ComplexImage from "./complex-image";
import Image from "./image";
import Lot from "./lot";
import Org from "./org";
import {
  GetExplicitUndefinedType,
  GetModelCreateInputType,
  Undefinable
} from "./type-magic";

type ComplexCreateInput = Omit<
  GetExplicitUndefinedType<GetModelCreateInputType<Complex>>,
  "deactivatedAt" | "isActive"
>;

type WithImagesCreateInput = {
  images: string[];
};

type WithAttachmentsCreateInput = {
  attachments: string[];
};

type ComplexWithAssociationsCreateInput = ComplexCreateInput &
  WithImagesCreateInput &
  WithAttachmentsCreateInput;

type ComplexUpdateInput = Undefinable<
  Omit<ComplexCreateInput, "orgId"> & {
    isActive: boolean;
  }
>;

type WithImagesUpdateInput = {
  images: string[];
};

type WithAttachmentsUpdateInput = {
  attachments: string[];
};

type ComplexWithAssociationsUpdateInput = ComplexUpdateInput &
  Undefinable<WithImagesUpdateInput> &
  Undefinable<WithAttachmentsUpdateInput>;

export type ComplexWithAssociations = Complex & WithImages & WithAttachments;

const protectedAttributes: Array<keyof Complex> = [];

@DefaultScope(() => ({
  attributes: { exclude: protectedAttributes }
}))
@Table({ tableName: "complexes", freezeTableName: true, timestamps: false })
export default class Complex extends Model<Complex> {
  @PrimaryKey
  @Column({ field: "complexes_id", autoIncrement: true })
  id!: number;

  @AllowNull(false)
  @Length({ max: 16 })
  @Column({ field: "strata_plan" })
  strataPlan!: string;

  @AllowNull(false)
  @Length({ max: 255 })
  @Column({ field: "name" })
  name!: string;

  @Length({ max: 255 })
  @Column({ field: "sp_num" })
  spNum?: string;

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

  @Length({ max: 255 })
  @Column({ field: "type" })
  type?: string;

  @Column({ field: "num_lots", type: DataType.INTEGER })
  numLots?: number;

  @Column({ field: "established_date", type: DataType.DATEONLY })
  establishedDate?: Date;

  @AllowNull(false)
  @Length({ max: 11, min: 11 })
  @Column({ field: "abn" })
  abn!: string;

  @Length({ max: 9, min: 9 })
  @Column({ field: "tfn" })
  tfn?: string;

  @Column({ field: "classification" })
  classification?: ClassificationType;

  @Column({ field: "storeys" })
  storeys?: number;

  @Length({ max: 255 })
  @Column({ field: "characteristics" })
  characteristics?: string;

  @Column({ field: "total_floor_area", type: DataType.INTEGER })
  totalFloorArea?: number; // TODO: unit of measure

  @Column({ field: "total_land_area", type: DataType.INTEGER })
  totalLandArea?: number; // TODO: unit of measure

  @Column({ field: "build_date", type: DataType.DATEONLY })
  buildDate?: Date;

  @Length({ max: 255 })
  @Column({ field: "builder" })
  builder?: string;

  @ForeignKey(() => Org)
  @AllowNull(false)
  @Column({ field: "orgs_id" })
  orgId!: number;

  @BelongsTo(() => Org)
  org?: Org;

  @HasMany(() => Lot)
  lots?: Lot[];

  @Column({ field: "deactivated_at", type: DataType.DATE })
  deactivatedAt?: Date;

  @HasMany(() => ComplexImage)
  complexImages?: ComplexImage[];

  @BelongsToMany(
    () => Image,
    () => ComplexImage
  )
  images?: Image[];

  @HasMany(() => ComplexAttachment)
  complexAttachments?: ComplexAttachment[];

  @BelongsToMany(
    () => Attachment,
    () => ComplexAttachment
  )
  attachments?: Attachment[];

  get isActive(): boolean {
    return !this.getDataValue("deactivatedAt");
  }

  toJSON(): object {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attributes: any = Object.assign({}, this.get());
    for (const a of protectedAttributes) {
      delete attributes[a];
    }
    return attributes;
  }

  private static withImagesUnsafe<T extends Complex>(
    complex: T
  ): T & WithImages {
    if (!complex.images) {
      throw new UnreachableError();
    }

    return complex as T & WithImages;
  }

  private static withAttachmentsUnsafe<T extends Complex>(
    complex: T
  ): T & WithAttachments {
    if (!complex.attachments) {
      throw new UnreachableError();
    }

    return complex as T & WithAttachments;
  }

  static async createWithAssociations({
    images,
    attachments,
    ...input
  }: ComplexWithAssociationsCreateInput): Promise<ComplexWithAssociations> {
    const complex = await Complex.create(
      {
        ...input,
        images: images.map(i => ({ imageUrl: i })),
        attachments: attachments.map(a => ({ attachmentUrl: a }))
      },
      { include: [{ model: Image }, { model: Attachment }] }
    );

    return pipe(
      complex,
      Complex.withImagesUnsafe,
      Complex.withAttachmentsUnsafe
    );
  }

  async updateImages(
    { images }: WithImagesUpdateInput,
    { transaction }: { transaction?: Transaction } = {}
  ): Promise<void> {
    const objs = await Image.bulkCreate(
      images.map(i => ({ imageUrl: i })),
      { transaction }
    );
    await this.$set("images", objs, { transaction });
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

  async updateValues(
    { isActive, ...input }: ComplexUpdateInput,
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

  async updateWithAssociations({
    images,
    attachments,
    ...input
  }: ComplexWithAssociationsUpdateInput): Promise<void> {
    if (
      images === undefined &&
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

        if (images !== undefined) {
          updates.push(this.updateImages({ images }, { transaction }));
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
  ): Promise<ComplexWithAssociations | null> {
    return pipe(
      await Complex.findOne({
        where: {
          id,
          ...(orgId ? { orgId } : {})
        },
        include: [{ model: Image }, { model: Attachment }]
      }),
      O.fromNullable,
      O.map(complex =>
        pipe(complex, Complex.withImagesUnsafe, Complex.withAttachmentsUnsafe)
      ),
      O.toNullable
    );
  }

  static async findAllWithAssociations({
    orgId
  }: { orgId?: number } = {}): Promise<ComplexWithAssociations[]> {
    const complexes = await Complex.findAll({
      where: {
        ...(orgId ? { orgId } : {})
      },
      include: [{ model: Image }, { model: Attachment }]
    });

    return pipe(
      complexes,
      A.map(complex =>
        pipe(complex, Complex.withImagesUnsafe, Complex.withAttachmentsUnsafe)
      )
    );
  }

  static fromPostDtoToInput(
    dto: ComplexesPostDto
  ): ComplexWithAssociationsCreateInput {
    const {
      abn,
      address1,
      name,
      orgId,
      postcode,
      state,
      strataPlan,
      suburb,
      address2,
      buildDate,
      builder,
      characteristics,
      classification,
      establishedDate,
      images,
      numLots,
      spNum,
      storeys,
      tfn,
      totalFloorArea,
      totalLandArea,
      type,
      attachments,
      ...rest
    } = dto;
    mustBeEmptyObject(rest);

    // TODO: uniquefy attachments for tickets
    const uniqueImages = uniquefyStringArray(images || []);
    const uniqueAttachments = uniquefyStringArray(attachments || []);

    return {
      abn,
      suburb,
      strataPlan,
      state,
      postcode,
      orgId,
      name,
      address1,
      address2,
      buildDate,
      builder,
      characteristics,
      classification,
      establishedDate,
      images: uniqueImages,
      numLots,
      spNum,
      storeys,
      tfn,
      totalFloorArea,
      totalLandArea,
      type,
      attachments: uniqueAttachments
    };
  }

  static fromPutDtoToInput(
    dto: ComplexesPutDto
  ): ComplexWithAssociationsUpdateInput {
    const {
      abn,
      type,
      totalLandArea,
      totalFloorArea,
      tfn,
      storeys,
      spNum,
      numLots,
      images,
      establishedDate,
      classification,
      characteristics,
      builder,
      buildDate,
      address2,
      address1,
      isActive,
      name,
      postcode,
      state,
      strataPlan,
      suburb,
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
      abn,
      isActive,
      type,
      totalLandArea,
      totalFloorArea,
      tfn,
      storeys,
      spNum,
      numLots,
      images: uniqueImages,
      establishedDate,
      classification,
      characteristics,
      builder,
      buildDate,
      address2,
      address1,
      name,
      postcode,
      state,
      strataPlan,
      suburb,
      attachments: uniqueAttachments
    };
  }

  static toDtoWithAssociations(
    complex: ComplexWithAssociations
  ): GetExplicitUndefinedType<ComplexesResponseDto> {
    return {
      abn: complex.abn,
      address1: complex.address1,
      address2: complex.address2,
      buildDate: complex.buildDate,
      builder: complex.builder,
      characteristics: complex.characteristics,
      classification: complex.classification,
      establishedDate: complex.establishedDate,
      id: complex.id,
      images: complex.images.map(i => i.imageUrl),
      isActive: complex.isActive,
      name: complex.name,
      numLots:
        complex.numLots === undefined
          ? 1
          : complex.numLots > 50
          ? 50
          : complex.numLots < 1
          ? 1
          : complex.numLots,
      orgId: complex.orgId,
      postcode: complex.postcode,
      spNum: complex.spNum,
      state: complex.state,
      storeys: complex.storeys,
      strataPlan: complex.strataPlan,
      suburb: complex.suburb,
      tfn: complex.tfn,
      totalFloorArea: complex.totalFloorArea,
      totalLandArea: complex.totalLandArea,
      type: complex.type,
      attachments: complex.attachments.map(a => a.attachmentUrl)
    };
  }
}

// TODO: move such exports at the top of files in all models for consistency
export type WithImages = {
  images: Image[];
};

export type WithAttachments = {
  attachments: Attachment[];
};
