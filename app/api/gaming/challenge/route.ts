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
  "gaming-sessions.json"
);

const SESSION_LIFETIME_MS = 3 * 60 * 60 * 1000;
const QUESTION_COUNT = 10;

type SeedQuestion = {
  q: string;
  correct: string;
  wrong: [string, string, string];
};

type ChallengeQuestion = {
  q: string;
  answers: string[];
  correctIndex: number;
};

type ChallengeSession = {
  id: string;
  userId: string;
  questions: ChallengeQuestion[];
  createdAt: number;
  completedAt?: number;
  score?: number;
  xpAdded?: number;
};

const BANK: SeedQuestion[] = [
  {
    q: "ما معنى FPS في الألعاب؟",
    correct: "إطارات في الثانية",
    wrong: ["نقاط اللاعب", "سرعة الإنترنت", "نوع كرت الشاشة"],
  },
  {
    q: "أي لعبة من Roblox؟",
    correct: "Blox Fruits",
    wrong: ["Minecraft", "FIFA", "Fortnite"],
  },
  {
    q: "ما المقصود بـ Ping؟",
    correct: "زمن الاستجابة",
    wrong: ["حجم الرام", "حجم الشاشة", "عدد اللاعبين"],
  },
  {
    q: "ما الوظيفة الأساسية لكرت الشاشة GPU؟",
    correct: "معالجة الرسوميات",
    wrong: ["حفظ كلمات السر", "توصيل الإنترنت", "تشغيل الصوت فقط"],
  },
  {
    q: "ماذا تعني HP غالبًا في الألعاب؟",
    correct: "Health Points",
    wrong: ["High Power", "Hyper Player", "Hard Play"],
  },
  {
    q: "ما الذي يساعد عادةً على رفع FPS؟",
    correct: "خفض بعض إعدادات الرسوميات",
    wrong: ["رفع صوت اللعبة", "تكبير الشاشة فقط", "تغيير اسم اللاعب"],
  },
  {
    q: "ما وظيفة لوحة المفاتيح؟",
    correct: "إدخال الأوامر والنصوص",
    wrong: ["عرض الصور", "طباعة الأوراق", "توصيل الإنترنت"],
  },
  {
    q: "ما أفضل تصرف عند رؤية رابط جائزة مشبوه؟",
    correct: "التحقق وعدم مشاركة البيانات",
    wrong: ["إدخال كلمة المرور فورًا", "إرسال الرابط للجميع", "تعطيل الحماية"],
  },
  {
    q: "ما فائدة الحفظ في اللعبة؟",
    correct: "استكمال التقدم لاحقًا",
    wrong: ["زيادة سرعة الإنترنت", "زيادة حجم الشاشة", "تبريد المعالج"],
  },
  {
    q: "أي جهاز يخزن ملفات اللعبة بصورة دائمة؟",
    correct: "SSD أو HDD",
    wrong: ["RAM فقط", "المروحة", "الماوس"],
  },
  {
    q: "ما الذي يستخدم غالبًا للتحكم في الشخصية على الكمبيوتر؟",
    correct: "الكيبورد والماوس أو يد التحكم",
    wrong: ["الطابعة", "الراوتر فقط", "السماعات فقط"],
  },
  {
    q: "ما معنى اللعب الجماعي Online؟",
    correct: "اللعب عبر الشبكة أو الإنترنت مع آخرين",
    wrong: ["اللعب بدون جهاز", "اللعب بلا اتصال دائمًا", "مشاهدة صورة ثابتة"],
  },
  {
    q: "أي خيار يساعد على حماية حساب الألعاب؟",
    correct: "كلمة مرور قوية وعدم مشاركتها",
    wrong: ["مشاركة رمز الدخول", "استخدام 123456", "تعطيل التحديثات"],
  },
  {
    q: "ما وظيفة الراوتر؟",
    correct: "توجيه الاتصال بين الأجهزة والشبكة",
    wrong: ["تشغيل اللعبة بدل الكمبيوتر", "زيادة مساحة القرص", "تبريد كرت الشاشة"],
  },
  {
    q: "أي مما يلي من وحدات الإخراج؟",
    correct: "الشاشة",
    wrong: ["لوحة المفاتيح", "الماوس", "الميكروفون"],
  },
  {
    q: "ما وظيفة RAM؟",
    correct: "تخزين مؤقت للبيانات أثناء التشغيل",
    wrong: ["تخزين الملفات للأبد", "عرض الصور بدل الشاشة", "توصيل كابل الإنترنت"],
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

function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

async function readSessions(): Promise<ChallengeSession[]> {
  try {
    const text = await fs.readFile(SESSION_FILE, "utf8");
    const parsed: unknown = JSON.parse(text);

    if (!Array.isArray(parsed)) {
      throw new Error("Gaming sessions file is not an array.");
    }

    return parsed as ChallengeSession[];
  } catch (error) {
    if (errorCode(error) === "ENOENT") return [];
    throw error;
  }
}

async function writeSessions(sessions: ChallengeSession[]) {
  await fs.mkdir(path.dirname(SESSION_FILE), {
    recursive: true,
  });

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

function makeQuestions(): ChallengeQuestion[] {
  return shuffle(BANK)
    .slice(0, QUESTION_COUNT)
    .map((seed) => {
      const options = shuffle([
        { text: seed.correct, correct: true },
        ...seed.wrong.map((text) => ({
          text,
          correct: false,
        })),
      ]);

      return {
        q: seed.q,
        answers: options.map((option) => option.text),
        correctIndex: options.findIndex((option) => option.correct),
      };
    });
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return reply({ error: "سجّل الدخول أولًا." }, 401);
    }

    let body: Record<string, unknown>;

    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return reply({ error: "بيانات الطلب غير صحيحة." }, 400);
    }

    const sessions = await readSessions();
    const now = Date.now();
    const action = String(body.action ?? "");

    if (action === "start") {
      const users = await readUsers();
      const userExists = users.some((user) => user.id === userId);

      if (!userExists) {
        return reply({ error: "الحساب غير موجود." }, 404);
      }

      const questions = makeQuestions();

      const session: ChallengeSession = {
        id: randomUUID(),
        userId,
        questions,
        createdAt: now,
      };

      sessions.push(session);
      await writeSessions(sessions);

      // Never send correctIndex to the browser.
      return reply({
        ok: true,
        sessionId: session.id,
        questions: questions.map(({ q, answers }) => ({
          q,
          answers,
        })),
      });
    }

    if (action !== "submit") {
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
        { error: "التحدي غير موجود. ابدأ تحديًا جديدًا." },
        404
      );
    }

    if (session.completedAt) {
      return reply(
        { error: "تم احتساب مكافأة هذا التحدي بالفعل." },
        409
      );
    }

    if (
      !Number.isFinite(session.createdAt) ||
      session.createdAt > now ||
      now - session.createdAt > SESSION_LIFETIME_MS
    ) {
      return reply(
        { error: "انتهت صلاحية التحدي. ابدأ تحديًا جديدًا." },
        400
      );
    }

    if (!Array.isArray(body.answers)) {
      return reply({ error: "الإجابات غير صحيحة." }, 400);
    }

    const submitted = body.answers;

    if (
      submitted.length !== session.questions.length ||
      submitted.some(
        (answer: unknown) =>
          !Number.isInteger(answer) ||
          Number(answer) < 0 ||
          Number(answer) >= 4
      )
    ) {
      return reply(
        { error: "جاوب على كل الأسئلة بإجابات صحيحة." },
        400
      );
    }

    const answers = submitted as number[];

    const score = session.questions.reduce(
      (total, question, index) =>
        total +
        (answers[index] === question.correctIndex ? 1 : 0),
      0
    );

    const xpAdded = score * 5;

    const users = await readUsers();
    const user = users.find((item) => item.id === userId);

    if (!user) {
      return reply({ error: "الحساب غير موجود." }, 404);
    }

    // Store a per-user reward ledger to prevent awarding the same
    // challenge again if writing the session file fails afterward.
    const mutableUser = user as unknown as Record<string, unknown>;

    const ledger = Array.isArray(mutableUser.gamingChallengeRewards)
      ? mutableUser.gamingChallengeRewards.filter(
          (value): value is string => typeof value === "string"
        )
      : [];

    if (!ledger.includes(session.id)) {
      user.xp = Math.max(0, Number(user.xp) || 0) + xpAdded;

      mutableUser.gamingChallengeRewards = [
        ...ledger,
        session.id,
      ].slice(-2000);

      await writeUsers(users);
    }

    session.completedAt = now;
    session.score = score;
    session.xpAdded = xpAdded;

    await writeSessions(sessions);

    return reply({
      ok: true,
      score,
      total: session.questions.length,
      xpAdded,
      xp: Math.max(0, Number(user.xp) || 0),
    });
  } catch (error) {
    console.error("GAMING CHALLENGE ERROR:", error);

    return reply(
      {
        error:
          "تعذر حفظ التحدي أو تصحيحه. راجع سجل السيرفر؛ قد تكون المشكلة في صلاحيات التخزين أو قاعدة البيانات.",
      },
      500
    );
  }
}