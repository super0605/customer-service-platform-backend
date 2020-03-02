import { ErrorValidationBodyDto } from "./error-validation";
import { IsRequiredRule, IsStringRule, HasMaxLengthRule } from "src/validation";
import { HasSameFields } from "./type-magic";

export default interface AccessTokensPostDto {
  /**
   * @format email
   * @maxLength 64
   */
  login: string;
  password: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface AccessTokensPostValidationBodyErrorDto
  extends ErrorValidationBodyDto {
  fields: {
    login?: {
      rules: Array<IsRequiredRule | IsStringRule | HasMaxLengthRule>;
      value?: any;
    };
    password?: {
      rules: Array<IsRequiredRule | IsStringRule>;
      value?: any;
    };
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Dummy value to enforce compile-time check of proper type construction.
 */
export const hasSameFields: HasSameFields<
  AccessTokensPostDto,
  AccessTokensPostValidationBodyErrorDto
> = true;
