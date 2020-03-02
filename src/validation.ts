import * as A from "fp-ts/lib/Array";
import * as M from "fp-ts/lib/Monoid";
import * as O from "fp-ts/lib/Option";
import * as R from "fp-ts/lib/Record";
import * as S from "fp-ts/lib/Semigroup";
import { AppError } from "./errors";
import { ModelName } from "./models";

export class AppValidationError extends AppError {
  name = "AppValidationError";
}

interface BaseRule {
  name: string;
  message: string;
}

export interface IsRequiredRule extends BaseRule {
  name: "isRequired";
}

export interface ForeignEntityExistsRule extends BaseRule {
  name: "foreignEntityExists";
  modelName: ModelName;
}

export interface HasMinRule extends BaseRule {
  name: "hasMin";
  min: number;
}

export interface HasMaxLengthRule extends BaseRule {
  name: "hasMaxLength";
  maxLength: number;
}

export interface HasMinLengthRule extends BaseRule {
  name: "hasMinLength";
  minLength: number;
}

export interface IsStringRule extends BaseRule {
  name: "isString";
}

export interface IsNumberRule extends BaseRule {
  name: "isNumber";
}

export interface IsIntegerRule extends BaseRule {
  name: "isInteger";
}

export interface IsEnumRule extends BaseRule {
  name: "isEnum";
}

export interface IsDateRule extends BaseRule {
  name: "isDate";
}

export interface IsDateTimeRule extends BaseRule {
  name: "isDateTime";
}

export interface IsBooleanRule extends BaseRule {
  name: "isBoolean";
}

export interface IsUniqueRule extends BaseRule {
  name: "isUnique";
}

export interface OtherRule extends BaseRule {
  name: "other";
}

// TODO: add datetime tsoa validation conversion

export type AppValidationRuleError =
  | IsRequiredRule
  | ForeignEntityExistsRule
  | HasMinRule
  | HasMaxLengthRule
  | HasMinLengthRule
  | IsStringRule
  | IsNumberRule
  | IsIntegerRule
  | IsEnumRule
  | IsDateRule
  | IsDateTimeRule
  | IsBooleanRule
  | IsUniqueRule
  | OtherRule;

export type AppValidationRuleName = AppValidationRuleError["name"];

interface IndexedByString {
  [key: string]: unknown;
}

export type AppValidationSingleFieldErrors = {
  rules: AppValidationRuleError[];
  value: unknown;
};

const semigroupAppValidationSingleFieldErrors: S.Semigroup<AppValidationSingleFieldErrors> = S.getStructSemigroup(
  {
    value: S.getFirstSemigroup(),
    rules: A.getMonoid()
  }
);
const monoidOptionAppValidationSingleFieldErrors: M.Monoid<O.Option<
  AppValidationSingleFieldErrors
>> = O.getMonoid(semigroupAppValidationSingleFieldErrors);

export type AppValidationFieldErrors<T = IndexedByString> = {
  [P in keyof T]?: AppValidationSingleFieldErrors;
};

export const monoidAppValidationFieldErrors: M.Monoid<AppValidationFieldErrors> = R.getMonoid(
  {
    concat: (x, y) =>
      O.toUndefined(
        monoidOptionAppValidationSingleFieldErrors.concat(
          O.fromNullable(x),
          O.fromNullable(y)
        )
      )
  }
);

export class AppValidationBodyError<
  T = IndexedByString
> extends AppValidationError {
  name = "AppValidationBodyError";
  constructor(public fields: AppValidationFieldErrors<T>) {
    super();
  }
}

export class AppValidationQueryError<
  T = IndexedByString
> extends AppValidationError {
  name = "AppValidationQueryError";
  constructor(public fields: AppValidationFieldErrors<T>) {
    super();
  }
}

export class AppValidationPathError<
  T = IndexedByString
> extends AppValidationError {
  name = "AppValidationPathError";
  constructor(public fields: AppValidationFieldErrors<T>) {
    super();
  }
}
