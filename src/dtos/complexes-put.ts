import {
  OptionalComplexesBaseDto,
  PartialErrorDtoComplexesBaseFields
} from "./complexes-response";
import { ErrorValidationBodyDto } from "./error-validation";
import { PartialErrorDtoIsActive } from "./partials";
import { HasSameFields } from "./type-magic";

export default interface ComplexesPutDto extends OptionalComplexesBaseDto {
  isActive?: boolean;

  // orgId?: number
  // cant move complex from org to org yet
}

// #region ComplexesPutErrorDto
export interface ComplexesPutValidationBodyErrorDto
  extends ErrorValidationBodyDto {
  fields: PartialErrorDtoComplexesBaseFields & {
    isActive?: PartialErrorDtoIsActive;
  };
}
// #endregion

/**
 * Dummy value to enforce compile-time check of proper type construction.
 */
export const hasSameFields: HasSameFields<
  ComplexesPutDto,
  ComplexesPutValidationBodyErrorDto
> = true;
