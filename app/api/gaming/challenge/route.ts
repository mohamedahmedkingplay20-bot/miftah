import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { readUsers, userIdFromToken, writeUsers } from "@/app/api/_lib";

const FILE = path.join(process.cwd(), "data", "gaming-sessions.json");
type Q = { q: string; answers: string[]; correctIndex: number };
type Session = { id: string; userId: string; questions: Q[]; createdAt: number; completedAt?: number; score?: number; xpAdded?: number };
type Seed = { q: string; correct: string; wrong: [string, string, string] };
const BANK: Seed[] = [
  { q: "ما معنى FPS في الألعاب؟", correct: "إطارات في الثانية", wrong: ["نقاط اللاعب", "سرعة الإنترنت", "نوع كرت الشاشة"] },
  { q: "أي لعبة من Roblox؟", correct: "Blox Fruits", wrong: ["Minecraft", "FIFA", "Fortnite"] },
  { q: "ما المقصود بـ Ping؟", correct: "زمن الاستجابة", wrong: ["حجم الرام", "حجم الشاشة", "عدد اللاعبين"] },
  { q: "ما وظيفة GPU الأساسية؟", correct: "معالجة الرسوميات", wrong: ["حفظ كلمات السر", "توصيل الإنترنت", "تشغيل الصوت فقط"] },
  { q: "ماذا تعني HP غالبًا في الألعاب؟", correct: "Health Points", wrong: ["High Power", "Hyper Player", "Hard Play"] },
  { q: "ما الشيء الذي يساعد على رفع FPS عادة؟", correct: "خفض بعض إعدادات الرسوميات", wrong: ["رفع صوت اللعبة", "تكبير الشاشة فقط", "تغيير اسم اللاعب"] },
  { q: "ما وظيفة لوحة المفاتيح؟", correct: "إدخال الأوامر والنصوص", wrong: ["عرض الصور", "طباعة الأوراق", "توصيل الإنترنت"] },
  { q: "ما أفضل تصرف عند رابط جائزة مشبوه؟", correct: "التحقق وعدم مشاركة البيانات", wrong: ["إدخال كلمة المرور فورًا", "إرسال الرابط للجميع", "تعطيل الحماية"] },
  { q: "ما فائدة الحفظ في اللعبة؟", correct: "استكمال التقدم لاحقًا", wrong: ["زيادة سرعة الإنترنت", "زيادة حجم الشاشة", "تبريد المعالج"] },
  { q: "أي جهاز يخزن ملفات اللعبة بصورة دائمة؟", correct: "SSD أو HDD", wrong: ["RAM فقط", "المروحة", "الماوس"] },
  { q: "ما الذي يُستخدم غالبًا للتحكم في الشخصية على الكمبيوتر؟", correct: "الكيبورد والماوس أو يد التحكم", wrong: ["الطابعة", "الراوتر فقط", "السماعات فقط"] },
  { q: "ما الذي يعنيه اللعب الجماعي Online؟", correct: "اللعب عبر شبكة أو الإنترنت مع آخرين", wrong: ["اللعب بدون جهاز", "اللعب بلا اتصال دائمًا", "مشاهدة صورة ثابتة"] },
  { q: "أي خيار يساعد على حماية الحساب؟", correct: "كلمة مرور قوية وعدم مشاركتها", wrong: ["مشاركة رمز الدخول", "استخدام 123456", "تعطيل التحديثات"] },
  { q: "ما وظيفة الراوتر؟", correct: "توجيه الاتصال بين الأجهزة والشبكة", wrong: ["تشغيل اللعبة بدل الكمبيوتر", "زيادة مساحة القرص", "تبريد كرت الشاشة"] },
  { q: "أي مما يلي من وحدات الإخراج؟", correct: "الشاشة", wrong: ["لوحة المفاتيح", "الماوس", "الميكروفون"] },
];
function shuffle<T>(items: T[]): T[] { const a = [...items]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
async function readSessions(): Promise<Session[]> { try { return JSON.parse(await fs.readFile(FILE, "utf8")) as Session[]; } catch { return []; } }
async function writeSessions(sessions: Session[]) { await fs.mkdir(path.dirname(FILE), { recursive: true }); await fs.writeFile(FILE, JSON.stringify(sessions, null, 2), "utf8"); }
function getUserId(request: Request) { const cookie = request.headers.get("cookie") || ""; const token = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith("miftah_session="))?.split("=").slice(1).join("="); return userIdFromToken(token); }
export async function POST(request: Request) {
  try {
    const userId = getUserId(request);
    if (!userId) return NextResponse.json({ error: "سجّل الدخول أولًا." }, { status: 401 });
    const body = await request.json();
    const sessions = await readSessions();
    if (body?.action === "start") {
      const users = await readUsers();
      if (!users.some((u) => u.id === userId)) return NextResponse.json({ error: "الحساب غير موجود." }, { status: 404 });
      const questions = shuffle(BANK).slice(0, 10).map((seed) => {
        const choices = shuffle([{ text: seed.correct, correct: true }, ...seed.wrong.map((text) => ({ text, correct: false }))]);
        return { q: seed.q, answers: choices.map((c) => c.text), correctIndex: choices.findIndex((c) => c.correct) };
      });
      const session: Session = { id: randomUUID(), userId, questions, createdAt: Date.now() };
      sessions.push(session);
      await writeSessions(sessions);
      return NextResponse.json({ ok: true, sessionId: session.id, questions: questions.map(({ q, answers }) => ({ q, answers })) });
    }
    if (body?.action !== "submit") return NextResponse.json({ error: "طلب غير صحيح." }, { status: 400 });
    const session = sessions.find((s) => s.id === body.sessionId && s.userId === userId);
    if (!session) return NextResponse.json({ error: "التحدي غير موجود. ابدأ تحديًا جديدًا." }, { status: 404 });
    if (session.completedAt) return NextResponse.json({ error: "تم احتساب مكافأة هذا التحدي من قبل." }, { status: 409 });
    if (Date.now() - session.createdAt > 3 * 60 * 60 * 1000) return NextResponse.json({ error: "انتهت صلاحية التحدي. ابدأ تحديًا جديدًا." }, { status: 400 });
    if (!Array.isArray(body.answers) || body.answers.length !== session.questions.length || body.answers.some((n: unknown) => !Number.isInteger(n))) return NextResponse.json({ error: "الإجابات غير مكتملة." }, { status: 400 });
    const score = session.questions.reduce((total, question, i) => total + (body.answers[i] === question.correctIndex ? 1 : 0), 0);
    const xpAdded = score * 5;
    const users = await readUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return NextResponse.json({ error: "الحساب غير موجود." }, { status: 404 });
    session.completedAt = Date.now(); session.score = score; session.xpAdded = xpAdded;
    if (xpAdded > 0) { user.xp = Math.max(0, Number(user.xp) || 0) + xpAdded; await writeUsers(users); }
    await writeSessions(sessions);
    return NextResponse.json({ ok: true, score, total: session.questions.length, xpAdded, xp: Number(user.xp) || 0 });
  } catch (error) {
    console.error("GAMING CHALLENGE ERROR:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء تجهيز التحدي أو تصحيحه." }, { status: 500 });
  }
}
