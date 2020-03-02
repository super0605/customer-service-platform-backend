import { ErrorValidationQueryDto } from "./error-validation";
import { PartialErrorDtoForeignId } from "./partials";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface TicketCommentsGetValidationQueryErrorDto
  extends ErrorValidationQueryDto {
  fields: {
    ticketId?: PartialErrorDtoForeignId;
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// /* eslint-disable @typescript-eslint/no-explicit-any */
// export interface TicketsGetSingleValidationQueryErrorDto
//   extends ErrorValidationQueryDto {
//   fields: {};
// }
// /* eslint-enable @typescript-eslint/no-explicit-any */
