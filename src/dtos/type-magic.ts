import { IsSameUnion } from "src/utils";
import { AppValidationRuleError } from "src/validation";
import { ErrorValidationFieldDto } from "./error-validation";

interface WithFields {
  fields: {
    [field: string]: ErrorValidationFieldDto<AppValidationRuleError>;
  };
}

type GetFieldNameType<T extends WithFields> = Extract<
  keyof T["fields"],
  string
>;

type GetFieldNameTypeFromDto<T> = Extract<keyof T, string>;

// TODO: get better error message for when field is there but it is not optional
type GetPropNameTypeForPossiblyUndefined<T> = {
  [P in keyof T]-?: undefined extends T[P] ? P : never;
}[keyof T];

/**
 * Helper type to check if two types has overlap and ensures ErrorDto has all fields optional.
 */
export type HasSameFields<
  TModelDto,
  TErrorValidationDto extends WithFields
> = IsSameUnion<
  GetFieldNameTypeFromDto<TModelDto>,
  Extract<
    GetFieldNameType<TErrorValidationDto>,
    GetPropNameTypeForPossiblyUndefined<TErrorValidationDto["fields"]>
  >
>;
