import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

import { readUsers } from "@/app/api/_lib";
import { sendPasswordResetEmail } from "@/lib/mailer";

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

async function readTokens() {
  try {
    const data =
      await fs.readFile(
        file,
        "utf8"
      );

    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeTokens(
  tokens: ResetToken[]
) {
  await fs.mkdir(
    path.dirname(file),
    { recursive: true }
  );

  await fs.writeFile(
    file,
    JSON.stringify(
      tokens,
      null,
      2
    ),
    "utf8"
  );
}

export async function POST(
  req: Request
) {
  try {
    const body =
      await req.json();

    const email =
      typeof body?.email ===
      "string"
        ? body.email
            .trim()
            .toLowerCase()
        : "";

    if (!email) {
      return NextResponse.json(
        {
          error:
            "اكتب البريد الإلكتروني.",
        },
        { status: 400 }
      );
    }

    const users =
      await readUsers();

    const user =
      users.find(
        (item) =>
          item.email
            .toLowerCase() ===
          email
      );

    if (!user) {
      return NextResponse.json({
        ok: true,
      });
    }

    const token =
      crypto.randomBytes(32)
        .toString("hex");

    const tokens =
      await readTokens();

    const now = Date.now();

    const cleanTokens =
      tokens.filter(
        (item: ResetToken) =>
          !item.used &&
          item.expiresAt >
            now
      );

    cleanTokens.push({
      token,
      userId: user.id,
      expiresAt:
        now +
        15 * 60 * 1000,
      used: false,
    });

    await writeTokens(
      cleanTokens
    );

    /*
      مهم:
      للموبايل لازم يكون URL عام،
      مش localhost.
    */

    const appUrl =
      process.env
        .MIFTAH_PUBLIC_URL ||
      process.env
        .NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const resetUrl =
      `${appUrl}/reset-password?token=${encodeURIComponent(
        token
      )}`;

    await sendPasswordResetEmail(
      user.email,
      resetUrl
    );

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(
      "FORGOT PASSWORD:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "فشل إرسال الإيميل.",
      },
      { status: 500 }
    );
  }
}