import { ErrorValidationBodyDto } from "./error-validation";
import { OrgsBaseDto, PartialErrorDtoOrgsBaseFields } from "./orgs-response";
import { HasSameFields } from "./type-magic";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export default interface OrgsPostDto extends OrgsBaseDto {}

export interface OrgsPostValidationBodyErrorDto extends ErrorValidationBodyDto {
  fields: PartialErrorDtoOrgsBaseFields;
}

/**
 * Dummy value to enforce compile-time check of proper type construction.
 */
export const hasSameFields: HasSameFields<
  OrgsPostDto,
  OrgsPostValidationBodyErrorDto
> = true;
