import {
  AllowNull,
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript";
import Attachment from "./attachment";
import Lot from "./lot";

@Table({
  tableName: "lots_attachments",
  freezeTableName: true,
  timestamps: false
})
export default class LotAttachment extends Model<LotAttachment> {
  @AllowNull(false)
  @ForeignKey(() => Lot)
  @Column({ field: "lots_id" })
  lotId!: number;

  @BelongsTo(() => Lot)
  lot?: Lot;

  @AllowNull(false)
  @ForeignKey(() => Attachment)
  @Column({ field: "attachment_id" })
  attachmentId!: number;

  @BelongsTo(() => Attachment)
  attachment?: Attachment;
}
