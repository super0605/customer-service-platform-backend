import env from "./env";
import logger from "./logger";

export class AppError extends Error {
  name = "AppError";
}

export class UndefinedValueError extends AppError {
  name = "UndefinedValueError";
}

export class UnreachableError extends AppError {
  name = "UnreachableError";
}

export class NotImplementedError extends AppError {
  name = "NotImplementedError";
}

export function unreachable(_: never): void {
  const msg = "UnreachableError unreachable";
  if (env.THROW_ON_UNREACHABLE) {
    throw new UnreachableError(msg);
  } else {
    logger.error(msg, new UnreachableError(msg));
    return;
  }
}

type Empty<T> = {
  [P in keyof T]: never;
};

export function mustBeEmptyObject<T>(_: Empty<T>): void {
  // compile-time check
}
