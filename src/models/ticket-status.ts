import {
  AllowNull,
  Column,
  DefaultScope,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Length
} from "sequelize-typescript";
import Ticket from "./ticket";

export enum PredefinedTicketStatus {
  Closed = "CLOSED",
  Open = "OPEN"
}

const protectedAttributes: string[] = [];

@DefaultScope(() => ({
  attributes: { exclude: protectedAttributes }
}))
@Table({
  tableName: "ticket_statuses",
  freezeTableName: true,
  timestamps: false
})
export default class TicketStatus extends Model<TicketStatus> {
  @PrimaryKey
  @Column({ field: "ticket_statuses_id", autoIncrement: true })
  id!: number;

  @AllowNull(false)
  @Length({ max: 45 })
  @Column({ field: "status", unique: "status_UNIQUE" })
  status!: string;

  @HasMany(() => Ticket)
  tickets?: Ticket[];

  toJSON(): object {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attributes: any = Object.assign({}, this.get());
    for (const a of protectedAttributes) {
      delete attributes[a];
    }
    return attributes;
  }
}
