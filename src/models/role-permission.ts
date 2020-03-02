import {
  AllowNull,
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript";
import Permission from "./permission";
import Role from "./role";

@Table({
  tableName: "roles_permissions",
  freezeTableName: true,
  timestamps: false
})
export default class RolePermission extends Model<RolePermission> {
  @AllowNull(false)
  @ForeignKey(() => Role)
  @Column({ field: "roles_id" })
  roleId!: number;

  @BelongsTo(() => Role)
  role?: Role;

  @AllowNull(false)
  @ForeignKey(() => Permission)
  @Column({ field: "permissions_id" })
  permissionId!: number;

  @BelongsTo(() => Permission)
  permission?: Permission;
}
