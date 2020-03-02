import {
  AllowNull,
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript";
import SystemPermission from "./system-permission";
import SystemRole from "./system-role";

@Table({
  tableName: "system_roles_permissions",
  freezeTableName: true,
  timestamps: false
})
export default class SystemRolePermission extends Model<SystemRolePermission> {
  @AllowNull(false)
  @ForeignKey(() => SystemRole)
  @Column({ field: "system_roles_id" })
  systemRoleId!: number;

  @BelongsTo(() => SystemRole)
  systemRole?: SystemRole;

  @AllowNull(false)
  @ForeignKey(() => SystemPermission)
  @Column({ field: "system_permissions_id" })
  systemPermissionId!: number;

  @BelongsTo(() => SystemPermission)
  systemPermission?: SystemPermission;
}
