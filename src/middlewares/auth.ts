import * as assert from "assert";
import * as express from "express";
import { mkSecurityManager, parseAccessToken } from "src/auth";
import {
  AuthMalformedHeaderError,
  AuthMissingHeaderError,
  AuthNoUserError
} from "src/auth/errors";
import { User } from "src/models";
import { SystemPermissionName } from "src/models/system-permission";
import { WithPassword } from "src/models/user";

export type AuthorizedRequest = express.Request & {
  user: User & WithPassword;
};

const regex = /Bearer (.*)/;

function parseAuthHeader(authHeader?: string): string {
  if (!authHeader) {
    throw new AuthMissingHeaderError();
  }
  const res = regex.exec(authHeader);
  if (!res || res.length < 2) {
    throw new AuthMalformedHeaderError();
  }
  const token = res[1];
  return token;
}

export async function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[]
): Promise<User & WithPassword> {
  assert.equal(securityName, "AuthorizationHeaderBearer");

  const authHeader = request.header("authorization");
  const accessToken = parseAuthHeader(authHeader);
  const { id } = await parseAccessToken(accessToken);

  const user = await User.withPasswordFindByPk(id);
  if (!user) {
    throw new AuthNoUserError(id);
  }

  if (scopes) {
    const securityManager = mkSecurityManager(user.systemRole);
    // forcing a cast as we can't tell tsoa to validate against our type
    securityManager.ensurePermissions(scopes as SystemPermissionName[]);
  }

  return user;
}
