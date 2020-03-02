import { ErrorValidationQueryDto } from "./error-validation";
import { PartialErrorDtoOptionalBoolean } from "./partials";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface OrgsGetValidationQueryErrorDto
  extends ErrorValidationQueryDto {
  fields: {
    withProfileImage?: PartialErrorDtoOptionalBoolean;
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface OrgsGetSingleValidationQueryErrorDto
  extends ErrorValidationQueryDto {
  fields: {
    withProfileImage?: PartialErrorDtoOptionalBoolean;
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
