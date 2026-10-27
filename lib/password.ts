import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;
const SALT_BYTES = 16;
const PREFIX = "scrypt";

/**
 * Hash a password with a random salt. The stored format is:
 *   scrypt$<salt-hex>$<derived-key-hex>
 *
 * scrypt is intentionally memory-hard and is part of Node.js, so credentials
 * auth does not require a native bcrypt dependency.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES).toString("hex");
  const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return `${PREFIX}$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const parts = storedHash.split("$");
  if (parts.length !== 3 || parts[0] !== PREFIX) return false;

  const [, salt, hash] = parts;
  if (!salt || !hash) return false;

  try {
    const expected = Buffer.from(hash, "hex");
    if (expected.length !== KEY_LENGTH) return false;

    const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}
