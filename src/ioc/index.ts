import { injectable, interfaces } from "inversify";
import { fluentProvide } from "inversify-binding-decorators";

export { injectable };

/* eslint-disable @typescript-eslint/no-explicit-any */
export function provideSingleton(
  identifier:
    | string
    | symbol
    | interfaces.Newable<any>
    | interfaces.Abstract<any>
): any {
  return fluentProvide(identifier)
    .inSingletonScope()
    .done();
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const provideController = provideSingleton;
