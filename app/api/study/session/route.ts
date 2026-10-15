import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { readUsers, userIdFromToken, writeUsers } from "@/app/api/_lib";

const SESSION_FILE = path.join(process.cwd(), "data", "study-sessions.json");
const ALLOWED_MINUTES = [5, 10, 15, 20, 25, 30, 45, 60];

type StudySession = {
  id: string;
  userId: string;
  startedAt: number;
  durationMinutes: number;
  completedAt?: number;
  cancelledAt?: number;
};

async function readSessions(): Promise<StudySession[]> {
  try {
    return JSON.parse(await fs.readFile(SESSION_FILE, "utf8")) as StudySession[];
  } catch {
    return [];
  }
}

async function writeSessions(sessions: StudySession[]) {
  await fs.mkdir(path.dirname(SESSION_FILE), { recursive: true });
  await fs.writeFile(SESSION_FILE, JSON.stringify(sessions, null, 2), "utf8");
}

function getUserId(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  const token = cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("miftah_session="))
    ?.split("=")
    .slice(1)
    .join("=");
  return userIdFromToken(token);
}

const nextTasks = [
  { id: 1, title: "جلسة تركيز", description: "راجع نقطة واحدة من درسك واكتب أهم 3 أفكار." },
  { id: 2, title: "تدريب سريع", description: "حل مسألة أو سؤالين على الجزء اللي ذاكرته." },
  { id: 3, title: "مراجعة ذكية", description: "اقرأ ملاحظاتك وحاول تشرح الدرس لنفسك." },
  { id: 4, title: "تثبيت المعلومات", description: "اكتب من ذاكرتك أهم المعلومات ثم راجع إجاباتك." },
  { id: 5, title: "تحدي التركيز", description: "ابعد المشتتات وكمّل جزءًا صغيرًا من هدفك الدراسي." },
];

export async function POST(request: Request) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "سجّل الدخول أولًا لحفظ XP." }, { status: 401 });
    }

    const body = await request.json();
    const action = String(body?.action || "");
    const sessions = await readSessions();
    const now = Date.now();

    if (action === "start") {
      const durationMinutes = Number(body?.durationMinutes ?? 15);
      if (!ALLOWED_MINUTES.includes(durationMinutes)) {
        return NextResponse.json({ error: "مدة المذاكرة المختارة غير صحيحة." }, { status: 400 });
      }

      for (const session of sessions) {
        if (session.userId === userId && !session.completedAt && !session.cancelledAt) {
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
      return NextResponse.json({ ok: true, sessionId: session.id, startedAt: session.startedAt, durationMinutes });
    }

    if (action === "cancel") {
      const sessionId = String(body?.sessionId || "");
      const session = sessions.find((item) => item.id === sessionId && item.userId === userId);
      if (session && !session.completedAt) session.cancelledAt = now;
      await writeSessions(sessions);
      return NextResponse.json({ ok: true });
    }

    if (action !== "finish") {
      return NextResponse.json({ error: "طلب غير صحيح." }, { status: 400 });
    }

    const sessionId = String(body?.sessionId || "");
    const session = sessions.find((item) => item.id === sessionId && item.userId === userId);
    if (!session) return NextResponse.json({ error: "جلسة المذاكرة غير موجودة. ابدأ جلسة جديدة." }, { status: 404 });
    if (session.cancelledAt) return NextResponse.json({ error: "الجلسة دي اتلغت. ابدأ جلسة جديدة." }, { status: 400 });
    if (session.completedAt) return NextResponse.json({ error: "تم احتساب XP للجلسة دي بالفعل." }, { status: 409 });

    const durationMinutes = ALLOWED_MINUTES.includes(Number(session.durationMinutes)) ? Number(session.durationMinutes) : 15;
    const requiredMs = durationMinutes * 60_000;
    const elapsed = now - session.startedAt;
    if (elapsed < requiredMs) {
      const remaining = Math.ceil((requiredMs - elapsed) / 1000);
      return NextResponse.json({ error: `لسه وقت الجلسة مخلصش. باقي ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}.` }, { status: 400 });
    }
    if (elapsed > 6 * 60 * 60 * 1000) {
      return NextResponse.json({ error: "الجلسة قديمة جدًا. ابدأ جلسة جديدة عشان تحتسب XP." }, { status: 400 });
    }

    const users = await readUsers();
    const user = users.find((item) => item.id === userId);
    if (!user) return NextResponse.json({ error: "الحساب غير موجود." }, { status: 404 });

    // Award XP only after server-verified completion; never through the generic XP endpoint.
    user.xp = Math.max(0, Number(user.xp) || 0) + 10;
    session.completedAt = now;
    await writeUsers(users);
    await writeSessions(sessions);

    const task = nextTasks[Math.floor(Math.random() * nextTasks.length)];
    return NextResponse.json({ ok: true, added: 10, xp: user.xp, task });
  } catch (error) {
    console.error("STUDY SESSION ERROR:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء حفظ جلسة المذاكرة وXP." }, { status: 500 });
  }
}
