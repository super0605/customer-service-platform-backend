import { AppError } from "src/errors";

export class AuthError extends AppError {
  name = "AuthError";
}

export class AuthNoPermissionError extends AuthError {
  name = "AuthNoPermissionError";
  constructor(public scope: string) {
    super();
  }
}

export class AuthMalformedHeaderError extends AuthError {
  name = "AuthMalformedHeaderError";
}

export class AuthMissingHeaderError extends AuthError {
  name = "AuthMissingHeaderError";
}

export class AuthNoUserError extends AuthError {
  name = "AuthNoUserError";
  constructor(public userId: number) {
    super();
  }
}

export class AuthSuperAdminIsUntouchableError extends AuthError {
  name = "AuthSuperAdminIsUntouchableError";
}
