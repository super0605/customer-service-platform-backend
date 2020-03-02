import { SystemRoleName } from "src/models/system-role";
import { IsEnumRule } from "src/validation";
import { ErrorValidationBodyDto } from "./error-validation";
//import { HasSameFields } from "./type-magic";
import {
  OptionalUsersBaseDto,
  PartialErrorDtoOptionalUsersBaseFields
} from "./users-response";

interface UsersBasePutDto {
  systemRole?: SystemRoleName;
}

export default interface UsersPutDto
  extends UsersBasePutDto,
    OptionalUsersBaseDto {
  systemRole?: "MANAGER_ADMIN" | "MANAGER" | "NOT_ACTIVE" | "STANDARD_USER";
}

export interface UsersPutValidationBodyErrorDto extends ErrorValidationBodyDto {
  fields: PartialErrorDtoOptionalUsersBaseFields & {
    systemRole?: {
      rules: Array<IsEnumRule>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value?: any;
    };
  };
}

/**
 * Dummy value to enforce compile-time check of proper type construction.

export const hasSameFields: HasSameFields<
  UsersPutDto,
  UsersPutValidationBodyErrorDto
> = true;
 */
