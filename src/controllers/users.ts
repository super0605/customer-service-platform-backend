import sgMail = require("@sendgrid/mail");
import env from "src/env";

import {
  AuthNoPermissionError,
  AuthSuperAdminIsUntouchableError,
  mkSecurityManager
} from "src/auth";
import {
  ErrorEntityNotFoundDto,
  UsersGetSingleValidationQueryErrorDto,
  UsersGetValidationQueryErrorDto,
  UsersPostDtoWithPass,
  UsersPostResponseDto,
  UsersPostValidationBodyErrorDto,
  UsersPutDto,
  UsersPutValidationBodyErrorDto,
  UsersResponseDto
} from "src/dtos";
import { unreachable } from "src/errors";
import { provideController } from "src/ioc";
import { AuthorizedRequest } from "src/middlewares/auth";
import { User } from "src/models";
import { ModelEntityNotFoundError } from "src/models/errors";
import { SystemPermissionName } from "src/models/system-permission";
import { hasDefinedValues } from "src/utils";
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Request,
  Response,
  Route,
  Security,
  SuccessResponse
} from "tsoa";

// must not use default export due to how tsoa generates routes
@Route("users")
// eslint-disable-next-line @typescript-eslint/no-use-before-define
@provideController(UsersController)
export class UsersController extends Controller {
  /**
   * @isInt orgId invalid integer number
   * @minimum orgId 1
   */
  @Security("AuthorizationHeaderBearer")
  @Get()
  @Response<UsersGetValidationQueryErrorDto>(
    400,
    "Failed Request Query Validation",
    {
      name: "ValidationError",
      type: "query",
      message: "Failed request query parameters validation",
      fields: {
        orgId: {
          rules: [
            {
              message: "invalid integer number",
              name: "isInteger"
            }
          ],
          value: "asdf"
        }
      }
    }
  )
  public async getUsers(
    @Request() request: AuthorizedRequest,
    @Query() orgId?: number,
    @Query() withProfileImage = true
  ): Promise<UsersResponseDto[]> {
    const securityManager = mkSecurityManager(request);
    securityManager.ensureAtLeastOne([
      "READ_USERS",
      "READ_USERS_OF_RELATED_ORG"
    ]);

    const relatedOrgId = request.user.orgId;
    const accessAll = securityManager.hasPermission("READ_USERS");

    if (accessAll) {
      if (orgId) {
        if (withProfileImage) {
          return (await User.withProfileImageFindAll({ orgId })).map(u =>
            User.toDto(u)
          );
        } else {
          return (await User.findAll({ where: { orgId: orgId } })).map(u =>
            User.toDto(u)
          );
        }
      } else {
        if (withProfileImage) {
          return (await User.withProfileImageFindAll()).map(u => User.toDto(u));
        } else {
          return (await User.findAll()).map(u => User.toDto(u));
        }
      }
    } else {
      if (orgId) {
        if (orgId !== relatedOrgId) {
          throw new AuthNoPermissionError("READ_USERS");
        }

        if (withProfileImage) {
          return (await User.withProfileImageFindAll({ orgId })).map(u =>
            User.toDto(u)
          );
        } else {
          return (await User.findAll({ where: { orgId: orgId } })).map(u =>
            User.toDto(u)
          );
        }
      } else {
        if (relatedOrgId) {
          if (withProfileImage) {
            return (
              await User.withProfileImageFindAll({ orgId: relatedOrgId })
            ).map(u => User.toDto(u));
          } else {
            return (
              await User.findAll({ where: { orgId: relatedOrgId } })
            ).map(u => User.toDto(u));
          }
        } else {
          return [];
        }
      }
    }
  }

  /**
   * @isInt id invalid integer number
   * @minimum id 1
   */
  @Security("AuthorizationHeaderBearer")
  @Get("{id}")
  @Response<ErrorEntityNotFoundDto>(404, "Requested user is not found", {
    name: "ModelEntityNotFoundError",
    message: "Entity '123123' of type 'User' is not found.",
    id: 123123,
    modelName: "User"
  })
  @Response<UsersGetSingleValidationQueryErrorDto>(
    400,
    "Failed Request Query Validation",
    {
      name: "ValidationError",
      type: "query",
      message: "Failed request query parameters validation",
      fields: {
        withProfileImage: {
          rules: [
            {
              message: "invalid boolean",
              name: "isBoolean"
            }
          ],
          value: "asdf"
        }
      }
    }
  )
  public async getUser(
    @Request() request: AuthorizedRequest,
    @Query() withProfileImage = true,
    id: number
  ): Promise<UsersResponseDto> {
    const securityManager = mkSecurityManager(request);
    securityManager.ensureAtLeastOne([
      "READ_USER",
      "READ_USERS",
      "READ_USERS_OF_RELATED_ORG"
    ]);

    const selfAccess = request.user.id === id;
    const relatedOrgId = request.user.orgId;
    const accessAll = securityManager.hasPermission("READ_USERS");
    const accessRelatedOrg = securityManager.hasPermission(
      "READ_USERS_OF_RELATED_ORG"
    );

    if (accessAll) {
      if (withProfileImage) {
        const user = await User.withProfileImageFindByPk(id);
        if (!user) {
          throw new ModelEntityNotFoundError("User", id);
        }
        return User.toDto(user);
      } else {
        const user = await User.findByPk(id);
        if (!user) {
          throw new ModelEntityNotFoundError("User", id);
        }
        return User.toDto(user);
      }
    } else {
      if (selfAccess) {
        if (withProfileImage) {
          const user = await User.withProfileImageFindByPk(id);
          if (!user) {
            throw new ModelEntityNotFoundError("User", id);
          }
          return User.toDto(user);
        } else {
          const user = await User.findByPk(id);
          if (!user) {
            throw new ModelEntityNotFoundError("User", id);
          }
          return User.toDto(user);
        }
      } else {
        if (accessRelatedOrg) {
          if (relatedOrgId) {
            if (withProfileImage) {
              const user = await User.withProfileImageFindByPk(id, {
                orgId: relatedOrgId
              });
              if (!user) {
                throw new ModelEntityNotFoundError("User", id);
              }
              return User.toDto(user);
            } else {
              const user = await User.findOne({
                where: { id: id, orgId: relatedOrgId }
              });
              if (!user) {
                throw new ModelEntityNotFoundError("User", id);
              }
              return User.toDto(user);
            }
          } else {
            throw new ModelEntityNotFoundError("User", id);
          }
        } else {
          throw new AuthNoPermissionError("READ_USERS");
        }
      }
    }
  }

  @Security("AuthorizationHeaderBearer")
  @Post()
  @SuccessResponse(201)
  @Response<UsersPostValidationBodyErrorDto>(
    400,
    "Failed Request Body Validation",
    {
      name: "ValidationError",
      type: "body",
      message: "Failed request body validation",
      fields: {
        loginMustBePresent: {
          value: null,
          rules: [
            {
              name: "other",
              message:
                "One of [primaryEmail, homePhone, mobilePhone] must be present."
            }
          ]
        },
        systemRole: {
          rules: [
            {
              message:
                "should be one of the following; ['MANAGER_ADMIN', 'MANAGER', 'STANDARD_USER']",
              name: "isEnum"
            }
          ],
          value: "MANAGER_ADMI11N"
        },
        orgId: {
          rules: [
            {
              name: "hasMin",
              min: 1,
              message: "min 1"
            }
          ],
          value: 0
        },
        firstName: {
          rules: [
            {
              message: "invalid string value",
              name: "isString"
            }
          ],
          value: 12
        },
        surName: {
          rules: [
            {
              name: "isRequired",
              message: "'surName' is required"
            }
          ]
        }
      }
    }
  )
  public async postUser(
    @Request() request: AuthorizedRequest,
    @Body() dto: UsersPostDtoWithPass
  ): Promise<UsersPostResponseDto> {
    const securityManager = mkSecurityManager(request);
    securityManager.ensureAtLeastOne([
      "CREATE_STANDARD_USER",
      "CREATE_STANDARD_USER_OF_RELATED_ORG",
      "CREATE_MANAGER",
      "CREATE_MANAGER_OF_RELATED_ORG",
      "CREATE_MANAGER_ADMIN",
      "CREATE_MANAGER_ADMIN_OF_RELATED_ORG"
    ]);

    const relatedOrgId = request.user.orgId;
    const ofRelatedOrg =
      relatedOrgId && (!dto.orgId || dto.orgId === relatedOrgId);

    switch (dto.systemRole) {
      case "MANAGER_ADMIN":
        if (ofRelatedOrg) {
          securityManager.ensurePermission(
            "CREATE_MANAGER_ADMIN_OF_RELATED_ORG"
          );
        } else {
          securityManager.ensurePermission("CREATE_MANAGER_ADMIN");
        }
        break;
      case "MANAGER":
        if (ofRelatedOrg) {
          securityManager.ensurePermission("CREATE_MANAGER_OF_RELATED_ORG");
        } else {
          securityManager.ensurePermission("CREATE_MANAGER");
        }
        break;
      case "STANDARD_USER":
        if (ofRelatedOrg) {
          securityManager.ensurePermission(
            "CREATE_STANDARD_USER_OF_RELATED_ORG"
          );
        } else {
          securityManager.ensurePermission("CREATE_STANDARD_USER");
        }
        break;
      default:
        unreachable(dto.systemRole);
    }

    const input = User.fromPostDtoToInput(dto);
    const { password, user } = await User.register(input);

    console.log(input.primaryEmail)

    sgMail.setApiKey(env.SENDGRID_API_KEY);
    if (input.primaryEmail) {
      sgMail.send({
        to: input.primaryEmail,
        from: 'hello@hello.town',
        templateId: env.WELCOME_EMAIL_TEMPLATE_ID,
        subject: 'Hello Account has been created',
        dynamicTemplateData: {password},
      }).then(() => {
        console.log("Sent email");
      }, err => {
        console.error(err);
      });
    }

    this.setStatus(201);

    return User.toPostDto(password, user);
  }

  /**
   * @isInt id invalid integer number
   * @minimum id 1
   */
  @Security("AuthorizationHeaderBearer")
  @Put("{id}")
  @SuccessResponse(204)
  @Response<UsersPutValidationBodyErrorDto>(
    400,
    "Failed Request Body Validation",
    {
      name: "ValidationError",
      type: "body",
      message: "Failed request body validation",
      fields: {
        systemRole: {
          rules: [
            {
              message:
                "should be one of the following; ['MANAGER_ADMIN', 'MANAGER', 'NOT_ACTIVE', 'STANDARD_USER']",
              name: "isEnum"
            }
          ],
          value: "MANAGER_ADMI11N"
        },
        firstName: {
          rules: [
            {
              message: "invalid string value",
              name: "isString"
            }
          ],
          value: 12
        }
      }
    }
  )
  @Response<ErrorEntityNotFoundDto>(404, "Requested user is not found", {
    name: "ModelEntityNotFoundError",
    message: "Entity '123123' of type 'User' is not found.",
    id: 123123,
    modelName: "User"
  })
  public async putUser(
    @Request() request: AuthorizedRequest,
    @Body() dto: UsersPutDto,
    id: number
  ): Promise<void> {
    const securityManager = mkSecurityManager(request);
    securityManager.ensureAtLeastOne([
      "UPDATE_NOT_ACTIVE",
      "UPDATE_NOT_ACTIVE_SYSTEM_ROLE",
      "UPDATE_NOT_ACTIVES",
      "UPDATE_NOT_ACTIVES_SYSTEM_ROLE",
      "UPDATE_NOT_ACTIVES_OF_RELATED_ORG",
      "UPDATE_NOT_ACTIVES_OF_RELATED_ORG_SYSTEM_ROLE",
      "UPDATE_STANDARD_USER",
      "UPDATE_STANDARD_USER_SYSTEM_ROLE",
      "UPDATE_STANDARD_USERS",
      "UPDATE_STANDARD_USERS_SYSTEM_ROLE",
      "UPDATE_STANDARD_USERS_OF_RELATED_ORG",
      "UPDATE_STANDARD_USERS_OF_RELATED_ORG_SYSTEM_ROLE",
      "UPDATE_MANAGER",
      "UPDATE_MANAGER_SYSTEM_ROLE",
      "UPDATE_MANAGERS",
      "UPDATE_MANAGERS_SYSTEM_ROLE",
      "UPDATE_MANAGERS_OF_RELATED_ORG",
      "UPDATE_MANAGERS_OF_RELATED_ORG_SYSTEM_ROLE",
      "UPDATE_MANAGER_ADMIN",
      "UPDATE_MANAGER_ADMIN_SYSTEM_ROLE",
      "UPDATE_MANAGER_ADMINS",
      "UPDATE_MANAGER_ADMINS_SYSTEM_ROLE",
      "UPDATE_MANAGER_ADMINS_OF_RELATED_ORG_SYSTEM_ROLE"
      // "UPDATE_SUPERADMIN",
      // "UPDATE_SUPERADMIN_SYSTEM_ROLE",
      // "UPDATE_SUPERADMINS",
      // "UPDATE_SUPERADMINS_SYSTEM_ROLE",
      // "UPDATE_SUPERADMINS_OF_RELATED_ORG",
      // "UPDATE_SUPERADMINS_OF_RELATED_ORG_SYSTEM_ROLE"
    ]);

    const selfUpdate = request.user.id === id;
    const relatedOrgId = request.user.orgId;

    const user = await User.withPasswordFindByPk(id);
    if (!user) {
      throw new ModelEntityNotFoundError("User", id);
    }

    const ofRelatedOrg = relatedOrgId && user.orgId === relatedOrgId;
    const oldRole = user.systemRole.name;

    const { systemRole: newRole, ...personalDetails } = dto;
    // TODO: check if `orgId undefined` or `no orgId at all` differ in any way
    const wannaChangePersonalDetails = hasDefinedValues(personalDetails);
    const wannaChangeSystemRole = newRole !== undefined && newRole !== oldRole;

    const permissions: SystemPermissionName[] = [];

    if (wannaChangePersonalDetails) {
      if (oldRole === "NOT_ACTIVE" || newRole === "NOT_ACTIVE") {
        if (selfUpdate) {
          permissions.push("UPDATE_NOT_ACTIVE");
        } else {
          if (ofRelatedOrg) {
            permissions.push("UPDATE_NOT_ACTIVES_OF_RELATED_ORG");
          } else {
            permissions.push("UPDATE_NOT_ACTIVES");
          }
        }
      }
      if (oldRole === "STANDARD_USER" || newRole === "STANDARD_USER") {
        if (selfUpdate) {
          permissions.push("UPDATE_STANDARD_USER");
        } else {
          if (ofRelatedOrg) {
            permissions.push("UPDATE_STANDARD_USERS_OF_RELATED_ORG");
          } else {
            permissions.push("UPDATE_STANDARD_USERS");
          }
        }
      }
      if (oldRole === "MANAGER" || newRole === "MANAGER") {
        if (selfUpdate) {
          permissions.push("UPDATE_MANAGER");
        } else {
          if (ofRelatedOrg) {
            permissions.push("UPDATE_MANAGERS_OF_RELATED_ORG");
          } else {
            permissions.push("UPDATE_MANAGERS");
          }
        }
      }
      if (oldRole === "MANAGER_ADMIN" || newRole === "MANAGER_ADMIN") {
        if (selfUpdate) {
          permissions.push("UPDATE_MANAGER_ADMIN");
        } else {
          if (ofRelatedOrg) {
            permissions.push("UPDATE_MANAGER_ADMINS_OF_RELATED_ORG");
          } else {
            permissions.push("UPDATE_MANAGER_ADMINS");
          }
        }
      }
    }

    if (wannaChangeSystemRole) {
      if (oldRole === "NOT_ACTIVE" || newRole === "NOT_ACTIVE") {
        if (selfUpdate) {
          permissions.push("UPDATE_NOT_ACTIVE_SYSTEM_ROLE");
        } else {
          if (ofRelatedOrg) {
            permissions.push("UPDATE_NOT_ACTIVES_OF_RELATED_ORG_SYSTEM_ROLE");
          } else {
            permissions.push("UPDATE_NOT_ACTIVES_SYSTEM_ROLE");
          }
        }
      }
      if (oldRole === "STANDARD_USER" || newRole === "STANDARD_USER") {
        if (selfUpdate) {
          permissions.push("UPDATE_STANDARD_USER_SYSTEM_ROLE");
        } else {
          if (ofRelatedOrg) {
            permissions.push(
              "UPDATE_STANDARD_USERS_OF_RELATED_ORG_SYSTEM_ROLE"
            );
          } else {
            permissions.push("UPDATE_STANDARD_USERS_SYSTEM_ROLE");
          }
        }
      }
      if (oldRole === "MANAGER" || newRole === "MANAGER") {
        if (selfUpdate) {
          permissions.push("UPDATE_MANAGER_SYSTEM_ROLE");
        } else {
          if (ofRelatedOrg) {
            permissions.push("UPDATE_MANAGERS_OF_RELATED_ORG_SYSTEM_ROLE");
          } else {
            permissions.push("UPDATE_MANAGERS_SYSTEM_ROLE");
          }
        }
      }
      if (oldRole === "MANAGER_ADMIN" || newRole === "MANAGER_ADMIN") {
        if (selfUpdate) {
          permissions.push("UPDATE_MANAGER_ADMIN_SYSTEM_ROLE");
        } else {
          if (ofRelatedOrg) {
            permissions.push(
              "UPDATE_MANAGER_ADMINS_OF_RELATED_ORG_SYSTEM_ROLE"
            );
          } else {
            permissions.push("UPDATE_MANAGER_ADMINS_SYSTEM_ROLE");
          }
        }
      }
    }

    // exhaustive compile-time check
    switch (oldRole) {
      case "STANDARD_USER":
        break;
      case "MANAGER_ADMIN":
        break;
      case "MANAGER":
        break;
      case "SUPERADMIN":
        if (user.systemRole.name !== "SUPERADMIN") {
          throw new AuthSuperAdminIsUntouchableError();
        }
        break;
      case "NOT_ACTIVE":
        break;
      default:
        unreachable(oldRole);
    }

    // exhaustive compile-time check
    switch (newRole) {
      case undefined:
        break;
      case "STANDARD_USER":
        break;
      case "MANAGER":
        break;
      case "MANAGER_ADMIN":
        break;
      case "NOT_ACTIVE":
        break;
      default:
        unreachable(newRole);
    }

    securityManager.ensurePermissions(permissions);
    if (wannaChangePersonalDetails || wannaChangeSystemRole) {
      const input = User.fromPutDtoToInput(dto);
      await user.updateWithAssociations(input);
    }
    this.setStatus(204);
  }
}
