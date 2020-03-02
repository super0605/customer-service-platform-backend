import * as crypto from "crypto";
import { promisify } from "util";
import { generate } from "generate-password";

export interface PasswordObj {
  passwordHash: string;
  salt: string;
}

const asyncPbkdf2 = promisify(crypto.pbkdf2);
const passLength = 20;

export function generatePassword(): string {
  return generate();
}

export async function generatePasswordHash(
  salt: string,
  password: string
): Promise<string> {
  const encoded = await asyncPbkdf2(password, salt, 1, passLength, "sha1");
  const passwordHash = encoded.toString("hex");
  return passwordHash;
}

export async function generatePasswordHashWithSalt(
  password: string
): Promise<PasswordObj> {
  const salt = crypto.randomBytes(passLength).toString("base64");
  const passwordHash = await generatePasswordHash(salt, password);
  return {
    salt,
    passwordHash
  };
}

export async function comparePasswordWithHash(
  salt: string,
  passwordHash: string,
  password: string
): Promise<boolean> {
  const passwordHash2 = await generatePasswordHash(salt, password);
  return passwordHash === passwordHash2;
}
