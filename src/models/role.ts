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
import Permission from "./permission";
import RolePermission from "./role-permission";
import UserLotRole from "./user-lot-role";

@Table({ tableName: "roles", freezeTableName: true, timestamps: false })
export default class Role extends Model<Role> {
  @PrimaryKey
  @Column({ field: "roles_id", autoIncrement: true })
  id!: number;

  @AllowNull(false)
  @Length({ max: 32 })
  @Column({ field: "role_name" })
  roleName!: string;

  @BelongsToMany(
    () => Permission,
    () => RolePermission
  )
  permissions!: Permission[];

  @HasMany(() => RolePermission)
  rolePermissions?: RolePermission[];

  // BUG: for whatever reason the following code breaks MODEL_FIRST tests because somehow
  // it enforces unique constraint in the users_lots_roles table.
  // Don't ask me how its related, I have no idea. Sequelize rules, I guess.
  // @BelongsToMany(
  //   () => Lot,
  //   () => UserLotRole
  // )
  // lots?: Lot[];

  // BUG: for whatever reason the following code breaks MODEL_FIRST tests because somehow
  // it enforces unique constraint in the users_lots_roles table.
  // Don't ask me how its related, I have no idea. Sequelize rules, I guess.
  // @BelongsToMany(
  //   () => User,
  //   () => UserLotRole
  // )
  // users?: User[];

  @HasMany(() => UserLotRole)
  userLotRoles?: UserLotRole[];
}
