import * as t from "io-ts";
import { Secret, sign, SignOptions, verify } from "jsonwebtoken";
import { promisify } from "util";
import env from "../env";
import { runEither } from "../utils";

export interface User {
  id: number;
}

const JwtTokenPayload = t.type({
  id: t.number
});
export type JwtTokenPayload = t.TypeOf<typeof JwtTokenPayload>;

async function asyncSign(
  payload: string | Buffer | object,
  secretOrPrivateKey: Secret,
  options?: SignOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (options) {
      sign(payload, secretOrPrivateKey, options, (err, encoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(encoded);
        }
      });
    } else {
      sign(payload, secretOrPrivateKey, (err, encoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(encoded);
        }
      });
    }
  });
}
const asyncVerify = promisify(verify);

function getTokenPayload(user: User): JwtTokenPayload {
  return {
    id: user.id
  };
}

export async function generateAccessToken(user: User): Promise<string> {
  const payload = getTokenPayload(user);

  const accessToken = (await asyncSign(payload, env.JWT_SECRET, {
    noTimestamp: true
  })) as string;

  return accessToken;
}

export async function parseAccessToken(
  accessToken: string
): Promise<JwtTokenPayload> {
  const raw = await asyncVerify(accessToken, env.JWT_SECRET);
  const payload = JwtTokenPayload.decode(raw);

  return runEither(payload);
}
