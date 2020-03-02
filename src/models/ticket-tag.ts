import {
  AllowNull,
  BelongsToMany,
  Column,
  DefaultScope,
  Length,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import Ticket from "./ticket";
import TicketTicketTag from "./ticket-ticket-tag";

const protectedAttributes: Array<keyof TicketTag> = [];

@DefaultScope(() => ({
  attributes: { exclude: protectedAttributes }
}))
@Table({
  tableName: "ticket_tags",
  freezeTableName: true,
  timestamps: false
})
export default class TicketTag extends Model<TicketTag> {
  @PrimaryKey
  @Column({ field: "ticket_tags_id", autoIncrement: true })
  id!: number;

  @AllowNull(false)
  @Length({ max: 45 })
  @Column({ field: "tag" })
  tag!: string;

  @BelongsToMany(
    () => TicketTag,
    () => TicketTicketTag
  )
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
