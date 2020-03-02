import * as express from "express";
import * as E from "fp-ts/lib/Either";
import { eqString } from "fp-ts/lib/Eq";
import { flow } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ordString } from "fp-ts/lib/Ord";
import { pipe } from "fp-ts/lib/pipeable";
import * as S from "fp-ts/lib/Set";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import * as uuidv4 from "uuid/v4";

const opendir = promisify(fs.readdir);
const readfile = promisify(fs.readFile);

interface TraverseItem {
  filename: string;
  content: string;
}

export function generateUuid(): string {
  return uuidv4();
}

/**
 *
 * @param dirpath
 * @param ext Must start with '.', example: '.sql'.
 * @example
 *
 * traverseDirectory(path.join(__dirname, "../migrations"), ".sql");
 */
export async function* traverseDirectory(
  dirpath: string,
  ext: string
): AsyncGenerator<TraverseItem> {
  const dir = await opendir(dirpath, { withFileTypes: true });
  for await (const dirent of dir) {
    if (!dirent.isFile()) {
      throw new Error("traversing is supported only on files.");
    }

    if (path.extname(dirent.name) !== ext) continue;
    const content = await readfile(path.join(dirpath, dirent.name), "utf8");

    yield {
      filename: dirent.name,
      content
    };
  }
}

export async function generatorToArray<T>(
  gen: AsyncGenerator<T>
): Promise<T[]> {
  const acc = [];
  for await (const t of gen) {
    acc.push(t);
  }
  return acc;
}

export function runEither<E, A>(v: E.Either<E, A>): A {
  return pipe(
    v,
    E.fold(
      e => {
        if (e instanceof Error) {
          throw e;
        } else {
          throw new Error(JSON.stringify(e));
        }
      },
      a => a
    )
  );
}

export function findFirstMissingEl<T>(arr: T[], subarray: T[]): O.Option<T> {
  for (const el of subarray) {
    if (arr.indexOf(el) === -1) {
      return O.some(el);
    }
  }
  return O.none;
}

export function hasDefinedValues(obj: object): boolean {
  const nonUndefinedKeys = Object.entries(obj).filter(
    ([_, value]) => value !== undefined
  );
  return nonUndefinedKeys.length > 0;
}

/**
 * Helpler type to check if two types has overlap.
 */
export type IsSameUnion<T1, T2> =
  | Exclude<T1, T2>
  | Exclude<T2, T1> extends never
  ? true
  : "Error: MUST BE SAME UNION" | Exclude<T1, T2> | Exclude<T2, T1>;

export function groupBy<T, V>(
  getHash: (t: T) => readonly [string, V],
  arr: T[]
): {
  [key: string]: V[];
};
export function groupBy<T, H extends string, V>(
  getHash: (t: T) => readonly [H, V],
  arr: T[]
): {
  [P in H]?: V[];
} {
  const dict: {
    [P in H]?: V[];
  } = {};

  const res = arr.reduce((acc, t) => {
    const [hash, v] = getHash(t);
    const accHash: V[] | undefined = acc[hash];
    const varr = accHash || [];
    varr.push(v);
    acc[hash] = varr;
    return acc;
  }, dict);

  return res;
}

export function objectFromEntries<K extends string, V>(
  arr: readonly (readonly [K, V])[]
): {
  [P in K]?: V;
} {
  const dict: {
    [P in K]?: V;
  } = {};

  const res = arr.reduce((acc, [k, v]) => {
    acc[k] = v;
    return acc;
  }, dict);

  return res;
}

export const uniquefyStringArray = flow(
  S.fromArray(eqString),
  S.toArray(ordString)
);

export const throwOnNone = <T>(onNone: () => never) => (o: O.Option<T>): T => {
  return O.getOrElse<T>(onNone)(o);
};

export const throwOnNull = <T>(onNone: () => never): ((input: T | null) => T) =>
  flow(O.fromNullable, throwOnNone(onNone));

export const promisifyRequestMiddleware = (
  middleware: express.RequestHandler
) => (request: express.Request): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dummyResponse = undefined as any;
  return new Promise((resolve, reject) => {
    middleware(request, dummyResponse, async error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};
