import {
  AllowNull,
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript";
import Complex from "./complex";
import Image from "./image";

@Table({
  tableName: "complexes_images",
  freezeTableName: true,
  timestamps: false
})
export default class ComplexImage extends Model<ComplexImage> {
  @AllowNull(false)
  @ForeignKey(() => Complex)
  @Column({ field: "complexes_complexes_id" })
  complexId!: number;

  @BelongsTo(() => Complex)
  complex?: Complex;

  @AllowNull(false)
  @ForeignKey(() => Image)
  @Column({ field: "images_images_id" })
  imageId!: number;

  @BelongsTo(() => Image)
  image?: Image;
}
