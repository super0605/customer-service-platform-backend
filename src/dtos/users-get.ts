import { ErrorValidationQueryDto } from "./error-validation";
import {
  PartialErrorDtoOptionalBoolean,
  PartialErrorDtoOptionalOrgId
} from "./partials";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface UsersGetValidationQueryErrorDto
  extends ErrorValidationQueryDto {
  fields: {
    orgId?: PartialErrorDtoOptionalOrgId;
    withProfileImage?: PartialErrorDtoOptionalBoolean;
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface UsersGetSingleValidationQueryErrorDto
  extends ErrorValidationQueryDto {
  fields: {
    withProfileImage?: PartialErrorDtoOptionalBoolean;
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
