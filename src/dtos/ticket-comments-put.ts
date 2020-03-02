import { ErrorValidationBodyDto } from "./error-validation";
import {
  OptionalTicketCommentsBaseDto,
  PartialErrorDtoOptionalTicketCommentsBaseFields
} from "./ticket-comments-response";
import { HasSameFields } from "./type-magic";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export default interface TicketCommentsPutDto
  extends OptionalTicketCommentsBaseDto {}

export interface TicketCommentsPutValidationBodyErrorDto
  extends ErrorValidationBodyDto {
  fields: PartialErrorDtoOptionalTicketCommentsBaseFields;
}

/**
 * Dummy value to enforce compile-time check of proper type construction.
 */
export const hasSameFields: HasSameFields<
  TicketCommentsPutDto,
  TicketCommentsPutValidationBodyErrorDto
> = true;
