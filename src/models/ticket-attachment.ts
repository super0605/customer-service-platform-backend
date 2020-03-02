import {
  AllowNull,
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript";
import Ticket from "./ticket";
import Attachment from "./attachment";

@Table({
  tableName: "tickets_attachments",
  freezeTableName: true,
  timestamps: false
})
export default class TicketAttachment extends Model<TicketAttachment> {
  @AllowNull(false)
  @ForeignKey(() => Ticket)
  @Column({ field: "tickets_id" })
  ticketId!: number;

  @BelongsTo(() => Ticket)
  ticket?: Ticket;

  @AllowNull(false)
  @ForeignKey(() => Attachment)
  @Column({ field: "attachments_id" })
  attachmentId!: number;

  @BelongsTo(() => Attachment)
  attachment?: Attachment;
}
