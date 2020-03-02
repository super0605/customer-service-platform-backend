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
import Role from "./role";
import RolePermission from "./role-permission";

@Table({ tableName: "permissions", freezeTableName: true, timestamps: false })
export default class Permission extends Model<Permission> {
  @PrimaryKey
  @Column({ field: "permissions_id", autoIncrement: true })
  id!: number;

  @AllowNull(false)
  @Length({ max: 32 })
  @Column({ field: "short_name" })
  shortName!: string;

  @Column({ field: "description", type: DataType.TEXT })
  description!: string;

  @BelongsToMany(
    () => Role,
    () => RolePermission
  )
  roles!: Role[];

  @HasMany(() => RolePermission)
  rolePermissions?: RolePermission[];
}
