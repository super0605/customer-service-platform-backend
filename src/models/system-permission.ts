import {
  AllowNull,
  BelongsToMany,
  Column,
  DataType,
  Length,
  Model,
  PrimaryKey,
  Table,
  HasMany
} from "sequelize-typescript";
import { SystemPermissionName } from "src/seeds/seeds";
import SystemRole from "./system-role";
import SystemRolePermission from "./system-role-permission";

export { SystemPermissionName };

@Table({
  tableName: "system_permissions",
  freezeTableName: true,
  timestamps: false
})
export default class SystemPermission extends Model<SystemPermission> {
  @PrimaryKey
  @Column({ field: "system_permissions_id", autoIncrement: true })
  id!: number;

  @AllowNull(false)
  @Length({ max: 255 })
  @Column({ field: "short_name", unique: "short_name_UNIQUE" })
  shortName!: SystemPermissionName;

  @Column({ field: "description", type: DataType.TEXT })
  description!: string;

  @BelongsToMany(
    () => SystemRole,
    () => SystemRolePermission
  )
  systemRoles!: SystemRole[];

  @HasMany(() => SystemRolePermission)
  systemRolePermissions?: SystemRolePermission[];
}
