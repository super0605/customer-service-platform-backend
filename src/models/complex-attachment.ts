import {
  AllowNull,
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript";
import Attachment from "./attachment";
import Complex from "./complex";

@Table({
  tableName: "complexes_attachments",
  freezeTableName: true,
  timestamps: false
})
export default class ComplexAttachment extends Model<ComplexAttachment> {
  @AllowNull(false)
  @ForeignKey(() => Complex)
  @Column({ field: "complexes_id" })
  complexId!: number;

  @BelongsTo(() => Complex)
  complex?: Complex;

  @AllowNull(false)
  @ForeignKey(() => Attachment)
  @Column({ field: "attachment_id" })
  attachmentId!: number;

  @BelongsTo(() => Attachment)
  attachment?: Attachment;
}
