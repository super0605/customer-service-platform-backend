import { ErrorValidationBodyDto } from "./error-validation";
import {
  OptionalOrgsBaseDto,
  PartialErrorDtoOptionalOrgsBaseFields
} from "./orgs-response";
import { HasSameFields } from "./type-magic";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export default interface OrgsPutDto extends OptionalOrgsBaseDto {}

export interface OrgsPutValidationBodyErrorDto extends ErrorValidationBodyDto {
  fields: PartialErrorDtoOptionalOrgsBaseFields;
}

/**
 * Dummy value to enforce compile-time check of proper type construction.
 */
export const hasSameFields: HasSameFields<
  OrgsPutDto,
  OrgsPutValidationBodyErrorDto
> = true;
