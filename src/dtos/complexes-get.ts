import { ErrorValidationQueryDto } from "./error-validation";
import { PartialErrorDtoOptionalOrgId } from "./partials";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ComplexesGetValidationQueryErrorDto
  extends ErrorValidationQueryDto {
  fields: {
    orgId?: PartialErrorDtoOptionalOrgId;
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
