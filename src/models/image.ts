import {
  AllowNull,
  BelongsToMany,
  Column,
  DefaultScope,
  HasMany,
  Length,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import Complex from "./complex";
import ComplexImage from "./complex-image";
import Lot from "./lot";
import LotImage from "./lot-image";
import Org from "./org";
import User from "./user";
import Ticket from "./ticket";

const protectedAttributes: string[] = [];

@DefaultScope(() => ({
  attributes: { exclude: protectedAttributes }
}))
@Table({
  tableName: "images",
  freezeTableName: true,
  timestamps: false
})
export default class Image extends Model<Image> {
  @PrimaryKey
  @Column({ field: "images_id", autoIncrement: true })
  id!: number;

  @AllowNull(false)
  @Length({ max: 255 })
  @Column({ field: "image_url" })
  imageUrl!: string;

  @HasMany(() => Lot)
  lots?: Lot[];

  @HasMany(() => Org)
  orgs?: Org[];

  @HasMany(() => User)
  users?: User[];

  @HasMany(() => Ticket)
  tickets?: Ticket[];

  @HasMany(() => ComplexImage)
  complexImages?: ComplexImage[];

  @BelongsToMany(
    () => Complex,
    () => ComplexImage
  )
  complexes?: Complex[];

  @HasMany(() => LotImage)
  lotImages?: LotImage[];

  @BelongsToMany(
    () => Lot,
    () => LotImage
  )
  additionalLots?: Lot[];

  toJSON(): object {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attributes: any = Object.assign({}, this.get());
    for (const a of protectedAttributes) {
      delete attributes[a];
    }
    return attributes;
  }
}
