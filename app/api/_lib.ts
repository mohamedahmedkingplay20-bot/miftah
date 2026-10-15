import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";

export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  language: "ar" | "en";
  category: string;
  role: string;
  profile: Record<string, unknown>;
  xp: number;
  premiumDiscount: number;
  discountClaimed: boolean;
  createdAt: string;
};

const file = path.join(process.cwd(), "data", "users.json");

export async function readUsers(): Promise<User[]> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return [];
  }
}

export async function writeUsers(users: User[]) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(users, null, 2), "utf8");
}

export function publicUser(u: User) {
  const { passwordHash, ...safe } = u;
  return safe;
}

export function tokenFor(id: string) {
  const secret = process.env.MIFTAH_SESSION_SECRET || "miftah-dev-secret";
  const payload = `${id}.${Date.now()}`;
  const sig = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function userIdFromToken(token?: string | null) {
  if (!token) return null;

  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const [id, time, sig] = raw.split(".");

    if (!id || !time || !sig) return null;

    const secret = process.env.MIFTAH_SESSION_SECRET || "miftah-dev-secret";
    const payload = `${id}.${time}`;

    const expected = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    if (sig.length !== expected.length) return null;

    if (
      !crypto.timingSafeEqual(
        Buffer.from(sig),
        Buffer.from(expected)
      )
    ) {
      return null;
    }

    if (Date.now() - Number(time) > 1000 * 60 * 60 * 24 * 30) {
      return null;
    }

    return id;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function checkPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
