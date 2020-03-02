import { HasMaxLengthRule, IsRequiredRule, IsStringRule } from "src/validation";
import { ErrorValidationBodyDto } from "./error-validation";
import {
  PartialAbn,
  PartialAddress,
  PartialErrorDtoAbn,
  PartialErrorDtoAddressFields,
  PartialErrorDtoOptionalAbn,
  PartialErrorDtoOptionalAddressFields,
  PartialId,
  PartialOptionalAbn,
  PartialOptionalAddress,
  PartialErrorDtoOptionalStringWithMaxLength
} from "./partials";
import { HasSameFields } from "./type-magic";

export interface OrgsBaseDto extends PartialAddress, PartialAbn {
  /**
   * @maxLength 255
   */
  tradingName: string;
  /**
   * @maxLength 255
   */
  companyName?: string;
  /**
   * @maxLength 255
   */
  profileImage?: string;
}

export interface OptionalOrgsBaseDto
  extends PartialOptionalAddress,
    PartialOptionalAbn {
  /**
   * @maxLength 255
   */
  tradingName?: string;
  /**
   * @maxLength 255
   */
  companyName?: string;
  /**
   * @maxLength 255
   */
  profileImage?: string;
}

// #region OrgsBaseDtoValidationBodyErrorDto
/* eslint-disable @typescript-eslint/no-explicit-any */
export type PartialErrorDtoOrgsBaseFields = PartialErrorDtoAddressFields & {
  abn?: PartialErrorDtoAbn;
  tradingName?: {
    rules: Array<IsRequiredRule | IsStringRule | HasMaxLengthRule>;
    value?: any;
  };
  companyName?: {
    rules: Array<IsStringRule | HasMaxLengthRule>;
    value?: any;
  };
  profileImage?: PartialErrorDtoOptionalStringWithMaxLength;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface OrgsBaseValidationBodyErrorDto extends ErrorValidationBodyDto {
  fields: PartialErrorDtoOrgsBaseFields;
}

/**
 * Dummy value to enforce compile-time check of proper type construction.
 */
export const hasSameFieldsOrgsBase: HasSameFields<
  OrgsBaseDto,
  OrgsBaseValidationBodyErrorDto
> = true;

// #endregion

// #region OptionalOrgsBaseDtoValidationBodyErrorDto
/* eslint-disable @typescript-eslint/no-explicit-any */
export type PartialErrorDtoOptionalOrgsBaseFields = PartialErrorDtoOptionalAddressFields & {
  abn?: PartialErrorDtoOptionalAbn;
  tradingName?: {
    rules: Array<IsStringRule | HasMaxLengthRule>;
    value?: any;
  };
  companyName?: {
    rules: Array<IsStringRule | HasMaxLengthRule>;
    value?: any;
  };
  profileImage?: PartialErrorDtoOptionalStringWithMaxLength;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface OptionalOrgsBaseValidationBodyErrorDto
  extends ErrorValidationBodyDto {
  fields: PartialErrorDtoOptionalOrgsBaseFields;
}

/**
 * Dummy value to enforce compile-time check of proper type construction.
 */
export const hasSameFieldsOptionalOrgsBase: HasSameFields<
  OptionalOrgsBaseDto,
  OptionalOrgsBaseValidationBodyErrorDto
> = true;

// #endregion

export default interface OrgsResponseDto extends OrgsBaseDto, PartialId {}
