import { ClassificationType } from "src/models/classification-type";
import { OccupierType } from "src/models/occupier-type";
import {
  HasMaxLengthRule,
  IsDateRule,
  IsEnumRule,
  IsIntegerRule,
  IsStringRule
} from "src/validation";
import { ErrorValidationBodyDto } from "./error-validation";
import {
  PartialAddress,
  PartialComplexId,
  PartialErrorDtoAddressFields,
  PartialErrorDtoGpsFields,
  PartialErrorDtoOptionalAddressFields,
  PartialErrorDtoOptionalGpsFields,
  PartialGps,
  PartialId,
  PartialIsActive,
  PartialOptionalAddress,
  PartialOptionalGps,
  PartialErrorDtoOptionalStringWithMaxLength,
  PartialErrorDtoOptionalOther
} from "./partials";
import { HasSameFields } from "./type-magic";

export interface LotsBaseDto extends PartialAddress, PartialGps {
  occupier?: OccupierType;
  classification?: ClassificationType;
  storeys?: number;

  /**
   * @maxLength 255
   */
  characteristics?: string;

  /**
   * @isInt invalid integer number
   */
  floorArea?: number; // TODO: unit of measure

  /**
   * @isInt invalid integer number
   */
  landArea?: number; // TODO: unit of measure
  /**
   * @isDate invalid ISO 8601 date format, i.e. YYYY-MM-DD
   */
  buildDate?: Date;
  /**
   * @maxLength 255
   */
  profileImage?: string;
  images?: string[];
  attachments?: Array<string>;
}

export interface OptionalLotsBaseDto
  extends PartialOptionalAddress,
    PartialOptionalGps {
  occupier?: OccupierType;
  classification?: ClassificationType;
  storeys?: number;

  /**
   * @maxLength 255
   */
  characteristics?: string;

  /**
   * @isInt invalid integer number
   */
  floorArea?: number; // TODO: unit of measure

  /**
   * @isInt invalid integer number
   */
  landArea?: number; // TODO: unit of measure
  /**
   * @isDate invalid ISO 8601 date format, i.e. YYYY-MM-DD
   */
  buildDate?: Date;
  /**
   * @maxLength 255
   */
  profileImage?: string;
  images?: string[];
  attachments?: Array<string>;
}

// #region LotsBaseValidationBodyErrorDto
/* eslint-disable @typescript-eslint/no-explicit-any */
export type PartialErrorDtoLotsBaseFields = PartialErrorDtoAddressFields &
  PartialErrorDtoGpsFields & {
    occupier?: {
      rules: Array<IsEnumRule>;
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
    floorArea?: {
      rules: Array<IsIntegerRule>;
      value?: any;
    }; // TODO: unit of measure
    landArea?: {
      rules: Array<IsIntegerRule>;
      value?: any;
    }; // TODO: unit of measure
    buildDate?: {
      rules: Array<IsDateRule>;
      value?: any;
    };
    profileImage?: PartialErrorDtoOptionalStringWithMaxLength;
    // TODO: add array validation
    images?: PartialErrorDtoOptionalOther;
    attachments?: PartialErrorDtoOptionalOther;
  };
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface LotsBaseValidationBodyErrorDto extends ErrorValidationBodyDto {
  fields: PartialErrorDtoLotsBaseFields;
}

/**
 * Dummy value to enforce compile-time check of proper type construction.
 */
export const hasSameFieldsLotsBase: HasSameFields<
  LotsBaseDto,
  LotsBaseValidationBodyErrorDto
> = true;

// #endregion

// #region OptionalLotsBaseValidationBodyErrorDto
/* eslint-disable @typescript-eslint/no-explicit-any */
export type PartialErrorDtoOptionalLotsBaseFields = PartialErrorDtoOptionalAddressFields &
  PartialErrorDtoOptionalGpsFields & {
    occupier?: {
      rules: Array<IsEnumRule>;
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
    floorArea?: {
      rules: Array<IsIntegerRule>;
      value?: any;
    }; // TODO: unit of measure
    landArea?: {
      rules: Array<IsIntegerRule>;
      value?: any;
    }; // TODO: unit of measure
    buildDate?: {
      rules: Array<IsDateRule>;
      value?: any;
    };
    profileImage?: PartialErrorDtoOptionalStringWithMaxLength;
    // TODO: add array validation
    images?: PartialErrorDtoOptionalOther;
    attachments?: PartialErrorDtoOptionalOther;
  };
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface OptionalLotsBaseValidationBodyErrorDto
  extends ErrorValidationBodyDto {
  fields: PartialErrorDtoOptionalLotsBaseFields;
}

/**
 * Dummy value to enforce compile-time check of proper type construction.
 */
export const hasSameFieldsOptionalLotsBase: HasSameFields<
  OptionalLotsBaseDto,
  OptionalLotsBaseValidationBodyErrorDto
> = true;

// #endregion

export default interface LotsResponseDto
  extends LotsBaseDto,
    PartialId,
    PartialIsActive,
    PartialComplexId {}
