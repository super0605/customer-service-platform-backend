import { AuthorizedRequest } from "src/middlewares/auth";
import { SystemPermissionName } from "src/models/system-permission";
import SystemRole, { WithPermissions } from "src/models/system-role";
import { AuthNoPermissionError } from "./errors";

class SecurityManager {
  constructor(private permissions: SystemPermissionName[]) {}

  hasPermission(scope: SystemPermissionName): boolean {
    return this.permissions.indexOf(scope) !== -1;
  }
  ensurePermission(scope: SystemPermissionName): void {
    if (!this.hasPermission(scope)) {
      throw new AuthNoPermissionError(scope);
    }
  }
  ensurePermissions(scopes: SystemPermissionName[]): void {
    for (const scope of scopes) {
      this.ensurePermission(scope);
    }
  }
  ensureAtLeastOne(scopes: SystemPermissionName[]): void {
    // TODO: better error reporting
    if (scopes.length && !scopes.some(s => this.hasPermission(s))) {
      throw new AuthNoPermissionError(scopes[0]);
    }
  }
}

export function mkSecurityManager(request: AuthorizedRequest): SecurityManager;
export function mkSecurityManager(
  systemRole: SystemRole & WithPermissions
): SecurityManager;
export function mkSecurityManager(
  permissions: SystemPermissionName[]
): SecurityManager;
export function mkSecurityManager(
  input:
    | AuthorizedRequest
    | (SystemRole & WithPermissions)
    | SystemPermissionName[]
): SecurityManager {
  let permissions: SystemPermissionName[] = [];
  if (Array.isArray(input)) {
    permissions = input;
  } else if (input instanceof SystemRole) {
    permissions = input.systemPermissions.map(sp => sp.shortName);
  } else {
    permissions = input.user.systemRole.systemPermissions.map(
      sp => sp.shortName
    );
  }

  return new SecurityManager(permissions);
}
