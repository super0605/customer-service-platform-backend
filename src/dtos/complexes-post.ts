import {
  ComplexesBaseDto,
  PartialErrorDtoComplexesBaseFields
} from "./complexes-response";
import { ErrorValidationBodyDto } from "./error-validation";
import { PartialErrorDtoOrgId, PartialOrgId } from "./partials";
import { HasSameFields } from "./type-magic";

export default interface ComplexesPostDto
  extends ComplexesBaseDto,
    PartialOrgId {}

export interface ComplexesPostValidationBodyErrorDto
  extends ErrorValidationBodyDto {
  fields: PartialErrorDtoComplexesBaseFields & {
    orgId?: PartialErrorDtoOrgId;
  };
}

/**
 * Dummy value to enforce compile-time check of proper type construction.
 */
export const hasSameFields: HasSameFields<
  ComplexesPostDto,
  ComplexesPostValidationBodyErrorDto
> = true;
