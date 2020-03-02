import { ForeignEntityExistsRule, OtherRule } from "src/validation";
import { ErrorValidationBodyDto } from "./error-validation";
import {
  OptionalLotsBaseDto,
  PartialErrorDtoOptionalLotsBaseFields
} from "./lots-response";
import {
  PartialErrorDtoOptionalIsActive,
  PartialId,
  PartialOptionalIsActive
} from "./partials";
import { HasSameFields } from "./type-magic";

/**
 * @example
 * {
 *   "address1": "string",
 *   "address2": "string",
 *   "suburb": "string",
 *   "state": "string",
 *   "postcode": "string",
 *   "gpsLatitude": "string",
 *   "gpsLongitude": "string",
 *   "occupier": "Owner occupied",
 *   "classification": "Residential",
 *   "storeys": "Single",
 *   "characteristics": "string",
 *   "floorArea": 0,
 *   "landArea": 0,
 *   "buildDate": "2019-12-09",
 *   "roles": {
 *     "LOT_OWNER": [{"id": 5}]
 *   }
 * }
 */
export default interface LotsPutDto
  extends OptionalLotsBaseDto,
    PartialOptionalIsActive {
  // complexId: number;
  // cant move lot from complex to complex yet

  roles?: {
    [roleName: string]: Array<{} & PartialId>;
  };
}

export interface LotsPutValidationBodyErrorDto extends ErrorValidationBodyDto {
  fields: PartialErrorDtoOptionalLotsBaseFields & {
    isActive?: PartialErrorDtoOptionalIsActive;
    roles?: {
      rules: Array<ForeignEntityExistsRule | OtherRule>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value?: any;
    }; // TODO: add array validation
  };
}

/**
 * Dummy value to enforce compile-time check of proper type construction.
 */
export const hasSameFields: HasSameFields<
  LotsPutDto,
  LotsPutValidationBodyErrorDto
> = true;
