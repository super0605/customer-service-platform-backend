import { AppValidationRuleError } from "src/validation";
import ErrorDto from "./error";

/**
 * Can't use this type as property for DTOs, it got replaced with any.
 */
export type ErrorValidationFieldDto<T extends AppValidationRuleError> =
  | {
      rules: T[];
      // TODO: any is displayed not pretty in the swagger
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value?: any;
    }
  | undefined;

export interface ErrorValidationBodyDto extends ErrorDto {
  name: "ValidationError";
  type: "body";
  fields: {
    [field: string]: ErrorValidationFieldDto<AppValidationRuleError>;
  };
}

export interface ErrorValidationPathDto extends ErrorDto {
  name: "ValidationError";
  type: "path";
  fields: {
    [field: string]: ErrorValidationFieldDto<AppValidationRuleError>;
  };
}

export interface ErrorValidationQueryDto extends ErrorDto {
  name: "ValidationError";
  type: "query";
  fields: {
    [field: string]: ErrorValidationFieldDto<AppValidationRuleError>;
  };
}

export interface ErrorValidationOtherDto extends ErrorDto {
  name: "ValidationError";
  type: "other";
}

export type ErrorValidationDto =
  | ErrorValidationBodyDto
  | ErrorValidationPathDto
  | ErrorValidationQueryDto
  | ErrorValidationOtherDto;
