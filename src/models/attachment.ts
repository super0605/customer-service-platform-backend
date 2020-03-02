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
import ComplexAttachment from "./complex-attachment";
import Lot from "./lot";
import LotAttachment from "./lot-attachment";
import Ticket from "./ticket";
import TicketAttachment from "./ticket-attachment";

const protectedAttributes: string[] = [];

@DefaultScope(() => ({
  attributes: { exclude: protectedAttributes }
}))
@Table({
  tableName: "attachments",
  freezeTableName: true,
  timestamps: false
})
export default class Attachment extends Model<Attachment> {
  @PrimaryKey
  @Column({ field: "attachments_id", autoIncrement: true })
  id!: number;

  @AllowNull(false)
  @Length({ max: 255 })
  @Column({ field: "attachment_url" })
  attachmentUrl!: string;

  @HasMany(() => TicketAttachment)
  ticketAttachments?: TicketAttachment[];

  @BelongsToMany(
    () => Ticket,
    () => TicketAttachment
  )
  tickets?: Ticket[];

  @HasMany(() => ComplexAttachment)
  complexAttachments?: ComplexAttachment[];

  @BelongsToMany(
    () => Complex,
    () => ComplexAttachment
  )
  complexes?: Complex[];

  @HasMany(() => LotAttachment)
  lotAttachmnets?: LotAttachment[];

  @BelongsToMany(
    () => Lot,
    () => LotAttachment
  )
  lots?: Lot[];

  toJSON(): object {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attributes: any = Object.assign({}, this.get());
    for (const a of protectedAttributes) {
      delete attributes[a];
    }
    return attributes;
  }
}
