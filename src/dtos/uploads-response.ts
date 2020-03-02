import { ErrorValidationBodyDto } from "./error-validation";
import { HasSameFields } from "./type-magic";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UploadsBaseDto {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OptionalUploadsBaseDto {}

// #region UploadsBaseValidationBodyErrorDto
export type PartialErrorDtoUploadsBaseFields = {};

export interface UploadsBaseValidationBodyErrorDto
  extends ErrorValidationBodyDto {
  fields: PartialErrorDtoUploadsBaseFields;
}

/**
 * Dummy value to enforce compile-time check of proper type construction.
 */
export const hasSameFieldsUploadsBase: HasSameFields<
  UploadsBaseDto,
  UploadsBaseValidationBodyErrorDto
> = true;

// #endregion

// #region OptionalUsersBaseValidationBodyErrorDto
export type PartialErrorDtoOptionalUploadsBaseFields = {};

export interface OptionalUploadsBaseValidationBodyErrorDto
  extends ErrorValidationBodyDto {
  fields: PartialErrorDtoOptionalUploadsBaseFields;
}

/**
 * Dummy value to enforce compile-time check of proper type construction.
 */
export const hasSameFieldsOptionalUploadsBase: HasSameFields<
  OptionalUploadsBaseDto,
  OptionalUploadsBaseValidationBodyErrorDto
> = true;

// #endregion

export default interface UploadsResponseDto extends UploadsBaseDto {
  url: string;
}
