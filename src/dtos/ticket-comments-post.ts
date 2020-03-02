import { ErrorValidationBodyDto } from "./error-validation";
import { PartialErrorDtoForeignId } from "./partials";
import {
  PartialErrorDtoTicketCommentsBaseFields,
  TicketCommentsBaseDto
} from "./ticket-comments-response";
import { HasSameFields } from "./type-magic";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export default interface TicketCommentsPostDto extends TicketCommentsBaseDto {
  /**
   * @isInt invalid integer number
   * @minimum 1
   */
  ticketId: number;
}

export interface TicketCommentsPostValidationBodyErrorDto
  extends ErrorValidationBodyDto {
  fields: PartialErrorDtoTicketCommentsBaseFields & {
    ticketId?: PartialErrorDtoForeignId;
  };
}

/**
 * Dummy value to enforce compile-time check of proper type construction.
 */
export const hasSameFields: HasSameFields<
  TicketCommentsPostDto,
  TicketCommentsPostValidationBodyErrorDto
> = true;
