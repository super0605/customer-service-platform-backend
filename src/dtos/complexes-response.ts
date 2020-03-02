import { ClassificationType } from "src/models/classification-type";
import {
  HasMaxLengthRule,
  HasMinLengthRule,
  IsDateRule,
  IsEnumRule,
  IsIntegerRule,
  IsRequiredRule,
  IsStringRule
} from "src/validation";
import { ErrorValidationBodyDto } from "./error-validation";
import {
  PartialAbn,
  PartialAddress,
  PartialErrorDtoAbn,
  PartialErrorDtoAddressFields,
  PartialErrorDtoOptionalAbn,
  PartialErrorDtoOptionalAddressFields,
  PartialErrorDtoOptionalOther,
  PartialId,
  PartialOptionalAbn,
  PartialOptionalAddress,
  PartialOrgId
} from "./partials";
import { HasSameFields } from "./type-magic";

export interface ComplexesBaseDto extends PartialAddress, PartialAbn {
  /**
   * @maxLength 16
   */
  strataPlan: string;

  /**
   * @maxLength 255
   */
  name: string;

  /**
   * @maxLength 255
   */
  spNum?: string;

  /**
   * @maxLength 255
   */
  type?: string;

  /**
   * @isInt invalid integer number
   */
  numLots?: number;

  /**
   * @isDate invalid ISO 8601 date format, i.e. YYYY-MM-DD
   */
  establishedDate?: Date;

  /**
   * @maxLength 9
   * @minLength 9
   */
  tfn?: string;
  classification?: ClassificationType;
  storeys?: number;

  /**
   * @maxLength 255
   */
  characteristics?: string;

  /**
   * @isInt invalid integer number
   */
  totalFloorArea?: number;

  /**
   * @isInt invalid integer number
   */
  totalLandArea?: number;

  /**
   * @isDate invalid ISO 8601 date format, i.e. YYYY-MM-DD
   */
  buildDate?: Date;

  /**
   * @maxLength 255
   */
  builder?: string;
  images?: Array<string>;
  attachments?: Array<string>;
}

export interface OptionalComplexesBaseDto
  extends PartialOptionalAddress,
    PartialOptionalAbn {
  /**
   * @maxLength 16
   */
  strataPlan?: string;

  /**
   * @maxLength 255
   */
  name?: string;

  /**
   * @maxLength 255
   */
  spNum?: string;

  /**
   * @maxLength 255
   */
  type?: string;

  /**
   * @isInt invalid integer number
   */
  numLots?: number;

  /**
   * @isDate invalid ISO 8601 date format, i.e. YYYY-MM-DD
   */
  establishedDate?: Date;

  /**
   * @maxLength 9
   * @minLength 9
   */
  tfn?: string;
  classification?: ClassificationType;
  storeys?: number;

  /**
   * @maxLength 255
   */
  characteristics?: string;

  /**
   * @isInt invalid integer number
   */
  totalFloorArea?: number;

  /**
   * @isInt invalid integer number
   */
  totalLandArea?: number;

  /**
   * @isDate invalid ISO 8601 date format, i.e. YYYY-MM-DD
   */
  buildDate?: Date;

  /**
   * @maxLength 255
   */
  builder?: string;
  images?: Array<string>;
  attachments?: Array<string>;
}

// #region ComplexesBaseValidationBodyErrorDto

/* eslint-disable @typescript-eslint/no-explicit-any */
export type PartialErrorDtoComplexesBaseFields = PartialErrorDtoAddressFields & {
  abn?: PartialErrorDtoAbn;
  strataPlan?: {
    rules: Array<IsRequiredRule | IsStringRule | HasMaxLengthRule>;
    value?: any;
  };
  name?: {
    rules: Array<IsRequiredRule | IsStringRule | HasMaxLengthRule>;
    value?: any;
  };
  spNum?: {
    rules: Array<IsStringRule | HasMaxLengthRule>;
    value?: any;
  };
  type?: {
    rules: Array<IsStringRule | HasMaxLengthRule>;
    value?: any;
  };
  numLots?: {
    rules: Array<IsIntegerRule>;
    value?: any;
  };
  establishedDate?: {
    rules: Array<IsDateRule>;
    value?: any;
  };
  tfn?: {
    rules: Array<IsStringRule | HasMaxLengthRule | HasMinLengthRule>;
    value?: any;
  };
  classification?: {
    rules: Array<IsEnumRule>;
    value?: any;
  };
  storeys?: {
    rules: Array<IsEnumRule>;
    value?: any;
  };
  characteristics?: {
    rules: Array<IsStringRule | HasMaxLengthRule>;
    value?: any;
  };
  totalFloorArea?: {
    rules: Array<IsIntegerRule>;
    value?: any;
  };
  totalLandArea?: {
    rules: Array<IsIntegerRule>;
    value?: any;
  };
  buildDate?: {
    rules: Array<IsDateRule>;
    value?: any;
  };
  builder?: {
    rules: Array<IsStringRule | HasMaxLengthRule>;
    value?: any;
  };
  // TODO: add array validation
  images?: PartialErrorDtoOptionalOther;
  attachments?: PartialErrorDtoOptionalOther;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface ComplexesBaseValidationBodyErrorDto
  extends ErrorValidationBodyDto {
  fields: PartialErrorDtoComplexesBaseFields;
}

/**
 * Dummy value to enforce compile-time check of proper type construction.
 */
export const hasSameFieldsComplexesBase: HasSameFields<
  ComplexesBaseDto,
  ComplexesBaseValidationBodyErrorDto
> = true;

// #endregion

// #region OptionalComplexesBaseValidationBodyErrorDto
/* eslint-disable @typescript-eslint/no-explicit-any */
export type PartialErrorDtoOptionalComplexesBaseFields = PartialErrorDtoOptionalAddressFields & {
  abn?: PartialErrorDtoOptionalAbn;
  strataPlan?: {
    rules: Array<IsStringRule | HasMaxLengthRule>;
    value?: any;
  };
  name?: {
    rules: Array<IsStringRule | HasMaxLengthRule>;
    value?: any;
  };
  spNum?: {
    rules: Array<IsStringRule | HasMaxLengthRule>;
    value?: any;
  };
  address1?: {
    rules: Array<IsStringRule | HasMaxLengthRule>;
    value?: any;
  };
  address2?: {
    rules: Array<IsStringRule | HasMaxLengthRule>;
    value?: any;
  };
  suburb?: {
    rules: Array<IsStringRule | HasMaxLengthRule>;
    value?: any;
  };
  state?: {
    rules: Array<IsStringRule | HasMaxLengthRule>;
    value?: any;
  };
  postcode?: {
    rules: Array<IsStringRule | HasMaxLengthRule | HasMinLengthRule>;
    value?: any;
  };
  type?: {
    rules: Array<IsStringRule | HasMaxLengthRule>;
    value?: any;
  };
  numLots?: {
    rules: Array<IsIntegerRule>;
    value?: any;
  };
  establishedDate?: {
    rules: Array<IsDateRule>;
    value?: any;
  };
  tfn?: {
    rules: Array<IsStringRule | HasMaxLengthRule | HasMinLengthRule>;
    value?: any;
  };
  classification?: {
    rules: Array<IsEnumRule>;
    value?: any;
  };
  storeys?: {
    rules: Array<IsEnumRule>;
    value?: any;
  };
  characteristics?: {
    rules: Array<IsStringRule | HasMaxLengthRule>;
    value?: any;
  };
  totalFloorArea?: {
    rules: Array<IsIntegerRule>;
    value?: any;
  };
  totalLandArea?: {
    rules: Array<IsIntegerRule>;
    value?: any;
  };
  buildDate?: {
    rules: Array<IsDateRule>;
    value?: any;
  };
  builder?: {
    rules: Array<IsStringRule | HasMaxLengthRule>;
    value?: any;
  };
  // TODO: add array validation
  images?: PartialErrorDtoOptionalOther;
  attachments?: PartialErrorDtoOptionalOther;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface OptionalComplexesBaseValidationBodyErrorDto
  extends ErrorValidationBodyDto {
  fields: PartialErrorDtoOptionalComplexesBaseFields;
}

/**
 * Dummy value to enforce compile-time check of proper type construction.
 */
export const hasSameFieldsOptionalComplexesBase: HasSameFields<
  OptionalComplexesBaseDto,
  OptionalComplexesBaseValidationBodyErrorDto
> = true;

// #endregion

export default interface ComplexesResponseDto
  extends PartialId,
    PartialOrgId,
    ComplexesBaseDto {
  isActive: boolean;
}
