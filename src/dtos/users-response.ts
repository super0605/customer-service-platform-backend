import { ErrorValidationBodyDto } from "./error-validation";
import {
  PartialErrorDtoDate, PartialErrorDtoLotsIds,
  PartialErrorDtoOptionalAbn,
  PartialErrorDtoOptionalTfn,
  PartialErrorDtoOptionalDate,
  PartialErrorDtoOptionalStringWithMaxLength, PartialErrorDtoRole,
  PartialErrorDtoStringWithMaxLength,
  PartialId,
  PartialOptionalAbn,
  PartialOptionalTfn,
  PartialOptionalOrgId
} from "./partials";
//import { HasSameFields } from "./type-magic";
import { SystemRoleName } from '../seeds/seeds';

export interface UsersBaseDto extends PartialOptionalAbn, PartialOptionalTfn {
  /**
   * @maxLength 45
   */
  firstName: string;
  /**
   * @maxLength 45
   */
  title: string;
  /**
   * @maxLength 45
   */
  surName: string;
  /**
   * @maxLength 255
   */
  company?: string;
  /**
   * @maxLength 64
   */
  primaryEmail?: string;
  /**
   * @maxLength 64
   */
  secondaryEmail?: string;
  /**
   * @isDate invalid ISO 8601 date format, i.e. YYYY-MM-DD
   */
  dateOfBirth?: Date;
  /**
   * @maxLength 16
   */
  homePhone?: string;
  /**
   * @maxLength 16
   */
  mobilePhone?: string;
  /**
   * @maxLength 16
   */
  fax?: string;
  /**
   * @maxLength 255
   */
  profileImage?: string;

  role?: SystemRoleName;

  lotsIds?: number[];
  /**
   * @maxLength 255
   */
  primaryAddress?: string;
  /**
   * @maxLength 255
   */
  postalAddress?: string;
}

export interface OptionalUsersBaseDto extends PartialOptionalAbn, PartialOptionalTfn {
  /**
   * @maxLength 45
   */
  firstName?: string;
  /**
   * @maxLength 45
   */
  title?: string;
  /**
   * @maxLength 45
   */
  surName?: string;
  /**
   * @maxLength 255
   */
  company?: string;
  /**
   * @maxLength 64
   */
  primaryEmail?: string;
  /**
   * @maxLength 64
   */
  secondaryEmail?: string;
  /**
   * @isDate invalid ISO 8601 date format, i.e. YYYY-MM-DD
   */
  dateOfBirth?: Date;
  /**
   * @maxLength 16
   */
  homePhone?: string;
  /**
   * @maxLength 16
   */
  mobilePhone?: string;
  /**
   * @maxLength 16
   */
  fax?: string;
  /**
   * @maxLength 255
   */
  profileImage?: string;
  /**
   * @maxLength 255
   */
  primaryAddress?: string;
  /**
   * @maxLength 255
   */
  postalAddress?: string;

  orgId?: number;
}

// #region UsersBaseValidationBodyErrorDto
export type PartialErrorDtoUsersBaseFields = {
  abn?: PartialErrorDtoOptionalAbn;
  tfn?: PartialErrorDtoOptionalTfn;
  firstName?: PartialErrorDtoStringWithMaxLength;
  title?: PartialErrorDtoStringWithMaxLength;
  surName?: PartialErrorDtoStringWithMaxLength;
  company?: PartialErrorDtoOptionalStringWithMaxLength;
  primaryEmail?: PartialErrorDtoOptionalStringWithMaxLength;
  secondaryEmail?: PartialErrorDtoOptionalStringWithMaxLength;
  dateOfBirth?: PartialErrorDtoDate;
  homePhone?: PartialErrorDtoOptionalStringWithMaxLength;
  mobilePhone?: PartialErrorDtoOptionalStringWithMaxLength;
  fax?: PartialErrorDtoOptionalStringWithMaxLength;
  profileImage?: PartialErrorDtoOptionalStringWithMaxLength;
  role?: PartialErrorDtoRole;
  lotsIds?: PartialErrorDtoLotsIds
};

export interface UsersBaseValidationBodyErrorDto
  extends ErrorValidationBodyDto {
  fields: PartialErrorDtoUsersBaseFields;
}

/**
 * Dummy value to enforce compile-time check of proper type construction.

export const hasSameFieldsUsersBase: HasSameFields<
  UsersBaseDto,
  UsersBaseValidationBodyErrorDto
> = true;
 */

// #endregion

// #region OptionalUsersBaseValidationBodyErrorDto
export type PartialErrorDtoOptionalUsersBaseFields = {
  abn?: PartialErrorDtoOptionalAbn;
  tfn?: PartialErrorDtoOptionalTfn;
  firstName?: PartialErrorDtoOptionalStringWithMaxLength;
  title?: PartialErrorDtoOptionalStringWithMaxLength;
  surName?: PartialErrorDtoOptionalStringWithMaxLength;
  company?: PartialErrorDtoOptionalStringWithMaxLength;
  primaryEmail?: PartialErrorDtoOptionalStringWithMaxLength;
  secondaryEmail?: PartialErrorDtoOptionalStringWithMaxLength;
  dateOfBirth?: PartialErrorDtoOptionalDate;
  homePhone?: PartialErrorDtoOptionalStringWithMaxLength;
  mobilePhone?: PartialErrorDtoOptionalStringWithMaxLength;
  fax?: PartialErrorDtoOptionalStringWithMaxLength;
  profileImage?: PartialErrorDtoOptionalStringWithMaxLength;
};

export interface OptionalUsersBaseValidationBodyErrorDto
  extends ErrorValidationBodyDto {
  fields: PartialErrorDtoOptionalUsersBaseFields;
}

/**
 * Dummy value to enforce compile-time check of proper type construction.

export const hasSameFieldsOptionalUsersBase: HasSameFields<
  OptionalUsersBaseDto,
  OptionalUsersBaseValidationBodyErrorDto
> = true;
 */
// #endregion

export default interface UsersResponseDto
  extends UsersBaseDto,
    PartialOptionalOrgId,
    PartialId {}
