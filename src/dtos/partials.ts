import {
  ForeignEntityExistsRule,
  HasMaxLengthRule,
  HasMinLengthRule,
  HasMinRule,
  IsBooleanRule,
  IsDateRule,
  IsDateTimeRule,
  IsEnumRule,
  IsIntegerRule, IsNumberRule,
  IsRequiredRule,
  IsStringRule,
  OtherRule
} from "src/validation";

// #region orgId
export interface PartialOrgId {
  /**
   * @isInt invalid integer number
   * @minimum 1
   */
  orgId: number;
}

export interface PartialOptionalOrgId {
  /**
   * @isInt invalid integer number
   * @minimum 1
   */
  orgId?: number;
}

export interface PartialErrorDtoOrgId {
  rules: Array<
    IsRequiredRule | ForeignEntityExistsRule | IsIntegerRule | HasMinRule
  >;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}

export interface PartialErrorDtoOptionalOrgId {
  rules: Array<ForeignEntityExistsRule | IsIntegerRule | HasMinRule>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}
// #endregion

// #region lotId
export interface PartialLotId {
  /**
   * @isInt invalid integer number
   * @minimum 1
   */
  lotId: number;
}

export interface PartialOptionalLotId {
  /**
   * @isInt invalid integer number
   * @minimum 1
   */
  lotId?: number;
}

export interface PartialErrorDtoLotId {
  rules: Array<
    IsRequiredRule | ForeignEntityExistsRule | IsIntegerRule | HasMinRule
  >;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}

export interface PartialErrorDtoOptionalLotId {
  rules: Array<ForeignEntityExistsRule | IsIntegerRule | HasMinRule>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}
// #endregion

// #region id
export interface PartialId {
  /**
   * @isInt invalid integer number
   * @minimum 1
   */
  id: number;
}

export interface PartialOptionalId {
  /**
   * @isInt invalid integer number
   * @minimum 1
   */
  id?: number;
}

export interface PartialErrorDtoId {
  rules: Array<IsRequiredRule | IsIntegerRule | HasMinRule>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}

export interface PartialErrorDtoOptionalId {
  rules: Array<IsIntegerRule | HasMinRule>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}
// #endregion

// #region foreign id
export interface PartialErrorDtoForeignId {
  rules: Array<
    IsRequiredRule | ForeignEntityExistsRule | IsIntegerRule | HasMinRule
  >;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}

export interface PartialErrorDtoOptionalForeignId {
  rules: Array<ForeignEntityExistsRule | IsIntegerRule | HasMinRule>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}
// #endregion

// #region address
export interface PartialAddress {
  /**
   * @maxLength 255
   */
  address1: string;

  /**
   * @maxLength 255
   */
  address2?: string;

  /**
   * @maxLength 45
   */
  suburb: string;

  /**
   * @maxLength 45
   */
  state: string;

  /**
   * @maxLength 6
   * @minLength 4
   */
  postcode: string;
}

export interface PartialOptionalAddress {
  /**
   * @maxLength 255
   */
  address1?: string;

  /**
   * @maxLength 255
   */
  address2?: string;

  /**
   * @maxLength 45
   */
  suburb?: string;

  /**
   * @maxLength 45
   */
  state?: string;

  /**
   * @maxLength 6
   * @minLength 4
   */
  postcode?: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PartialErrorDtoAddressFields {
  address1?: {
    rules: Array<IsRequiredRule | IsStringRule | HasMaxLengthRule>;
    value?: any;
  };
  address2?: {
    rules: Array<IsStringRule | HasMaxLengthRule>;
    value?: any;
  };
  suburb?: {
    rules: Array<IsRequiredRule | IsStringRule | HasMaxLengthRule>;
    value?: any;
  };
  state?: {
    rules: Array<IsRequiredRule | IsStringRule | HasMaxLengthRule>;
    value?: any;
  };
  postcode?: {
    rules: Array<
      IsRequiredRule | IsStringRule | HasMaxLengthRule | HasMinLengthRule
    >;
    value?: any;
  };
}

export interface PartialErrorDtoOptionalAddressFields {
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
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// #endregion

// #region abn
export interface PartialAbn {
  /**
   * @maxLength 11
   * @minLength 11
   */
  abn: string;
}

export interface PartialOptionalAbn {
  /**
   * @maxLength 11
   * @minLength 11
   */
  abn?: string;
}

export interface PartialErrorDtoAbn {
  rules: Array<
    IsRequiredRule | IsStringRule | HasMinLengthRule | HasMaxLengthRule
  >;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}

export interface PartialErrorDtoOptionalAbn {
  rules: Array<IsStringRule | HasMinLengthRule | HasMaxLengthRule>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}
// #endregion

// #region tfn
export interface PartialTfn {
  /**
   * @maxLength 9
   * @minLength 9
   */
  tfn: string;
}

export interface PartialOptionalTfn {
  /**
   * @maxLength 9
   * @minLength 9
   */
  tfn?: string;
}

export interface PartialErrorDtoTfn {
  rules: Array<
    IsRequiredRule | IsStringRule | HasMinLengthRule | HasMaxLengthRule
  >;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}

export interface PartialErrorDtoOptionalTfn {
  rules: Array<IsStringRule | HasMinLengthRule | HasMaxLengthRule>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}
// #endregion

// #region isActive
export interface PartialIsActive {
  isActive: boolean;
}

export interface PartialOptionalIsActive {
  isActive?: boolean;
}

export interface PartialErrorDtoIsActive {
  rules: Array<IsRequiredRule | IsBooleanRule>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}

export interface PartialErrorDtoOptionalIsActive {
  rules: Array<IsBooleanRule>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}
// #endregion

// #region complexId
export interface PartialComplexId {
  /**
   * @isInt invalid integer number
   * @minimum 1
   */
  complexId: number;
}

export interface PartialOptionalComplexId {
  /**
   * @isInt invalid integer number
   * @minimum 1
   */
  complexId?: number;
}

export interface PartialErrorDtoComplexId {
  rules: Array<
    IsRequiredRule | ForeignEntityExistsRule | IsIntegerRule | HasMinRule
  >;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}

export interface PartialErrorDtoOptionalComplexId {
  rules: Array<ForeignEntityExistsRule | IsIntegerRule | HasMinRule>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}
// #endregion

// #region gps
export interface PartialGps {
  // TODO: gps validation
  gpsLatitude: string;
  gpsLongitude: string;
}

export interface PartialOptionalGps {
  gpsLatitude?: string;
  gpsLongitude?: string;
}

export interface PartialErrorDtoGpsFields {
  gpsLatitude?: {
    rules: Array<IsRequiredRule | IsStringRule>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value?: any;
  };
  gpsLongitude?: {
    rules: Array<IsRequiredRule | IsStringRule>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value?: any;
  };
}

export interface PartialErrorDtoOptionalGpsFields {
  gpsLatitude?: {
    rules: Array<IsStringRule>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value?: any;
  };
  gpsLongitude?: {
    rules: Array<IsStringRule>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value?: any;
  };
}

// #endregion

// #region string with maxLength
export interface PartialErrorDtoStringWithMaxLength {
  rules: Array<IsRequiredRule | IsStringRule | HasMaxLengthRule>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}

export interface PartialErrorDtoOptionalStringWithMaxLength {
  rules: Array<IsStringRule | HasMaxLengthRule>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}
// #endregion

// #region date
export interface PartialErrorDtoDate {
  rules: Array<IsRequiredRule | IsDateRule>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}

export interface PartialErrorDtoRole {
  rules: Array<IsRequiredRule | IsStringRule>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}

export interface PartialErrorDtoLotsIds {
  rules: Array<IsRequiredRule | IsNumberRule>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}

export interface PartialErrorDtoOptionalDate {
  rules: Array<IsDateRule>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}
// #endregion

// #region other
export interface PartialErrorDtoOther {
  rules: Array<IsRequiredRule | OtherRule>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}

export interface PartialErrorDtoOptionalOther {
  rules: Array<OtherRule>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}
// #endregion

// #region boolean
export interface PartialErrorDtoBoolean {
  rules: Array<IsRequiredRule | IsBooleanRule>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}
export interface PartialErrorDtoOptionalBoolean {
  rules: Array<IsBooleanRule>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}
// #endregion

// #region enum
export interface PartialErrorDtoEnum {
  rules: Array<IsRequiredRule | IsEnumRule>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}
export interface PartialErrorDtoOptionalEnum {
  rules: Array<IsEnumRule>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}
// #endregion

// #region string
export interface PartialErrorDtoString {
  rules: Array<IsRequiredRule | IsStringRule>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}
export interface PartialErrorDtoOptionalString {
  rules: Array<IsStringRule>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}
// #endregion

// #region datetime
export interface PartialErrorDtoDateTime {
  rules: Array<IsRequiredRule | IsDateTimeRule>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}
export interface PartialErrorDtoOptionalDateTime {
  rules: Array<IsDateTimeRule>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
}
// #endregion
