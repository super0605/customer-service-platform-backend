import {
  AllowNull,
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript";
import Lot from "./lot";
import Ticket from "./ticket";

@Table({
  tableName: "tickets_lots",
  freezeTableName: true,
  timestamps: false
})
export default class TicketLot extends Model<TicketLot> {
  @AllowNull(false)
  @ForeignKey(() => Ticket)
  @Column({ field: "tickets_id" })
  ticketId!: number;

  @BelongsTo(() => Ticket, "tickets_id")
  ticket?: Ticket;

  @AllowNull(false)
  @ForeignKey(() => Lot)
  @Column({ field: "lots_id" })
  lotId!: number;

  @BelongsTo(() => Lot, "lots_id")
  lot?: Lot;
}
