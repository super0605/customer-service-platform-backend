import {
  AllowNull,
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript";
import Image from "./image";
import Lot from "./lot";

@Table({
  tableName: "lots_images",
  freezeTableName: true,
  timestamps: false
})
export default class LotImage extends Model<LotImage> {
  @AllowNull(false)
  @ForeignKey(() => Lot)
  @Column({ field: "lots_lots_id" })
  lotId!: number;

  @BelongsTo(() => Lot)
  lot?: Lot;

  @AllowNull(false)
  @ForeignKey(() => Image)
  @Column({ field: "images_images_id" })
  imageId!: number;

  @BelongsTo(() => Image)
  image?: Image;
}
