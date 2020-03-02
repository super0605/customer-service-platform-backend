import { ErrorValidationBodyDto } from "./error-validation";
import { LotsBaseDto, PartialErrorDtoLotsBaseFields } from "./lots-response";
import { PartialComplexId, PartialErrorDtoComplexId } from "./partials";
import { HasSameFields } from "./type-magic";

export default interface LotsPostDto extends LotsBaseDto, PartialComplexId {}

export interface LotsPostValidationBodyErrorDto extends ErrorValidationBodyDto {
  fields: PartialErrorDtoLotsBaseFields & {
    complexId?: PartialErrorDtoComplexId;
  };
}

/**
 * Dummy value to enforce compile-time check of proper type construction.
 */
export const hasSameFields: HasSameFields<
  LotsPostDto,
  LotsPostValidationBodyErrorDto
> = true;
