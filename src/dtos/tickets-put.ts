import {
  ForeignEntityExistsRule,
  HasMaxLengthRule,
  IsStringRule
} from "src/validation";
import { ErrorValidationBodyDto } from "./error-validation";
import {
  OptionalTicketsBaseDto,
  PartialErrorDtoOptionalTicketsBaseFields
} from "./tickets-response";
import { HasSameFields } from "./type-magic";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export default interface TicketsPutDto extends OptionalTicketsBaseDto {
  /**
   * @maxLength 45
   */
  ticketStatus?: string;
}

export interface TicketsPutValidationBodyErrorDto
  extends ErrorValidationBodyDto {
  fields: PartialErrorDtoOptionalTicketsBaseFields & {
    ticketStatus?: {
      rules: Array<ForeignEntityExistsRule | IsStringRule | HasMaxLengthRule>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value?: any;
    };
  };
}

/**
 * Dummy value to enforce compile-time check of proper type construction.
 */
export const hasSameFields: HasSameFields<
  TicketsPutDto,
  TicketsPutValidationBodyErrorDto
> = true;
