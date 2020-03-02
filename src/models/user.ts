import * as A from "fp-ts/lib/Array";
import * as M from "fp-ts/lib/Monoid";
import { pipe } from "fp-ts/lib/pipeable";
import { Transaction } from "sequelize";
import { generate } from "generate-password";

import {
  AllowNull,
  BelongsTo,
  Column,
  // DataType,
  DefaultScope,
  ForeignKey,
  HasMany,
  Length,
  Model,
  PrimaryKey,
  Scopes,
  Table
} from "sequelize-typescript";
import { generatePasswordHashWithSalt } from "src/auth";
import {
  UsersPostDtoWithPass,
  UsersPostResponseDto,
  UsersPutDto,
  UsersResponseDto
} from "src/dtos";
import { mustBeEmptyObject, UnreachableError } from "src/errors";
import { hasDefinedValues } from "src/utils";
// import { AppValidationBodyError } from "src/validation";
import { ModelForeignEntityNotFoundError } from "./errors";
import Image from "./image";
import Org from "./org";
import SystemPermission from "./system-permission";
import SystemRole, { SystemRoleName, WithPermissions } from "./system-role";
import Ticket from "./ticket";
import {
  GetExplicitUndefinedType,
  GetModelCreateInputType,
  Undefinable
} from "./type-magic";
import { UserTooManySuperAdminsError } from "./user-errors";
import UserLotRole from "./user-lot-role";

type UserCreateInput = Omit<
  GetExplicitUndefinedType<GetModelCreateInputType<User>>,
  "passwordHash" | "salt" | "systemRoleId" | "profileImageId"
> & {
  password: string;
};

type WithProfileImageCreateInput = {
  profileImage: string | null | undefined;
};

type WithSystemRoleCreateInput = {
  systemRole: SystemRoleName;
};

type UserWithAssociationsCreateInput = UserCreateInput &
  WithProfileImageCreateInput &
  WithSystemRoleCreateInput;

type UserUpdateInput = Undefinable<Omit<UserCreateInput, "password" | "orgId">>;

type WithProfileImageUpdateInput = {
  profileImage: string | null;
};

type WithSystemRoleUpdateInput = {
  systemRole: SystemRoleName;
};

type WithOrgIdUpdateInput = {
  orgId: number | null;
}

type UserWithAssociationsUpdateInput = UserUpdateInput &
  Undefinable<WithProfileImageUpdateInput> &
  Undefinable<WithSystemRoleUpdateInput> &
  Undefinable<WithOrgIdUpdateInput>;

type UserRegisterInput = UserWithAssociationsCreateInput;

type UserRegisterResult = {
  password: string;
  user: User;
};

type ResetPasswordInput = {
  newPassword: string;
};

const protectedAttributes = ["passwordHash", "salt"];

@DefaultScope(() => ({
  attributes: { exclude: protectedAttributes }
}))
@Scopes(() => ({
  withPassword: {
    attributes: { exclude: [] },
    include: [
      {
        model: SystemRole,
        include: [{ model: SystemPermission }]
      }
    ]
  }
}))
@Table({
  tableName: "users",
  freezeTableName: true,
  timestamps: false,
  validate: {
    loginMustBePresent(this: User): void {
      const required: Array<keyof User> = [
        "primaryEmail",
        "homePhone",
        "mobilePhone"
      ];

      const allMissing = pipe(
        required,
        A.foldMap(M.monoidAll)(p => !this[p])
      );
      if (allMissing) {
        throw new Error(`One of [${required.join(", ")}] must be present.`);
      }
    }
  }
})
export default class User extends Model<User> {
  @PrimaryKey
  @Column({ field: "users_id", autoIncrement: true })
  id!: number;

  @AllowNull(false)
  @Column({ field: "password" })
  passwordHash!: string;

  @AllowNull(false)
  @Column({ field: "password_salt" })
  salt!: string;

  @AllowNull(false)
  @Length({ max: 45 })
  @Column({ field: "first_name" })
  firstName!: string;

  @AllowNull(false)
  @Length({ max: 45 })
  @Column({ field: "title" })
  title!: string;

  @AllowNull(false)
  @Length({ max: 45 })
  @Column({ field: "sur_name" })
  surName!: string;

  @Length({ max: 255 })
  @Column({ field: "company" })
  company?: string;

  @Length({ max: 11 })
  @Column({ field: "abn" })
  abn?: string;

  @Length({ max: 9 })
  @Column({ field: "tfn" })
  tfn?: string;

  @Length({ max: 64 })
  @Column({ field: "primary_email", unique: "primary_email_UNIQUE" })
  primaryEmail?: string;

  @Length({ max: 64 })
  @Column({ field: "secondary_email" })
  secondaryEmail?: string;

  @AllowNull(true)
  @Column({ field: "date_of_birth" })
  dateOfBirth?: Date;

  @Length({ max: 16 })
  @Column({ field: "home_phone" })
  homePhone?: string;

  @Length({ max: 16 })
  @Column({ field: "mobile_phone" })
  mobilePhone?: string;

  @Length({ max: 16 })
  @Column({ field: "fax" })
  fax?: string;

  @Length({ max: 255 })
  @Column({ field: "primary_address" })
  primaryAddress?: string;

  @Length({ max: 255 })
  @Column({ field: "postal_address" })
  postalAddress?: string;

  @AllowNull(false)
  @ForeignKey(() => SystemRole)
  @Column({ field: "system_roles_id" })
  systemRoleId!: number;

  @BelongsTo(() => SystemRole)
  systemRole?: SystemRole;

  @ForeignKey(() => Org)
  @Column({ field: "orgs_id" })
  orgId?: number;

  @BelongsTo(() => Org)
  org?: Org;

  // BUG: for whatever reason the following code breaks MODEL_FIRST tests because somehow
  // it enforces unique constraint in the users_lots_roles table.
  // Don't ask me how its related, I have no idea. Sequelize rules, I guess.
  // @BelongsToMany(
  //   () => Role,
  //   () => UserLotRole
  // )
  // roles?: Role[];

  // BUG: for whatever reason the following code breaks MODEL_FIRST tests because somehow
  // it enforces unique constraint in the users_lots_roles table.
  // Don't ask me how its related, I have no idea. Sequelize rules, I guess.
  // @BelongsToMany(
  //   () => Lot,
  //   () => UserLotRole
  // )
  // lots?: Lot[];

  @HasMany(() => UserLotRole)
  userLotRoles?: UserLotRole[];

  @HasMany(() => Ticket, "issuer_id")
  ticketsIssued?: Ticket[];

  @HasMany(() => Ticket, "executive_id")
  ticketsExecuted?: Ticket[];

  @ForeignKey(() => Image)
  @Column({ field: "profile_image_id" })
  profileImageId?: number;

  @BelongsTo(() => Image)
  profileImage?: Image;

  toJSON(): object {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attributes: any = Object.assign({}, this.get());
    for (const a of protectedAttributes) {
      delete attributes[a];
    }
    return attributes;
  }

  static async createWithAssociations({
    password,
    systemRole,
    profileImage,
    ...input
  }: UserWithAssociationsCreateInput): Promise<User> {
    const { passwordHash, salt } = await generatePasswordHashWithSalt(password);

    const role = await SystemRole.findOne({
      where: {
        name: systemRole
      }
    });
    if (!role) {
      throw new ModelForeignEntityNotFoundError<
        UserWithAssociationsCreateInput
      >("SystemRole", systemRole, "systemRole");
    }

    if (systemRole === "SUPERADMIN") {
      const potentialSuperAdmin = await User.findOne({
        include: [
          {
            model: SystemRole,
            where: {
              name: systemRole
            }
          }
        ]
      });
      if (potentialSuperAdmin) {
        throw new UserTooManySuperAdminsError();
      }
    }

    // can't do validation at sequelize level because it does not support async validations
    // and we do not always have access to the systemRole object to acquire its roleName.
    // if (
    //   systemRole === "MANAGER" ||
    //   systemRole === "STANDARD_USER" ||
    //   systemRole === "MANAGER_ADMIN"
    // ) {
    //   if (!input.orgId) {
    //     console.log("NO ORG ID: ", input)
    //     throw new AppValidationBodyError<UserWithAssociationsCreateInput>({
    //       orgId: {
    //         value: input.orgId,
    //         rules: [
    //           {
    //             name: "isRequired",
    //             message: `'orgId' is required for system role '${systemRole}'`
    //           }
    //         ]
    //       }
    //     });
    //   }
    // }

    let user: User;
    if (profileImage) {
      user = await User.create(
        {
          ...input,
          passwordHash,
          salt,
          systemRoleId: role.id,
          profileImage: {
            imageUrl: profileImage
          }
        },
        { include: [{ model: Image }] }
      );
    } else {
      user = await User.create({
        ...input,
        passwordHash,
        salt,
        systemRoleId: role.id
      });
    }

    return user;
  }

  static async register(input: UserRegisterInput): Promise<UserRegisterResult> {
    // Instead of generating random password we take password from user input
    // const password = input.password;
    const password = generate({
      length: 6,
      numbers: true
    });
    const user = await User.createWithAssociations({
      ...input,
      password
    });

    return {
      password,
      user
    };
  }

  async updateProfileImage(
    { profileImage }: WithProfileImageUpdateInput,
    { transaction }: { transaction?: Transaction } = {}
  ): Promise<void> {
    // get image obj if its not there
    let profileImageObj: Image | null | undefined;
    if (this.profileImageId && !this.profileImage) {
      // NOTE: dont use transaction for selects
      profileImageObj = await Image.findOne({
        where: { id: this.profileImageId }
      });
      if (!profileImageObj) {
        throw new UnreachableError();
      }
    } else {
      profileImageObj = this.profileImage;
    }

    if (profileImage === null) {
      if (profileImageObj == null) {
        // skip
      } else {
        // TODO: delete old image?
        await this.update({ profileImageId: null }, { transaction });
      }
    } else {
      if (profileImageObj == null) {
        await this.$create(
          "profileImage",
          { imageUrl: profileImage },
          { transaction }
        );
      } else {
        if (profileImage === profileImageObj.imageUrl) {
          // skip
        } else {
          // TODO: delete old image?
          await this.$create(
            "profileImage",
            { imageUrl: profileImage },
            { transaction }
          );
        }
      }
    }
  }

  async updateSystemRole(
    { systemRole }: WithSystemRoleUpdateInput,
    { transaction }: { transaction?: Transaction } = {}
  ): Promise<void> {
    // get system role obj if its not there
    let systemRoleObj: SystemRole;
    if (this.systemRole) {
      systemRoleObj = this.systemRole;
    } else {
      // NOTE: dont use transaction for selects
      const nullable = await SystemRole.findOne({
        where: { id: this.systemRoleId }
      });
      if (!nullable) {
        throw new UnreachableError();
      }
      systemRoleObj = nullable;
    }

    if (systemRole === systemRoleObj.name) {
      // skip
    } else {
      await this.update({ systemRoleId: systemRoleObj.id }, { transaction });
    }
  }

  async updateWithAssociations({
    profileImage,
    systemRole,
    ...input
  }: UserWithAssociationsUpdateInput): Promise<void> {
    if (
      profileImage === undefined &&
      systemRole === undefined &&
      hasDefinedValues(input)
    ) {
      await this.update(input);
    } else {
      await this.sequelize.transaction(async transaction => {
        const updates: Promise<unknown>[] = [];

        if (hasDefinedValues(input)) {
          updates.push(this.update(input, { transaction }));
        }

        if (profileImage !== undefined) {
          updates.push(
            this.updateProfileImage({ profileImage }, { transaction })
          );
        }

        if (systemRole !== undefined) {
          updates.push(this.updateSystemRole({ systemRole }, { transaction }));
        }

        await Promise.all(updates);
      });
    }
  }

  async updateWithPassword({ newPassword }: ResetPasswordInput): Promise<User> {
    const { passwordHash, salt } = await generatePasswordHashWithSalt(newPassword);
    const user = await this.update({
      passwordHash,
      salt
    });

    return user;
  }

  static async withPasswordFindByPk(
    id: number
  ): Promise<(User & WithPassword) | null> {
    const user = await User.scope("withPassword").findByPk(id);
    if (!user) return null;
    if (!user.systemRole) {
      throw new UnreachableError();
    }
    if (!user.systemRole.systemPermissions) {
      // TODO: this check should be in the SystemRole class
      throw new UnreachableError();
    }

    return user as User & WithPassword;
  }

  static async withProfileImageFindByPk(
    id: number,
    { orgId }: { orgId?: number } = {}
  ): Promise<User | null> {
    return User.findOne({
      where: {
        id,
        ...(orgId ? { orgId } : {})
      },
      include: [{ model: Image }, { model: SystemRole }, { model: UserLotRole }]
    });
  }

  static async withProfileImageFindAll({
    orgId
  }: {
    orgId?: number;
  } = {}): Promise<User[]> {
    const users = await User.findAll({
      where: {
        ...(orgId ? { orgId } : {})
      },
      include: [{ model: Image }]
    });

    return users;
  }

  static fromPostDtoToInput(dto: UsersPostDtoWithPass): UserRegisterInput {
    const {
      dateOfBirth,
      title,
      systemRole,
      surName,
      firstName,
      secondaryEmail,
      profileImage,
      primaryEmail,
      mobilePhone,
      homePhone,
      fax,
      company,
      abn,
      tfn,
      orgId,
      password,
      role,
      lotsIds,
      primaryAddress,
      postalAddress,
      ...rest
    } = dto;
    mustBeEmptyObject(rest);

    return {
      abn,
      tfn,
      firstName,
      surName,
      systemRole,
      title,
      dateOfBirth,
      secondaryEmail,
      profileImage,
      primaryEmail,
      mobilePhone,
      homePhone,
      fax,
      company,
      orgId,
      password,
      primaryAddress,
      postalAddress
    };
  }

  static fromPutDtoToInput(dto: UsersPutDto): UserWithAssociationsUpdateInput {
    const {
      abn,
      tfn,
      company,
      dateOfBirth,
      fax,
      firstName,
      homePhone,
      mobilePhone,
      primaryEmail,
      profileImage,
      secondaryEmail,
      surName,
      systemRole,
      title,
      primaryAddress,
      postalAddress,
      orgId,
      ...rest
    } = dto;
    mustBeEmptyObject(rest);

    return {
      abn,
      tfn,
      company,
      dateOfBirth,
      fax,
      firstName,
      homePhone,
      mobilePhone,
      primaryEmail,
      profileImage,
      secondaryEmail,
      surName,
      systemRole,
      title,
      primaryAddress,
      postalAddress,
      orgId,
    };
  }

  private static toBaseDto(
    user: User
  ): GetExplicitUndefinedType<Omit<UsersResponseDto, "password">> {
    let lotsIds: number[] = [];

    if (user.userLotRoles) {
      lotsIds = user.userLotRoles.map(lotRole => lotRole.lotId);
    }
    return {
      lotsIds,
      role: user.systemRole?.name, //'STANDARD_USER',
      dateOfBirth: user.dateOfBirth,
      firstName: user.firstName,
      id: user.id,
      surName: user.surName,
      title: user.title,
      abn: user.abn,
      tfn: user.tfn,
      company: user.company,
      fax: user.fax,
      homePhone: user.homePhone,
      mobilePhone: user.mobilePhone,
      orgId: user.orgId,
      primaryEmail: user.primaryEmail,
      secondaryEmail: user.secondaryEmail,
      profileImage: user.profileImage?.imageUrl,
      primaryAddress: user.primaryAddress,
      postalAddress: user.postalAddress
    };
  }

  static toDto(
    user: User
  ): GetExplicitUndefinedType<Omit<UsersResponseDto, "password">> {
    return User.toBaseDto(user);
  }

  static toPostDto(
    password: string,
    user: User
  ): GetExplicitUndefinedType<UsersPostResponseDto> {
    return {
      password,
      ...User.toBaseDto(user)
    };
  }
}

export type WithPassword = { systemRole: SystemRole & WithPermissions };
