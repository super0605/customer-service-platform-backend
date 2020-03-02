import * as Boom from "@hapi/boom";
import * as assert from "assert";
import * as camelCase from "camelcase";
import * as express from "express";
import { ErrorRequestHandler } from "express";
import { flow } from "fp-ts/lib/function";
import * as M from "fp-ts/lib/Monoid";
import * as NEA from "fp-ts/lib/NonEmptyArray";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as httpStatusCodes from "http-status-codes";
import * as sequelize from "sequelize";
import {
  AuthError,
  AuthMalformedHeaderError,
  AuthMissingHeaderError,
  AuthNoPermissionError,
  AuthNoUserError
} from "src/auth";
import { ErrorDto, ErrorEntityNotFoundDto, ErrorValidationDto } from "src/dtos";
import env from "src/env";
import { unreachable } from "src/errors";
import logger from "src/logger";
import { ModelName } from "src/models";
import {
  ModelEntityNotFoundError,
  ModelForeignEntityNotFoundError
} from "src/models/errors";
import { groupBy, objectFromEntries } from "src/utils";
import {
  AppValidationBodyError,
  AppValidationError,
  AppValidationFieldErrors,
  AppValidationPathError,
  AppValidationQueryError,
  AppValidationRuleError,
  AppValidationSingleFieldErrors,
  monoidAppValidationFieldErrors
} from "src/validation";
import * as tsoa from "tsoa";

type WithoutStack<T> = Omit<T, "stack">;

function grabStatusCodeFromError(
  error: Error | tsoa.ValidateError | Boom.Boom
): number {
  // ######################
  // IMPORTANT NOTE: Boom must be first in the check since some libraries (like tsoa) automatically set the ".code" to 500 if there wasn't one.
  //      So if .code is the first thing you check, then you'd never arrive at .output.statusCode
  // ######################
  if (Boom.isBoom(error)) {
    return error.output.statusCode;
  }
  if (error instanceof tsoa.ValidateError) {
    return error.status;
  }
  if (error instanceof ModelEntityNotFoundError) {
    return httpStatusCodes.NOT_FOUND;
  }
  if (error instanceof AppValidationError) {
    return httpStatusCodes.BAD_REQUEST;
  }
  if (error instanceof AuthMalformedHeaderError) {
    return httpStatusCodes.BAD_REQUEST;
  }
  if (error instanceof AuthError) {
    return httpStatusCodes.UNAUTHORIZED;
  }
  if (error instanceof Error) {
    return httpStatusCodes.INTERNAL_SERVER_ERROR;
  } else {
    unreachable(error);
    return httpStatusCodes.INTERNAL_SERVER_ERROR;
  }
}

function grabMessageFromError(error: Error | Boom.Boom): string {
  if (error instanceof AuthNoPermissionError) {
    return `Security permission '${error.scope}' is required`;
  }
  if (error instanceof AuthMalformedHeaderError) {
    return "Malformed Authorization Header";
  }
  if (error instanceof AuthMissingHeaderError) {
    return "Authorization Header is missing";
  }
  if (error instanceof AuthNoUserError) {
    return `No user with id ${error.userId}`;
  }

  return error.message || error.name || "An error occurred";
}

function grabPayloadFromError(error: Error | Boom.Boom): object {
  if (error instanceof AuthNoPermissionError) {
    return {
      scope: error.scope
    };
  }
  if (error instanceof AuthNoUserError) {
    return {
      userId: error.userId
    };
  }

  return {};
}

function grabNameFromError(error: Error): string {
  return error.name;
}

// #region tsoa.ValidateError

const tryRequiredRule = (message: string) => (): O.Option<
  AppValidationRuleError
> => {
  const res = /'.*' is required/.exec(message);
  if (!res) return O.none;
  return O.some({ name: "isRequired", message: `required` });
};

const tryStringRule = (message: string) => (): O.Option<
  AppValidationRuleError
> =>
  message === "invalid string value"
    ? O.some({ message: "Invalid data", name: "isString" })
    : O.none;

const tryEnumRule = (message: string) => (): O.Option<AppValidationRuleError> =>
  message.startsWith("Should be one of the following")
    ? O.some({ message: "Invalid data", name: "isEnum" })
    : O.none;

const tryNumberRule = (message: string) => (): O.Option<
  AppValidationRuleError
> =>
  message === "invalid float value"
    ? O.some({ message: "Invalid data", name: "isNumber" })
    : O.none;

const tryIntegerRule = (message: string) => (): O.Option<
  AppValidationRuleError
> =>
  message === "invalid integer number"
    ? O.some({ message: "Invalid data", name: "isInteger" })
    : O.none;

const tryMinRule = (message: string) => (): O.Option<
  AppValidationRuleError
> => {
  const res = /min (.+)/.exec(message);
  if (!res) return O.none;
  const [, minStr] = res;
  const min = parseFloat(minStr);
  return O.some({
    name: "hasMin",
    min,
    message: `must have a minimum of ${min}`
  });
};

const tryMaxLengthRule = (message: string) => (): O.Option<
  AppValidationRuleError
> => {
  const res = /maxLength (.+)/.exec(message);
  if (!res) return O.none;
  const [, maxStr] = res;
  const maxLength = parseFloat(maxStr);
  return O.some({
    name: "hasMaxLength",
    maxLength,
    message: `must have a maximum length of ${maxLength}`
  });
};

const tryMinLengthRule = (message: string) => (): O.Option<
  AppValidationRuleError
> => {
  const res = /minLength (.+)/.exec(message);
  if (!res) return O.none;
  const [, minStr] = res;
  const minLength = parseFloat(minStr);
  return O.some({
    name: "hasMinLength",
    minLength,
    message: `must have a minimum length of ${minLength}`
  });
};

const tryDateRule = (message: string) => (): O.Option<AppValidationRuleError> =>
  message === "Invalid ISO 8601 date format, i.e. YYYY-MM-DD"
    ? O.some({ name: "isDate", message: `Invalid date format` })
    : O.none;

const tryBooleanRule = (message: string) => (): O.Option<
  AppValidationRuleError
> =>
  message === "invalid boolean value"
    ? O.some({ name: "isBoolean", message: "Invalid data" })
    : O.none;

const otherRule = (message: string) => (): AppValidationRuleError => ({
  message,
  name: "other"
});

function getRuleByErrorMessage(message: string): AppValidationRuleError {
  return pipe(
    [
      tryRequiredRule(message),
      tryStringRule(message),
      tryEnumRule(message),
      tryNumberRule(message),
      tryIntegerRule(message),
      tryMinRule(message),
      tryMaxLengthRule(message),
      tryMinLengthRule(message),
      tryDateRule(message),
      tryBooleanRule(message)
    ].reduce(
      (acc, curr) => O.alt(curr)(acc),
      O.none as O.Option<AppValidationRuleError>
    ),
    O.getOrElse(otherRule(message))
  );
}

function mapTsoaValidateFieldError({
  message,
  value
}: {
  message: string;
  value?: unknown;
}): AppValidationSingleFieldErrors {
  return {
    rules: [getRuleByErrorMessage(message)],
    value
  };
}

const tryTsoaValidateError = (
  request: express.Request,
  err: Error
) => (): O.Option<AppValidationError> => {
  if (!(err instanceof tsoa.ValidateError)) {
    return O.none;
  }

  const groups = groupBy(([k, v]) => {
    // TODO: this might be a bit naive implementation
    const res = /\w+\.(.*)/.exec(k);
    if (res) {
      const [, key] = res;
      return ["body", [key, mapTsoaValidateFieldError(v)]] as const;
    }
    if (request.query[k] != null) {
      return ["query", [k, mapTsoaValidateFieldError(v)]] as const;
    }
    return ["path", [k, mapTsoaValidateFieldError(v)]] as const;
  }, Object.entries(err.fields));

  if (groups.body && groups.body.length) {
    const fields = objectFromEntries(groups.body);
    return O.some(new AppValidationBodyError(fields));
  }

  if (groups.query && groups.query.length) {
    const fields = objectFromEntries(groups.query);
    return O.some(new AppValidationQueryError(fields));
  }

  if (groups.path && groups.path.length) {
    const fields = objectFromEntries(groups.path);
    return O.some(new AppValidationPathError(fields));
  }

  return O.none;
};
// #endregion
// #region sequelize.ValidationError

const tryUniqueRuleSequelize = (
  errorItem: sequelize.ValidationErrorItem
) => (): O.Option<AppValidationRuleError> => {
  if (errorItem.type !== "unique violation") return O.none;

  console.log("errorItem", errorItem);

  return O.some({
    name: "isUnique",
    message: errorItem.message
  });
};

const otherRuleSequelize = (
  errorItem: sequelize.ValidationErrorItem
) => (): AppValidationRuleError => {
  return {
    name: "other",
    message: errorItem.message
  };
};

function getRuleByErrorItem(
  errorItem: sequelize.ValidationErrorItem
): AppValidationRuleError {
  return pipe(
    O.none,
    O.alt(tryUniqueRuleSequelize(errorItem)),
    O.getOrElse(otherRuleSequelize(errorItem))
  );
}

const trySequelizeValidationError = (err: Error) => (): O.Option<
  AppValidationError
> => {
  if (!(err instanceof sequelize.ValidationError)) {
    return O.none;
  }

  function applyRules(
    errorItem: sequelize.ValidationErrorItem
  ): AppValidationFieldErrors {
    return {
      // HACK: sequelize reports path as fields from db, not model fields
      // ie. 'primary_email' instead of 'primaryEmail' so we apply camelCasination
      [camelCase(errorItem.path)]: {
        value: errorItem.value,
        rules: [getRuleByErrorItem(errorItem)]
      }
    };
  }

  return pipe(
    NEA.fromArray(err.errors),
    O.map(
      flow(
        NEA.map(applyRules),
        M.fold(monoidAppValidationFieldErrors),
        fields => new AppValidationBodyError(fields)
      )
    )
  );
};

function mapSequelizeForeignKeyConstraintError(
  err: sequelize.ForeignKeyConstraintError
): O.Option<AppValidationError> {
  // unfortunately sequelize reports very poorly on the foreign key failure,
  // so here is some mappings to report (hopefully) consistent namings

  function capitalize(str: string): string {
    if (str.length <= 0) {
      return str;
    }
    return str[0].toUpperCase() + str.slice(1);
  }

  function singularize(name: string): string {
    if (name.endsWith("xes")) return name.slice(0, name.length - 2);
    if (name.endsWith("s")) return name.slice(0, name.length - 1);
    return name;
  }

  function mapField(rawfield: string): string {
    const parts = rawfield.split("_");
    return camelCase(parts.map(p => singularize(p)));
  }

  function mapModelName(rawtable: string): ModelName {
    // TODO: any way to remove casting? or at least guard check
    return capitalize(singularize(rawtable)) as ModelName;
  }

  function mapValue(rawvalue: string): number | string {
    try {
      return parseInt(rawvalue);
    } catch (err) {
      return rawvalue;
    }
  }

  type WithOptionalDetail<T> = T & {
    detail?: string;
  };
  const originalWithDetails = err.original as WithOptionalDetail<
    typeof err.original
  >;
  const detail = originalWithDetails.detail;

  if (!detail) {
    return O.none;
  }

  const parsed = /Key \((\w+)\)=\((\w+)\) is not present in table "(\w+)"./.exec(
    detail
  );
  if (!parsed) {
    return O.none;
  }

  try {
    const [, rawfield, rawvalue, rawtable] = parsed;

    const value = mapValue(rawvalue);
    const field = mapField(rawfield);
    const modelName = mapModelName(rawtable);

    return O.some(
      new AppValidationBodyError({
        [field]: {
          value: value,
          rules: [
            {
              name: "foreignEntityExists",
              modelName: modelName,
              message: `Associated entity '${value}' of type '${modelName}' not found`
            }
          ]
        }
      })
    );
  } catch (_) {
    return O.none;
  }
}

const trySequelizeForeignKeyConstraintError = (err: Error) => (): O.Option<
  AppValidationError
> => {
  if (!(err instanceof sequelize.ForeignKeyConstraintError)) {
    return O.none;
  }

  return mapSequelizeForeignKeyConstraintError(err);
};

// #endregion

// #region ModelForeignEntityNotFoundError
function mapModelForeignEntityNotFoundError(
  err: ModelForeignEntityNotFoundError<Record<string, unknown>>
): AppValidationError {
  return new AppValidationBodyError({
    [err.field]: {
      value: err.id,
      rules: [
        {
          name: "foreignEntityExists",
          modelName: err.modelName,
          message: `Associated entity '${err.id}' of type '${err.modelName}' not found`
        }
      ]
    }
  });
}

const tryModelForeignEntityNotFoundError = (err: Error) => (): O.Option<
  AppValidationError
> => {
  if (!(err instanceof ModelForeignEntityNotFoundError)) {
    return O.none;
  }

  return O.some(mapModelForeignEntityNotFoundError(err));
};
// #endregion

const tryAppValidationError = (err: Error) => (): O.Option<
  AppValidationError
> => {
  if (!(err instanceof AppValidationError)) {
    return O.none;
  }

  return O.some(err);
};

function mapAppValidationError(err: AppValidationError): ErrorValidationDto {
  // TODO: fix any
  if (err instanceof AppValidationBodyError) {
    return {
      name: "ValidationError",
      type: "body",
      message: "Failed request body validation",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fields: err.fields as any
    };
  }
  if (err instanceof AppValidationPathError) {
    return {
      name: "ValidationError",
      type: "path",
      message: "Failed request path parameters validation",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fields: err.fields as any
    };
  }
  if (err instanceof AppValidationQueryError) {
    return {
      name: "ValidationError",
      type: "query",
      message: "Failed request query parameters validation",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fields: err.fields as any
    };
  }

  logger.warn("Unknown Validation Error, should not happen", err);
  return {
    name: "ValidationError",
    type: "other",
    message: err.message
  };
}

const tryValidationError = (
  request: express.Request,
  err: Error
) => (): O.Option<WithoutStack<ErrorDto>> => {
  return pipe(
    O.none,
    O.alt(tryAppValidationError(err)),
    O.alt(tryTsoaValidateError(request, err)),
    O.alt(trySequelizeValidationError(err)),
    O.alt(trySequelizeForeignKeyConstraintError(err)),
    O.alt(tryModelForeignEntityNotFoundError(err)),
    O.map(mapAppValidationError)
  );
};

// #region ModelEntityNotFoundError
function mapModelEntityNotFoundError(
  err: ModelEntityNotFoundError
): ErrorEntityNotFoundDto {
  return {
    name: err.name,
    message: `Entity '${err.id}' of type '${err.modelName}' is not found.`,
    id: err.id,
    modelName: err.modelName
  };
}

const tryModelEntityNotFoundError = (err: Error) => (): O.Option<
  WithoutStack<ErrorDto>
> => {
  if (!(err instanceof ModelEntityNotFoundError)) {
    return O.none;
  }

  return O.some(mapModelEntityNotFoundError(err));
};
// #endregion

const defaultError = (err: Error) => (): ErrorDto => {
  const name = grabNameFromError(err);
  const message = grabMessageFromError(err);
  const payload = grabPayloadFromError(err);

  return {
    name,
    message,
    ...payload
  };
};

const attachStack = (err: Error) => (
  partialDto: WithoutStack<ErrorDto>
): ErrorDto => ({
  ...partialDto,
  stack: env.EXPOSE_STACK ? err.stack : undefined
});

function mapToErrorDto(request: express.Request, err: Error): ErrorDto {
  return pipe(
    O.none,
    O.alt(tryValidationError(request, err)),
    O.alt(tryModelEntityNotFoundError(err)),
    O.getOrElse(defaultError(err)),
    attachStack(err)
  );
}

/**
 * Originated from https://github.com/lukeautry/tsoa/issues/382#issuecomment-516990535
 */
const errorMiddleware: ErrorRequestHandler = (err, req, res, _next) => {
  assert(err);
  const statusCode = grabStatusCodeFromError(err);
  const dto = mapToErrorDto(req, err);

  logger.error(dto.name, err, dto);
  res.status(statusCode);
  res.send(dto);
};

export default errorMiddleware;
