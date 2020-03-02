import { ProblemCategory } from "src/models/problem-category";
import { TicketType } from "src/models/ticket-type";
import { ErrorValidationBodyDto } from "./error-validation";
import {
  PartialErrorDtoBoolean,
  PartialErrorDtoEnum,
  PartialErrorDtoOptionalBoolean,
  PartialErrorDtoOptionalEnum,
  PartialErrorDtoOptionalForeignId,
  PartialErrorDtoOptionalOther,
  PartialErrorDtoOptionalString,
  PartialErrorDtoOptionalStringWithMaxLength,
  PartialErrorDtoOther,
  PartialErrorDtoStringWithMaxLength,
  PartialId
} from "./partials";
import { HasSameFields } from "./type-magic";

export interface TicketsBaseDto {
  ticketType: TicketType;
  problemCategory?: ProblemCategory;
  description?: string;

  /**
   * @isInt invalid integer number
   * @minimum 1
   */
  executiveId?: number;

  /**
   * @maxLength 255
   */
  profileImage?: string;
  /**
   * @maxLength 255
   */
  title: string;
  isUrgent: boolean;
  affectsMultipleProperties: boolean;
  // TODO: make tags optional
  tags: Array<string>;
  attachments?: Array<string>;
}

export interface OptionalTicketsBaseDto {
  ticketType?: TicketType;
  problemCategory?: ProblemCategory;
  description?: string;

  /**
   * @isInt invalid integer number
   * @minimum 1
   */
  executiveId?: number;

  /**
   * @maxLength 255
   */
  profileImage?: string;
  /**
   * @maxLength 255
   */
  title?: string;
  isUrgent?: boolean;
  affectsMultipleProperties?: boolean;
  tags?: Array<string>;
  attachments?: Array<string>;
}

// #region TicketsBaseValidationBodyErrorDto
/* eslint-disable @typescript-eslint/no-explicit-any */
export type PartialErrorDtoTicketsBaseFields = {
  ticketType?: PartialErrorDtoEnum;
  problemCategory?: PartialErrorDtoOptionalEnum;
  description?: PartialErrorDtoOptionalString;
  executiveId?: PartialErrorDtoOptionalForeignId;
  profileImage?: PartialErrorDtoOptionalStringWithMaxLength;
  title?: PartialErrorDtoStringWithMaxLength;
  isUrgent?: PartialErrorDtoBoolean;
  affectsMultipleProperties?: PartialErrorDtoBoolean;
  // TODO: add array validation
  tags?: PartialErrorDtoOther;
  attachments?: PartialErrorDtoOptionalOther;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface TicketsBaseValidationBodyErrorDto
  extends ErrorValidationBodyDto {
  fields: PartialErrorDtoTicketsBaseFields;
}

/**
 * Dummy value to enforce compile-time check of proper type construction.
 */
export const hasSameFieldsTicketsBase: HasSameFields<
  TicketsBaseDto,
  TicketsBaseValidationBodyErrorDto
> = true;

// #endregion

// #region OptionalTicketsBaseValidationBodyErrorDto
/* eslint-disable @typescript-eslint/no-explicit-any */
export type PartialErrorDtoOptionalTicketsBaseFields = {
  ticketType?: PartialErrorDtoOptionalEnum;
  problemCategory?: PartialErrorDtoOptionalEnum;
  description?: PartialErrorDtoOptionalString;
  executiveId?: PartialErrorDtoOptionalForeignId;
  profileImage?: PartialErrorDtoOptionalStringWithMaxLength;
  title?: PartialErrorDtoOptionalStringWithMaxLength;
  isUrgent?: PartialErrorDtoOptionalBoolean;
  affectsMultipleProperties?: PartialErrorDtoOptionalBoolean;
  // TODO: add array validation
  tags?: PartialErrorDtoOptionalOther;
  attachments?: PartialErrorDtoOptionalOther;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface OptionalTicketsBaseValidationBodyErrorDto
  extends ErrorValidationBodyDto {
  fields: PartialErrorDtoOptionalTicketsBaseFields;
}

/**
 * Dummy value to enforce compile-time check of proper type construction.
 */
export const hasSameFieldsOptionalTicketsBase: HasSameFields<
  OptionalTicketsBaseDto,
  OptionalTicketsBaseValidationBodyErrorDto
> = true;

// #endregion

export default interface TicketsResponseDto extends TicketsBaseDto, PartialId {
  /**
   * @isInt invalid integer number
   * @minimum 1
   */
  primaryLotId: number;

  /**
   * @isInt invalid integer number
   * @minimum 1
   */
  issuerId: number;

  /**
   * @isDateTime
   */
  issued: Date;

  /**
   * @isDateTime
   */
  closed?: Date;

  /**
   * @maxLength 45
   */
  ticketStatus: string;
}
