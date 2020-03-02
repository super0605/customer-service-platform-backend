import { ErrorValidationBodyDto } from "./error-validation";
import {
  PartialErrorDtoOptionalString,
  PartialErrorDtoString,
  PartialId
} from "./partials";
import { HasSameFields } from "./type-magic";

export interface TicketCommentsBaseDto {
  comment: string;
}

export interface OptionalTicketCommentsBaseDto {
  comment?: string;
}

// #region TicketCommentsBaseValidationBodyErrorDto
/* eslint-disable @typescript-eslint/no-explicit-any */
export type PartialErrorDtoTicketCommentsBaseFields = {
  comment?: PartialErrorDtoString;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface TicketCommentsBaseValidationBodyErrorDto
  extends ErrorValidationBodyDto {
  fields: PartialErrorDtoTicketCommentsBaseFields;
}

/**
 * Dummy value to enforce compile-time check of proper type construction.
 */
export const hasSameFieldsTicketCommentsBase: HasSameFields<
  TicketCommentsBaseDto,
  TicketCommentsBaseValidationBodyErrorDto
> = true;

// #endregion

// #region OptionalTicketCommentsBaseValidationBodyErrorDto
/* eslint-disable @typescript-eslint/no-explicit-any */
export type PartialErrorDtoOptionalTicketCommentsBaseFields = {
  comment?: PartialErrorDtoOptionalString;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface OptionalTicketCommentsBaseValidationBodyErrorDto
  extends ErrorValidationBodyDto {
  fields: PartialErrorDtoOptionalTicketCommentsBaseFields;
}

/**
 * Dummy value to enforce compile-time check of proper type construction.
 */
export const hasSameFieldsOptionalTicketCommentsBase: HasSameFields<
  OptionalTicketCommentsBaseDto,
  OptionalTicketCommentsBaseValidationBodyErrorDto
> = true;

// #endregion

export default interface TicketCommentsResponseDto
  extends TicketCommentsBaseDto,
    PartialId {
  /**
   * @isInt invalid integer number
   * @minimum 1
   */
  ticketId: number;

  /**
   * @isInt invalid integer number
   * @minimum 1
   */
  commenterId: number;

  /**
   * @isDateTime
   */
  added: Date;
}
