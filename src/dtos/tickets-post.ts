import { ErrorValidationBodyDto } from "./error-validation";
import {
  PartialErrorDtoLotId,
  PartialErrorDtoOther,
  PartialId
} from "./partials";
import {
  PartialErrorDtoTicketsBaseFields,
  TicketsBaseDto
} from "./tickets-response";
import { HasSameFields } from "./type-magic";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export default interface TicketsPostDto extends TicketsBaseDto {
  /**
   * @isInt invalid integer number
   * @minimum 1
   */
  primaryLotId: number;

  lots: Array<{} & PartialId>;
}

export interface TicketsPostValidationBodyErrorDto
  extends ErrorValidationBodyDto {
  fields: PartialErrorDtoTicketsBaseFields & {
    primaryLotId?: PartialErrorDtoLotId;
    lots?: PartialErrorDtoOther; // TODO: add array validation
  };
}

/**
 * Dummy value to enforce compile-time check of proper type construction.
 */
export const hasSameFields: HasSameFields<
  TicketsPostDto,
  TicketsPostValidationBodyErrorDto
> = true;
