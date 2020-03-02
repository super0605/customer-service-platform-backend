import Seed from "./seed";

/**
 * Helper compile-time function to preserve EXACT input type while
 * enforcing a constraint that it must be an array of Seeds.
 */
export function getSeeds<T extends readonly Seed[]>(arr: T): typeof arr {
  return arr;
}

/**
 * Helper type to extract seed properties values as a separate type.
 */
type GetSeedPropType<T extends readonly Seed[], K> = {
  [P in keyof T]: T[P] extends Seed
    ? K extends keyof T[P]
      ? T[P][K]
      : never
    : never;
}[number];

/**
 * Helper type to extract seed names as a separate type.
 */
export type GetSeedNameType<T extends readonly Seed[]> = GetSeedPropType<
  T,
  "name"
>;

/**
 * Helper type to extract seed systemRoleName as a separate type.
 */
export type GetSeedSystemRoleNameType<
  T extends readonly Seed[]
> = GetSeedPropType<T, "systemRoleName">;

/**
 * Helper type to extract seed systemRoleNames as a separate type.
 */
export type GetSeedSystemRoleNamesType<
  T extends readonly Seed[]
> = GetSeedPropType<T, "systemRoleNames">;

/**
 * Helper type to extract seed systemPermissionName as a separate type.
 */
export type GetSeedSystemPermissionNameType<
  T extends readonly Seed[]
> = GetSeedPropType<T, "systemPermissionName">;

/**
 * Helper type to check if the type is union of literal strings or as broad as whole string type.
 */
export type EnforceLessThanString<T extends string> = string extends T
  ? "Error: SEEDS MUST NOT HAVE DYNAMIC STRINGS AS PROPERTY KEYS"
  : T;

/**
 * Helper type to check if two types has overlap.
 */
export type HasExtra<T, K> = T extends K
  ? false
  :
      | "Error: SYSTEM ROLES SHOULD BE EXPLICITLY DEFINED (NOT BY PERMISSION DEPENDENCIES)"
      | Exclude<T, K>;
