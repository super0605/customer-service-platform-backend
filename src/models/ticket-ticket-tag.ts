import {
  AllowNull,
  Column,
  ForeignKey,
  Model,
  Table,
  BelongsTo
} from "sequelize-typescript";
import Ticket from "./ticket";
import TicketTag from "./ticket-tag";

@Table({
  tableName: "tickets_ticket_tags",
  freezeTableName: true,
  timestamps: false
})
export default class TicketTicketTag extends Model<TicketTicketTag> {
  @AllowNull(false)
  @ForeignKey(() => Ticket)
  @Column({ field: "tickets_id" })
  ticketId!: number;

  @BelongsTo(() => Ticket, "tickets_id")
  ticket?: Ticket;

  @AllowNull(false)
  @ForeignKey(() => TicketTag)
  @Column({ field: "ticket_tags_id" })
  ticketTagId!: number;

  @BelongsTo(() => TicketTag, "ticket_tags_id")
  ticketTag?: TicketTag;
}
