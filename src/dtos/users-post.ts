import { SystemRoleName } from "src/models/system-role";
import { IsEnumRule, IsRequiredRule } from "src/validation";
import { ErrorValidationBodyDto } from "./error-validation";
import {
  PartialErrorDtoOptionalOther,
  PartialErrorDtoOrgId,
  PartialOptionalOrgId
} from "./partials";
//import { HasSameFields } from "./type-magic";
import { PartialErrorDtoUsersBaseFields, UsersBaseDto } from "./users-response";

interface UsersBasePostDto {
  systemRole: SystemRoleName;
}

export default interface UsersPostDto extends UsersBasePostDto, UsersBaseDto, PartialOptionalOrgId {
  systemRole: "MANAGER_ADMIN" | "MANAGER" | "STANDARD_USER";
}

export interface UsersPostDtoWithPass extends UsersPostDto {
  password: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface UsersPostValidationBodyErrorDto extends ErrorValidationBodyDto {
  fields: PartialErrorDtoUsersBaseFields & {
    loginMustBePresent?: PartialErrorDtoOptionalOther;
    orgId?: PartialErrorDtoOrgId;
    systemRole?: {
      rules: Array<IsRequiredRule | IsEnumRule>;
      value?: any;
    };
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Dummy value to enforce compile-time check of proper type construction.
 */
//export const hasSameFields: HasSameFields<UsersPostDto & { loginMustBePresent: null }, UsersPostValidationBodyErrorDto> = undefined;
