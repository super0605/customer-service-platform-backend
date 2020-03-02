import { ErrorValidationQueryDto } from "./error-validation";
import {
  PartialErrorDtoOptionalComplexId,
  PartialErrorDtoOptionalOrgId,
  PartialErrorDtoOptionalBoolean
} from "./partials";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface LotsGetValidationQueryErrorDto
  extends ErrorValidationQueryDto {
  fields: {
    orgId?: PartialErrorDtoOptionalOrgId;
    complexId?: PartialErrorDtoOptionalComplexId;
    withRolesAndUsers?: PartialErrorDtoOptionalBoolean;
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface LotsGetSingleValidationQueryErrorDto
  extends ErrorValidationQueryDto {
  fields: {
    withRolesAndUsers?: PartialErrorDtoOptionalBoolean;
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
