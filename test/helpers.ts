// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./global.d.ts" />

import * as path from "path";
import { App, mkApp } from "src/app";
import { mkSequelize } from "src/sequelize";

export const tsoaBuildDir = path.join(__dirname, "../build/test");
export const iocModulePath = path.join(__dirname, "./setup/ioc-register.ts");

/**
 * DO NOT call this function anywhere except `.e2e.ts` files.
 */
export function mkTestApp(): App {
  if (!global.__PGCONNSTRING__) {
    throw new Error(
      `Can't find global.__PGCONNSTRING__. Make sure you call this function inside '.e2e.ts' instead of '.test.ts'.`
    );
  }
  return mkApp({
    sequelize: mkSequelize(global.__PGCONNSTRING__),
    tsoaBuildDir
  });
}

export const baseApiUrl = "/v1";

export function getAuthHeader(accessToken: string): string {
  return `Bearer ${accessToken}`;
}

export function beforeAllWithCatch(fn: () => Promise<void>): void {
  beforeAll(async () => {
    try {
      await fn();
    } catch (err) {
      // eslint-disable-next-line no-debugger
      // TODO: remove it after catching that pesky unique validation error
      if (err.original) {
        console.error(err.original);
      }
      throw err;
    }
  });
}
