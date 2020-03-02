import { ErrorValidationQueryDto } from "./error-validation";
import {
  PartialErrorDtoOptionalComplexId,
  PartialErrorDtoOptionalLotId,
  PartialErrorDtoOptionalOrgId
} from "./partials";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface TicketsGetValidationQueryErrorDto
  extends ErrorValidationQueryDto {
  fields: {
    orgId?: PartialErrorDtoOptionalOrgId;
    complexId?: PartialErrorDtoOptionalComplexId;
    primaryLotId?: PartialErrorDtoOptionalLotId;
    lotId?: PartialErrorDtoOptionalLotId;
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */
// export interface TicketsGetSingleValidationQueryErrorDto
//   extends ErrorValidationQueryDto {
//   fields: {
//   };
// }
/* eslint-enable @typescript-eslint/no-explicit-any */
