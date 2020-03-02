import {
  AllowNull,
  BelongsToMany,
  Column,
  HasMany,
  Length,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import { SystemRoleName } from "src/seeds/seeds";
import SystemPermission from "./system-permission";
import SystemRolePermission from "./system-role-permission";
import User from "./user";

export { SystemRoleName };

@Table({ tableName: "system_roles", freezeTableName: true, timestamps: false })
export default class SystemRole extends Model<SystemRole> {
  @PrimaryKey
  @Column({ field: "system_roles_id", autoIncrement: true })
  id!: number;

  @AllowNull(false)
  @Length({ max: 45 })
  @Column({ field: "name", unique: "name_UNIQUE" })
  name!: SystemRoleName;

  @BelongsToMany(
    () => SystemPermission,
    () => SystemRolePermission
  )
  systemPermissions?: SystemPermission[];

  @HasMany(() => SystemRolePermission)
  systemRolePermissions?: SystemRolePermission[];

  @HasMany(() => User)
  users?: User[];
}

export type WithPermissions = {
  systemPermissions: SystemPermission[];
};
