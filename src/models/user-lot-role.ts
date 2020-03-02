import {
  AllowNull,
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript";
import Lot from "./lot";
import Role from "./role";
import User from "./user";

@Table({
  tableName: "users_lots_roles",
  freezeTableName: true,
  timestamps: false
})
export default class UserLotRole extends Model<UserLotRole> {
  @AllowNull(false)
  @ForeignKey(() => User)
  @Column({ field: "users_id", primaryKey: true })
  userId!: number;

  @BelongsTo(() => User, "users_id")
  user?: User;

  @AllowNull(false)
  @ForeignKey(() => Lot)
  @Column({ field: "lots_id", primaryKey: true })
  lotId!: number;

  @BelongsTo(() => Lot, "lots_id")
  lot?: Lot;

  @AllowNull(false)
  @ForeignKey(() => Role)
  @Column({ field: "roles_id", primaryKey: true })
  roleId!: number;

  @BelongsTo(() => Role, "roles_id")
  role?: Role;
}

export type WithRole = {
  role: Role;
};

export type WithUser = {
  user: User;
};
