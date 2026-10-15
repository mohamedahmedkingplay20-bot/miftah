import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

import {
  readUsers,
  writeUsers,
  hashPassword,
} from "@/app/api/_lib";

type ResetToken = {
  token: string;
  userId: string;
  expiresAt: number;
  used: boolean;
};

const file = path.join(
  process.cwd(),
  "data",
  "reset-tokens.json"
);

async function readTokens(): Promise<ResetToken[]> {
  try {
    return JSON.parse(
      await fs.readFile(file, "utf8")
    );
  } catch {
    return [];
  }
}

async function writeTokens(
  tokens: ResetToken[]
) {
  await fs.mkdir(path.dirname(file), {
    recursive: true,
  });

  await fs.writeFile(
    file,
    JSON.stringify(tokens, null, 2),
    "utf8"
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const token =
      typeof body?.token === "string"
        ? body.token.trim()
        : "";

    const password =
      typeof body?.password === "string"
        ? body.password
        : "";

    if (!token || !password) {
      return NextResponse.json(
        {
          error:
            "رابط الاستعادة وكلمة المرور مطلوبان.",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          error:
            "كلمة المرور لازم تكون 6 أحرف على الأقل.",
        },
        { status: 400 }
      );
    }

    const tokens = await readTokens();

    const resetToken = tokens.find(
      (item) =>
        item.token === token &&
        !item.used &&
        item.expiresAt > Date.now()
    );

    if (!resetToken) {
      return NextResponse.json(
        {
          error:
            "رابط الاستعادة منتهي أو غير صالح.",
        },
        { status: 400 }
      );
    }

    const users = await readUsers();

    const user = users.find(
      (item) =>
        item.id === resetToken.userId
    );

    if (!user) {
      return NextResponse.json(
        {
          error:
            "الحساب غير موجود.",
        },
        { status: 404 }
      );
    }

    user.passwordHash =
      await hashPassword(password);

    resetToken.used = true;

    await writeUsers(users);
    await writeTokens(tokens);

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(
      "RESET PASSWORD ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "حدث خطأ أثناء تغيير كلمة المرور.",
      },
      { status: 500 }
    );
  }
}