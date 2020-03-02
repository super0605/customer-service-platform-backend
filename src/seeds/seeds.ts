import { comparePasswordWithHash, generatePasswordHash } from "src/auth";
import env from "src/env";
import {
  Role,
  SystemPermission,
  SystemRole,
  TicketStatus,
  User
} from "src/models";
import { SeedError } from "./errors";
import Seed from "./seed";
import {
  EnforceLessThanString,
  GetSeedNameType,
  getSeeds,
  GetSeedSystemPermissionNameType,
  GetSeedSystemRoleNamesType,
  GetSeedSystemRoleNameType,
  HasExtra
} from "./type-magic";

function seedTicketStatus<K extends string>(
  name: K
): Omit<Seed, "name"> & { ticketStatusName: K } {
  return {
    ticketStatusName: name,
    async test() {
      const res = await TicketStatus.findOne({ where: { status: name } });
      if (res == null) return "apply";
      else return "skip";
    },
    async apply() {
      await TicketStatus.create({
        status: name
      });
    }
  };
}

function seedRole<K extends string>(
  name: K
): Omit<Seed, "name"> & { roleName: K } {
  return {
    roleName: name,
    async test() {
      const res = await Role.findOne({ where: { roleName: name } });
      if (res == null) return "apply";
      else return "skip";
    },
    async apply() {
      await Role.create({
        roleName: name
      });
    }
  };
}

function seedSystemRole<K extends string>(
  name: K
): Omit<Seed, "name"> & { systemRoleName: K } {
  return {
    systemRoleName: name,
    async test() {
      const res = await SystemRole.findOne({ where: { name: name } });
      if (res == null) return "apply";
      else return "skip";
    },
    async apply() {
      await SystemRole.create({
        name: name
      });
    }
  };
}

function seedSystemPermission<K extends string, P extends string>(
  name: P,
  description: string,
  roleNames: K[]
): Omit<Seed, "name"> & { systemPermissionName: P; systemRoleNames: K[] } {
  return {
    systemPermissionName: name,
    systemRoleNames: roleNames,
    async test() {
      const res = await SystemPermission.findOne({
        where: { shortName: name }
      });
      if (res == null) return "apply";
      else return "skip";
    },
    async apply() {
      const systemPermission = await SystemPermission.create({
        shortName: name,
        description: description
      });

      for (const roleName of roleNames) {
        const [role] = await SystemRole.findCreateFind({
          where: { name: roleName },
          defaults: { name: roleName }
        });
        await role.$add("systemPermissions", systemPermission);
      }
    }
  };
}

const seeds = getSeeds([
  {
    name: "system_roles SUPERADMIN",
    ...seedSystemRole("SUPERADMIN")
  },
  {
    name: "users SUPERADMIN",
    async test() {
      const res = await User.findOne({
        include: [
          {
            model: SystemRole,
            where: {
              name: "SUPERADMIN"
            }
          }
        ]
      });
      if (res == null) return "apply";
      else return "skip";
    },
    async apply() {
      await User.createWithAssociations({
        systemRole: "SUPERADMIN",
        password: env.SUPERADMIN_PASSWORD,
        firstName: "SUPERADMIN",
        title: "SUPERADMIN",
        surName: "SUPERADMIN",
        primaryEmail: "clinton@betterlabs.io",
        dateOfBirth: new Date(),
        abn: undefined,
        tfn: undefined,
        company: undefined,
        fax: undefined,
        homePhone: undefined,
        mobilePhone: undefined,
        orgId: undefined,
        profileImage: undefined,
        secondaryEmail: undefined,
        primaryAddress: undefined,
        postalAddress: undefined
      });
    }
  },
  {
    name: "users SUPERADMIN change password",
    async test() {
      const superAdmin = await User.scope("withPassword").findOne({
        include: [
          {
            model: SystemRole,
            where: {
              name: "SUPERADMIN"
            }
          }
        ]
      });
      if (!superAdmin) {
        throw new SeedError("users SUPERADMIN");
      }

      const correct = await comparePasswordWithHash(
        superAdmin.salt,
        superAdmin.passwordHash,
        env.SUPERADMIN_PASSWORD
      );
      if (!correct) return "apply";
      else return "skip";
    },
    async apply() {
      const superAdmin = await User.scope("withPassword").findOne({
        include: [
          {
            model: SystemRole,
            where: {
              name: "SUPERADMIN"
            }
          }
        ]
      });
      if (!superAdmin) {
        throw new SeedError("users SUPERADMIN");
      }

      const passwordHash = await generatePasswordHash(
        superAdmin.salt,
        env.SUPERADMIN_PASSWORD
      );
      superAdmin.passwordHash = passwordHash;
      await superAdmin.save();
    }
  },
  {
    name: "system_roles MANAGER_ADMIN",
    ...seedSystemRole("MANAGER_ADMIN")
  },
  {
    name: "system_roles MANAGER",
    ...seedSystemRole("MANAGER")
  },
  {
    name: "system_roles NOT_ACTIVE",
    ...seedSystemRole("NOT_ACTIVE")
  },
  {
    name: "system_roles STANDARD",
    ...seedSystemRole("STANDARD_USER")
  },
  {
    name: "system_permissions CREATE_MANAGER_ADMIN",
    ...seedSystemPermission(
      "CREATE_MANAGER_ADMIN",
      "permission to create manager admins",
      ["SUPERADMIN"]
    )
  },
  {
    name: "system_permissions CREATE_MANAGER_ADMIN_OF_RELATED_ORG",
    ...seedSystemPermission(
      "CREATE_MANAGER_ADMIN_OF_RELATED_ORG",
      "permission to create manager admins of related org",
      ["SUPERADMIN", "MANAGER_ADMIN"]
    )
  },
  {
    name: "system_permissions CREATE_MANAGER",
    ...seedSystemPermission("CREATE_MANAGER", "permission to create managers", [
      "SUPERADMIN"
    ])
  },
  {
    name: "system_permissions CREATE_MANAGER_OF_RELATED_ORG",
    ...seedSystemPermission(
      "CREATE_MANAGER_OF_RELATED_ORG",
      "permission to create managers of related org",
      ["SUPERADMIN", "MANAGER_ADMIN"]
    )
  },
  {
    name: "system_permissions CREATE_STANDARD_USER",
    ...seedSystemPermission(
      "CREATE_STANDARD_USER",
      "permission to create standard users",
      ["SUPERADMIN"]
    )
  },
  {
    name: "system_permissions CREATE_STANDARD_USER_OF_RELATED_ORG",
    ...seedSystemPermission(
      "CREATE_STANDARD_USER_OF_RELATED_ORG",
      "permission to create standard users of related org",
      ["SUPERADMIN", "MANAGER_ADMIN", "MANAGER"]
    )
  },
  {
    name: "system_permissions CREATE_ORG",
    ...seedSystemPermission("CREATE_ORG", "permission to create orgs", [
      "SUPERADMIN",
      "MANAGER_ADMIN"
    ])
  },
  {
    name: "system_permissions READ_USERS",
    ...seedSystemPermission("READ_USERS", "permission to read other users", [
      "SUPERADMIN"
    ])
  },
  {
    name: "system_permissions READ_USERS_OF_RELATED_ORG",
    ...seedSystemPermission(
      "READ_USERS_OF_RELATED_ORG",
      "permission to read other users of related org",
      ["SUPERADMIN", "MANAGER_ADMIN", "MANAGER"]
    )
  },
  {
    name: "system_permissions READ_USER",
    ...seedSystemPermission("READ_USER", "permission to read current user", [
      "SUPERADMIN",
      "MANAGER_ADMIN",
      "MANAGER"
    ])
  },
  {
    name: "system_permissions READ_ORGS",
    ...seedSystemPermission("READ_ORGS", "permission to read other orgs", [
      "SUPERADMIN"
    ])
  },
  {
    name: "system_permissions READ_ORG",
    ...seedSystemPermission("READ_ORG", "permission to read current org", [
      "SUPERADMIN",
      "MANAGER_ADMIN",
      "MANAGER"
    ])
  },
  // #region UPDATE_NOT_ACTIVE
  {
    name: "system_permissions UPDATE_NOT_ACTIVE",
    ...seedSystemPermission(
      "UPDATE_NOT_ACTIVE",
      "permission to update current not active personal details",
      ["SUPERADMIN", "MANAGER_ADMIN", "MANAGER"]
    )
  },
  {
    name: "system_permissions UPDATE_NOT_ACTIVE_SYSTEM_ROLE",
    ...seedSystemPermission(
      "UPDATE_NOT_ACTIVE_SYSTEM_ROLE",
      "permission to update current not active system role",
      ["SUPERADMIN", "MANAGER_ADMIN"]
    )
  },
  // #endregion
  // #region UPDATE_NOT_ACTIVES
  {
    name: "system_permissions UPDATE_NOT_ACTIVES",
    ...seedSystemPermission(
      "UPDATE_NOT_ACTIVES",
      "permission to update other not actives personal details",
      []
    )
  },
  {
    name: "system_permissions UPDATE_NOT_ACTIVES_OF_RELATED_ORG",
    ...seedSystemPermission(
      "UPDATE_NOT_ACTIVES_OF_RELATED_ORG",
      "permission to update other not actives of related org personal details",
      []
    )
  },
  {
    name: "system_permissions UPDATE_NOT_ACTIVES_SYSTEM_ROLE",
    ...seedSystemPermission(
      "UPDATE_NOT_ACTIVES_SYSTEM_ROLE",
      "permission to update other not actives system role",
      ["SUPERADMIN"]
    )
  },
  {
    name: "system_permissions UPDATE_NOT_ACTIVES_OF_RELATED_ORG_SYSTEM_ROLE",
    ...seedSystemPermission(
      "UPDATE_NOT_ACTIVES_OF_RELATED_ORG_SYSTEM_ROLE",
      "permission to update other not actives of related org system role",
      ["SUPERADMIN", "MANAGER_ADMIN"]
    )
  },
  // #endregion
  // #region UPDATE_MANAGER
  {
    name: "system_permissions UPDATE_MANAGER",
    ...seedSystemPermission(
      "UPDATE_MANAGER",
      "permission to update current manager personal details",
      ["SUPERADMIN", "MANAGER_ADMIN", "MANAGER"]
    )
  },
  {
    name: "system_permissions UPDATE_MANAGER_SYSTEM_ROLE",
    ...seedSystemPermission(
      "UPDATE_MANAGER_SYSTEM_ROLE",
      "permission to update current manager system role",
      ["SUPERADMIN", "MANAGER_ADMIN"]
    )
  },
  // #endregion
  // #region UPDATE_MANAGERS
  {
    name: "system_permissions UPDATE_MANAGERS",
    ...seedSystemPermission(
      "UPDATE_MANAGERS",
      "permission to update other managers personal details",
      []
    )
  },
  {
    name: "system_permissions UPDATE_MANAGERS_OF_RELATED_ORG",
    ...seedSystemPermission(
      "UPDATE_MANAGERS_OF_RELATED_ORG",
      "permission to update other managers of related org personal details",
      []
    )
  },
  {
    name: "system_permissions UPDATE_MANAGERS_SYSTEM_ROLE",
    ...seedSystemPermission(
      "UPDATE_MANAGERS_SYSTEM_ROLE",
      "permission to update other managers system role",
      ["SUPERADMIN"]
    )
  },
  {
    name: "system_permissions UPDATE_MANAGERS_OF_RELATED_ORG_SYSTEM_ROLE",
    ...seedSystemPermission(
      "UPDATE_MANAGERS_OF_RELATED_ORG_SYSTEM_ROLE",
      "permission to update other managers of related org system role",
      ["SUPERADMIN", "MANAGER_ADMIN"]
    )
  },
  // #endregion
  // #region UPDATE_MANAGER_ADMIN
  {
    name: "system_permissions UPDATE_MANAGER_ADMIN",
    ...seedSystemPermission(
      "UPDATE_MANAGER_ADMIN",
      "permission to update current manager admin personal details",
      ["SUPERADMIN", "MANAGER_ADMIN"]
    )
  },
  {
    name: "system_permissions UPDATE_MANAGER_ADMIN_SYSTEM_ROLE",
    ...seedSystemPermission(
      "UPDATE_MANAGER_ADMIN_SYSTEM_ROLE",
      "permission to update current manager admin system role",
      ["SUPERADMIN", "MANAGER_ADMIN"]
    )
  },
  // #endregion
  // #region UPDATE_MANAGER_ADMINS
  {
    name: "system_permissions UPDATE_MANAGER_ADMINS",
    ...seedSystemPermission(
      "UPDATE_MANAGER_ADMINS",
      "permission to update other manager admins personal details",
      []
    )
  },
  {
    name: "system_permissions UPDATE_MANAGER_ADMINS_OF_RELATED_ORG",
    ...seedSystemPermission(
      "UPDATE_MANAGER_ADMINS_OF_RELATED_ORG",
      "permission to update other manager admins of related org personal details",
      []
    )
  },
  {
    name: "system_permissions UPDATE_MANAGER_ADMINS_SYSTEM_ROLE",
    ...seedSystemPermission(
      "UPDATE_MANAGER_ADMINS_SYSTEM_ROLE",
      "permission to update other manager admins system role",
      ["SUPERADMIN"]
    )
  },
  {
    name: "system_permissions UPDATE_MANAGER_ADMINS_OF_RELATED_ORG_SYSTEM_ROLE",
    ...seedSystemPermission(
      "UPDATE_MANAGER_ADMINS_OF_RELATED_ORG_SYSTEM_ROLE",
      "permission to update other manager admins of related org system role",
      ["SUPERADMIN", "MANAGER_ADMIN"]
    )
  },
  // #endregion
  // #region UPDATE_MANAGER_ADMIN
  {
    name: "system_permissions UPDATE_MANAGER_ADMIN",
    ...seedSystemPermission(
      "UPDATE_MANAGER_ADMIN",
      "permission to update current manager admin personal details",
      ["SUPERADMIN", "MANAGER_ADMIN"]
    )
  },
  {
    name: "system_permissions UPDATE_MANAGER_ADMIN_SYSTEM_ROLE",
    ...seedSystemPermission(
      "UPDATE_MANAGER_ADMIN_SYSTEM_ROLE",
      "permission to update current manager admin system role",
      ["SUPERADMIN", "MANAGER_ADMIN"]
    )
  },
  // #endregion
  // #region UPDATE_STANDARD_USER
  {
    name: "system_permissions UPDATE_STANDARD_USER",
    ...seedSystemPermission(
      "UPDATE_STANDARD_USER",
      "permission to update current standard user personal details",
      ["SUPERADMIN", "MANAGER_ADMIN", "MANAGER"]
    )
  },
  {
    name: "system_permissions UPDATE_STANDARD_USER_SYSTEM_ROLE",
    ...seedSystemPermission(
      "UPDATE_STANDARD_USER_SYSTEM_ROLE",
      "permission to update current standard user system role",
      ["SUPERADMIN", "MANAGER_ADMIN"]
    )
  },
  // #endregion
  // #region UPDATE_STANDARD_USERS
  {
    name: "system_permissions UPDATE_STANDARD_USERS",
    ...seedSystemPermission(
      "UPDATE_STANDARD_USERS",
      "permission to update other standard users personal details",
      ["SUPERADMIN"]
    )
  },
  {
    name: "system_permissions UPDATE_STANDARD_USERS_OF_RELATED_ORG",
    ...seedSystemPermission(
      "UPDATE_STANDARD_USERS_OF_RELATED_ORG",
      "permission to update other standard users personal details of related org",
      ["SUPERADMIN", "MANAGER_ADMIN", "MANAGER"]
    )
  },
  {
    name: "system_permissions UPDATE_STANDARD_USERS_SYSTEM_ROLE",
    ...seedSystemPermission(
      "UPDATE_STANDARD_USERS_SYSTEM_ROLE",
      "permission to update other standard users system role",
      ["SUPERADMIN"]
    )
  },
  {
    name: "system_permissions UPDATE_STANDARD_USERS_OF_RELATED_ORG_SYSTEM_ROLE",
    ...seedSystemPermission(
      "UPDATE_STANDARD_USERS_OF_RELATED_ORG_SYSTEM_ROLE",
      "permission to update other standard users of related org system role",
      ["SUPERADMIN", "MANAGER_ADMIN"]
    )
  },
  // #endregion
  {
    name: "system_permissions UPDATE_ORG",
    ...seedSystemPermission("UPDATE_ORG", "permission to update current org", [
      "SUPERADMIN",
      "MANAGER_ADMIN"
    ])
  },
  {
    name: "system_permissions UPDATE_ORGS",
    ...seedSystemPermission("UPDATE_ORGS", "permission to update other orgs", [
      "SUPERADMIN"
    ])
  },
  // #region COMPLEXES
  {
    name: "system_permissions READ_COMPLEXES",
    ...seedSystemPermission("READ_COMPLEXES", "permission to read complexes", [
      "SUPERADMIN"
    ])
  },
  {
    name: "system_permissions READ_COMPLEXES_OF_RELATED_ORG",
    ...seedSystemPermission(
      "READ_COMPLEXES_OF_RELATED_ORG",
      "permission to read complexes of related org",
      ["SUPERADMIN", "MANAGER_ADMIN", "MANAGER"]
    )
  },
  {
    name: "system_permissions CREATE_COMPLEX",
    ...seedSystemPermission("CREATE_COMPLEX", "permission to create complex", [
      "SUPERADMIN"
    ])
  },
  {
    name: "system_permissions CREATE_COMPLEX_OF_RELATED_ORG",
    ...seedSystemPermission(
      "CREATE_COMPLEX_OF_RELATED_ORG",
      "permission to create complex of related org",
      ["SUPERADMIN", "MANAGER_ADMIN", "MANAGER"]
    )
  },
  {
    name: "system_permissions UPDATE_COMPLEXES",
    ...seedSystemPermission(
      "UPDATE_COMPLEXES",
      "permission to update complexes",
      ["SUPERADMIN"]
    )
  },
  {
    name: "system_permissions UPDATE_COMPLEXES_OF_RELATED_ORG",
    ...seedSystemPermission(
      "UPDATE_COMPLEXES_OF_RELATED_ORG",
      "permission to update complexes of related org",
      ["SUPERADMIN", "MANAGER_ADMIN", "MANAGER"]
    )
  },
  // #endregion
  // #region LOTS
  {
    name: "system_permissions READ_LOTS",
    ...seedSystemPermission("READ_LOTS", "permission to read lots", [
      "SUPERADMIN"
    ])
  },
  {
    name: "system_permissions READ_LOTS_OF_RELATED_ORG",
    ...seedSystemPermission(
      "READ_LOTS_OF_RELATED_ORG",
      "permission to read lots of related org",
      ["SUPERADMIN", "MANAGER_ADMIN", "MANAGER"]
    )
  },
  {
    name: "system_permissions CREATE_LOT",
    ...seedSystemPermission("CREATE_LOT", "permission to create lot", [
      "SUPERADMIN"
    ])
  },
  {
    name: "system_permissions CREATE_LOT_OF_RELATED_ORG",
    ...seedSystemPermission(
      "CREATE_LOT_OF_RELATED_ORG",
      "permission to create lot of related org",
      ["SUPERADMIN", "MANAGER_ADMIN", "MANAGER"]
    )
  },
  {
    name: "system_permissions UPDATE_LOTS",
    ...seedSystemPermission("UPDATE_LOTS", "permission to update lots", [
      "SUPERADMIN"
    ])
  },
  {
    name: "system_permissions UPDATE_LOTS_OF_RELATED_ORG",
    ...seedSystemPermission(
      "UPDATE_LOTS_OF_RELATED_ORG",
      "permission to update lots of related org",
      ["SUPERADMIN", "MANAGER_ADMIN", "MANAGER"]
    )
  },
  // #endregion
  // #region roles
  {
    name: "roles COUNCIL_MEMBER_OF_LOT_OWNER",
    ...seedRole("CM_OF_LOT_OWNER")
  },
  {
    name: "roles COUNCIL_MEMBER_OF_LOT_OWNER_COO",
    ...seedRole("CM_OF_LOT_OWNER_COO")
  },
  {
    name: "roles COUNCIL_MEMBER_OF_PROPERTY_MANAGER",
    ...seedRole("CM_OF_PROPERTY_MANAGER")
  },
  {
    name: "roles COUNCIL_MEMBER_OF_PROPERTY_MANAGER_COO",
    ...seedRole("CM_OF_PROPERTY_MANAGER_COO")
  },
  {
    name: "roles COUNCIL_MEMBER_OF_TENANT",
    ...seedRole("CM_OF_TENANT")
  },
  {
    name: "roles LOT_OWNER",
    ...seedRole("LOT_OWNER")
  },
  {
    name: "roles LOT_OWNER_COO",
    ...seedRole("LOT_OWNER_COO")
  },
  {
    name: "roles PROPERTY_MANAGER",
    ...seedRole("PROPERTY_MANAGER")
  },
  {
    name: "roles PROPERTY_MANAGER_COO",
    ...seedRole("PROPERTY_MANAGER_COO")
  },
  {
    name: "roles TENANT",
    ...seedRole("TENANT")
  },
  // #endregion
  // #region ticket status
  {
    name: "ticket_statuses OPEN",
    ...seedTicketStatus("OPEN")
  },
  {
    name: "ticket_statuses CLOSED",
    ...seedTicketStatus("CLOSED")
  },
  // #endregion
  // #region TICKETS
  {
    name: "system_permissions READ_TICKETS",
    ...seedSystemPermission("READ_TICKETS", "permission to read tickets", [
      "SUPERADMIN"
    ])
  },
  {
    name: "system_permissions READ_TICKETS_OF_RELATED_ORG",
    ...seedSystemPermission(
      "READ_TICKETS_OF_RELATED_ORG",
      "permission to read tickets of related org",
      ["SUPERADMIN", "MANAGER_ADMIN", "MANAGER"]
    )
  },
  {
    name: "system_permissions READ_TICKETS_ISSUED",
    ...seedSystemPermission(
      "READ_TICKETS_ISSUED",
      "permission to read issued tickets",
      ["SUPERADMIN", "MANAGER_ADMIN", "MANAGER", "STANDARD_USER"]
    )
  },
  {
    name: "system_permissions CREATE_TICKET",
    ...seedSystemPermission("CREATE_TICKET", "permission to create tickets", [
      "SUPERADMIN"
    ])
  },
  {
    name: "system_permissions CREATE_TICKET_OF_RELATED_ORG",
    ...seedSystemPermission(
      "CREATE_TICKET_OF_RELATED_ORG",
      "permission to create tickets of related org",
      ["SUPERADMIN", "MANAGER_ADMIN", "MANAGER"]
    )
  },
  {
    name: "system_permissions CREATE_TICKET_OF_RELATED_LOT",
    ...seedSystemPermission(
      "CREATE_TICKET_OF_RELATED_LOT",
      "permission to create tickets of related lot",
      ["SUPERADMIN", "MANAGER_ADMIN", "MANAGER", "STANDARD_USER"]
    )
  },
  {
    name: "system_permissions UPDATE_TICKETS",
    ...seedSystemPermission("UPDATE_TICKETS", "permission to update tickets", [
      "SUPERADMIN"
    ])
  },
  {
    name: "system_permissions UPDATE_TICKETS_OF_RELATED_ORG",
    ...seedSystemPermission(
      "UPDATE_TICKETS_OF_RELATED_ORG",
      "permission to update tickets of related org",
      ["SUPERADMIN", "MANAGER_ADMIN", "MANAGER", "STANDARD_USER"]
    )
  },
  // #endregion
  // #region TICKET_COMMENTS
  {
    name: "system_permissions READ_TICKET_COMMENTS",
    ...seedSystemPermission(
      "READ_TICKET_COMMENTS",
      "permission to read ticket comments",
      ["SUPERADMIN"]
    )
  },
  {
    name: "system_permissions READ_TICKET_COMMENTS_OF_RELATED_ORG",
    ...seedSystemPermission(
      "READ_TICKET_COMMENTS_OF_RELATED_ORG",
      "permission to read ticket comments of related org",
      ["SUPERADMIN", "MANAGER_ADMIN", "MANAGER"]
    )
  },
  {
    name: "system_permissions READ_TICKET_COMMENTS_ISSUED",
    ...seedSystemPermission(
      "READ_TICKET_COMMENTS_ISSUED",
      "permission to read ticket comments of issued ticket",
      ["SUPERADMIN", "MANAGER_ADMIN", "MANAGER", "STANDARD_USER"]
    )
  },
  {
    name: "system_permissions CREATE_TICKET_COMMENT",
    ...seedSystemPermission(
      "CREATE_TICKET_COMMENT",
      "permission to create ticket comments",
      ["SUPERADMIN"]
    )
  },
  {
    name: "system_permissions CREATE_TICKET_COMMENT_OF_RELATED_ORG",
    ...seedSystemPermission(
      "CREATE_TICKET_COMMENT_OF_RELATED_ORG",
      "permission to create ticket comments of related org",
      ["SUPERADMIN", "MANAGER_ADMIN", "MANAGER"]
    )
  },
  {
    name: "system_permissions CREATE_TICKET_COMMENT_ISSUED",
    ...seedSystemPermission(
      "CREATE_TICKET_COMMENT_ISSUED",
      "permission to create ticket comments of issued tickets",
      ["SUPERADMIN", "MANAGER_ADMIN", "MANAGER", "STANDARD_USER"]
    )
  },
  {
    name: "system_permissions UPDATE_TICKET_COMMENTS",
    ...seedSystemPermission(
      "UPDATE_TICKET_COMMENTS",
      "permission to update ticket comments",
      ["SUPERADMIN"]
    )
  },
  {
    name: "system_permissions UPDATE_TICKET_COMMENTS_CREATED",
    ...seedSystemPermission(
      "UPDATE_TICKET_COMMENTS_CREATED",
      "permission to update created ticket comments",
      ["SUPERADMIN", "MANAGER_ADMIN", "MANAGER", "STANDARD_USER"]
    )
  },
  // #endregion
  {
    name: "system_permissions CREATE_UPLOAD",
    ...seedSystemPermission("CREATE_UPLOAD", "permission to upload files", [
      "SUPERADMIN",
      "MANAGER_ADMIN",
      "MANAGER",
      "STANDARD_USER"
    ])
  }
] as const);

export type SeedName = EnforceLessThanString<GetSeedNameType<typeof seeds>>;

type SeedSystemRoleName = EnforceLessThanString<
  GetSeedSystemRoleNameType<typeof seeds>
>;

type SeedSystemRoleNames = EnforceLessThanString<
  GetSeedSystemRoleNamesType<typeof seeds>[number]
>;

type HasExtraRoles = HasExtra<SeedSystemRoleNames, SeedSystemRoleName>;

/**
 * Dummy value to enforce compile-time check of proper type construction.
 */
export const hasExtraRoles: HasExtraRoles = false;

export type SystemRoleName = SeedSystemRoleName | SeedSystemRoleNames;
export type SystemPermissionName = EnforceLessThanString<
  GetSeedSystemPermissionNameType<typeof seeds>
>;

export default seeds;
