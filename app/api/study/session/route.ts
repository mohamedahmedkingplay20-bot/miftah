import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import {
  readUsers,
  userIdFromToken,
  writeUsers,
} from "../../_lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SESSION_FILE = path.join(
  process.cwd(),
  "data",
  "study-sessions.json"
);

const ALLOWED_MINUTES = [5, 10, 15, 20, 25, 30, 45, 60];
const MAX_SESSION_AGE_MS = 6 * 60 * 60 * 1000;

type StudySession = {
  id: string;
  userId: string;
  startedAt: number;
  durationMinutes: number;
  completedAt?: number;
  cancelledAt?: number;
};

const nextTasks = [
  {
    id: 1,
    title: "جلسة تركيز",
    description: "راجع نقطة واحدة من درسك واكتب أهم 3 أفكار.",
  },
  {
    id: 2,
    title: "تدريب سريع",
    description: "حل مسألة أو سؤالين على الجزء اللي ذاكرته.",
  },
  {
    id: 3,
    title: "مراجعة ذكية",
    description: "اقرأ ملاحظاتك وحاول تشرح الدرس لنفسك.",
  },
  {
    id: 4,
    title: "تثبيت المعلومات",
    description: "اكتب من ذاكرتك أهم المعلومات ثم راجع إجاباتك.",
  },
  {
    id: 5,
    title: "تحدي التركيز",
    description: "ابعد المشتتات وكمّل جزءًا صغيرًا من هدفك الدراسي.",
  },
];

function reply(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function errorCode(error: unknown): string | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error
  ) {
    return String((error as { code?: unknown }).code ?? "");
  }

  return undefined;
}

async function readSessions(): Promise<StudySession[]> {
  try {
    const text = await fs.readFile(SESSION_FILE, "utf8");
    const parsed: unknown = JSON.parse(text);

    if (!Array.isArray(parsed)) {
      throw new Error("Study sessions file is not an array.");
    }

    return parsed as StudySession[];
  } catch (error) {
    if (errorCode(error) === "ENOENT") return [];
    throw error;
  }
}

async function writeSessions(sessions: StudySession[]) {
  await fs.mkdir(path.dirname(SESSION_FILE), {
    recursive: true,
  });

  // Prevent a partially-written JSON file.
  const temporaryFile = `${SESSION_FILE}.${randomUUID()}.tmp`;

  try {
    await fs.writeFile(
      temporaryFile,
      JSON.stringify(sessions, null, 2),
      "utf8"
    );

    await fs.rename(temporaryFile, SESSION_FILE);
  } catch (error) {
    try {
      await fs.unlink(temporaryFile);
    } catch {
      // Temporary file may not exist.
    }

    throw error;
  }
}

async function getCurrentUserId() {
  const cookieStore = await cookies();
  return userIdFromToken(
    cookieStore.get("miftah_session")?.value
  );
}

function randomTask() {
  return nextTasks[Math.floor(Math.random() * nextTasks.length)];
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return reply(
        { error: "سجّل الدخول أولًا لحفظ جلسة المذاكرة وXP." },
        401
      );
    }

    let body: Record<string, unknown>;

    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return reply({ error: "بيانات الطلب غير صحيحة." }, 400);
    }

    const action = String(body.action ?? "");
    const sessions = await readSessions();
    const now = Date.now();

    if (action === "start") {
      const durationMinutes = Number(body.durationMinutes ?? 15);

      if (
        !Number.isInteger(durationMinutes) ||
        !ALLOWED_MINUTES.includes(durationMinutes)
      ) {
        return reply(
          { error: "اختار مدة مذاكرة صحيحة." },
          400
        );
      }

      const users = await readUsers();
      const userExists = users.some((user) => user.id === userId);

      if (!userExists) {
        return reply({ error: "الحساب غير موجود." }, 404);
      }

      // Cancel any unfinished sessions belonging to this user.
      for (const session of sessions) {
        if (
          session.userId === userId &&
          !session.completedAt &&
          !session.cancelledAt
        ) {
          session.cancelledAt = now;
        }
      }

      const session: StudySession = {
        id: randomUUID(),
        userId,
        startedAt: now,
        durationMinutes,
      };

      sessions.push(session);
      await writeSessions(sessions);

      return reply({
        ok: true,
        sessionId: session.id,
        startedAt: session.startedAt,
        durationMinutes: session.durationMinutes,
      });
    }

    if (action === "cancel") {
      const sessionId = String(body.sessionId ?? "");

      const session = sessions.find(
        (item) =>
          item.id === sessionId &&
          item.userId === userId
      );

      if (session && !session.completedAt && !session.cancelledAt) {
        session.cancelledAt = now;
        await writeSessions(sessions);
      }

      return reply({ ok: true });
    }

    if (action !== "finish") {
      return reply({ error: "نوع الطلب غير صحيح." }, 400);
    }

    const sessionId = String(body.sessionId ?? "");

    const session = sessions.find(
      (item) =>
        item.id === sessionId &&
        item.userId === userId
    );

    if (!session) {
      return reply(
        { error: "جلسة المذاكرة غير موجودة. ابدأ جلسة جديدة." },
        404
      );
    }

    if (session.cancelledAt) {
      return reply(
        { error: "الجلسة دي اتلغت. ابدأ جلسة جديدة." },
        400
      );
    }

    if (session.completedAt) {
      return reply(
        { error: "تم احتساب مكافأة الجلسة دي بالفعل." },
        409
      );
    }

    if (
      !Number.isFinite(session.startedAt) ||
      session.startedAt > now
    ) {
      return reply(
        { error: "وقت بداية الجلسة غير صحيح." },
        400
      );
    }

    const durationMinutes = Number(session.durationMinutes);

    if (!ALLOWED_MINUTES.includes(durationMinutes)) {
      return reply(
        { error: "مدة الجلسة المسجلة غير صحيحة." },
        400
      );
    }

    const requiredMs = durationMinutes * 60_000;
    const elapsedMs = now - session.startedAt;

    if (elapsedMs < requiredMs) {
      const remainingSeconds = Math.ceil(
        (requiredMs - elapsedMs) / 1000
      );

      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = String(remainingSeconds % 60).padStart(2, "0");

      return reply(
        {
          error: `لسه وقت الجلسة مخلصش. باقي ${minutes}:${seconds}.`,
          remainingSeconds,
        },
        400
      );
    }

    if (elapsedMs > MAX_SESSION_AGE_MS) {
      return reply(
        {
          error: "الجلسة قديمة جدًا. ابدأ جلسة جديدة عشان تحتسب XP.",
        },
        400
      );
    }

    const users = await readUsers();
    const user = users.find((item) => item.id === userId);

    if (!user) {
      return reply({ error: "الحساب غير موجود." }, 404);
    }

    // A per-user ledger prevents XP being awarded twice if saving
    // the session record fails after the user record was saved.
    const mutableUser = user as unknown as Record<string, unknown>;

    const ledger = Array.isArray(mutableUser.studySessionRewards)
      ? mutableUser.studySessionRewards.filter(
          (value): value is string => typeof value === "string"
        )
      : [];

    if (!ledger.includes(session.id)) {
      user.xp = Math.max(0, Number(user.xp) || 0) + 10;

      mutableUser.studySessionRewards = [
        ...ledger,
        session.id,
      ].slice(-2000);

      await writeUsers(users);
    }

    session.completedAt = now;
    await writeSessions(sessions);

    return reply({
      ok: true,
      added: 10,
      xp: Math.max(0, Number(user.xp) || 0),
      task: randomTask(),
    });
  } catch (error) {
    console.error("STUDY SESSION ERROR:", error);

    return reply(
      {
        error:
          "تعذر حفظ جلسة المذاكرة. راجع سجل السيرفر؛ قد تكون المشكلة في صلاحيات التخزين أو قاعدة البيانات.",
      },
      500
    );
  }
}