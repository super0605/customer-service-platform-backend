import {
  AllowNull,
  BelongsTo,
  Column,
  DefaultScope,
  ForeignKey,
  HasMany,
  Length,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import Complex from "./complex";
import Image from "./image";
import User from "./user";
import { OrgsResponseDto } from "src/dtos";
import { GetModelCreateInputType } from "./type-magic";
import { ModelEntityNotFoundError } from "./errors";
import { UnreachableError } from "src/errors";

type OrgCreateInput = Omit<GetModelCreateInputType<Org>, "profileImageId">;

type WithProfileImageCreateInput = {
  profileImage?: string;
};

type OrgUpdateInput = Partial<OrgCreateInput>;

type WithProfileImageUpdateInput = Partial<WithProfileImageCreateInput>;

const protectedAttributes: string[] = ["profileImageId"];

@DefaultScope(() => ({
  attributes: { exclude: protectedAttributes }
}))
@Table({ tableName: "orgs", freezeTableName: true, timestamps: false })
export default class Org extends Model<Org> {
  @PrimaryKey
  @Column({ field: "orgs_id", autoIncrement: true })
  id!: number;

  @AllowNull(false)
  @Length({ max: 255 })
  @Column({ field: "trading_name" })
  tradingName!: string;

  @Length({ max: 255 })
  @Column({ field: "company_name" })
  companyName?: string;

  @AllowNull(false)
  @Length({ max: 11 })
  @Column({ field: "abn" })
  abn!: string;

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
  @Length({ max: 6 })
  @Column({ field: "postcode" })
  postcode!: string;

  @HasMany(() => Complex)
  complexes?: Complex[];

  @HasMany(() => User)
  users?: User[];

  @ForeignKey(() => Image)
  @Column({ field: "profile_image_id" })
  profileImageId?: number;

  @BelongsTo(() => Image)
  profileImage?: Image;

  toJSON(): object {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attributes: any = Object.assign({}, this.get());
    for (const a of protectedAttributes) {
      delete attributes[a];
    }
    return attributes;
  }

  static async withProfileImageCreate({
    profileImage,
    ...input
  }: OrgCreateInput & WithProfileImageCreateInput): Promise<Org> {
    let org: Org;
    if (profileImage) {
      org = await Org.create(
        {
          ...input,
          profileImage: {
            imageUrl: profileImage
          }
        },
        { include: [{ model: Image }] }
      );
    } else {
      org = await Org.create(input);
    }

    return org;
  }

  static async withProfileImageUpdateByPk(
    id: number,
    { profileImage, ...input }: OrgUpdateInput & WithProfileImageUpdateInput
  ): Promise<void> {
    if (profileImage) {
      const org = await Org.withProfileImageFindByPk(id);
      if (!org) {
        throw new ModelEntityNotFoundError("Org", id);
      }
      if (!Org.sequelize) {
        throw new UnreachableError();
      }
      await Org.sequelize.transaction(async transaction => {
        await Promise.all([
          // TODO: delete old image?
          org.$create(
            "profileImage",
            { imageUrl: profileImage },
            { transaction }
          ),
          org.update(input, { transaction })
        ]);
      });
    } else {
      const [count] = await Org.update(input, { where: { id: id } });
      if (!count) {
        throw new ModelEntityNotFoundError("Org", id);
      }
    }
  }

  static async withProfileImageFindByPk(id: number): Promise<Org | null> {
    const org = await Org.findOne({
      where: { id: id },
      include: [{ model: Image }]
    });

    return org;
  }

  static async withProfileImageFindAll(): Promise<Org[]> {
    const orgs = await Org.findAll({ include: [{ model: Image }] });

    return orgs;
  }

  static toDto(org: Org): OrgsResponseDto {
    return {
      abn: org.abn,
      address1: org.address1,
      id: org.id,
      postcode: org.postcode,
      state: org.state,
      suburb: org.suburb,
      tradingName: org.tradingName,
      address2: org.address2,
      companyName: org.companyName,
      profileImage: org.profileImage?.imageUrl
    };
  }
}
