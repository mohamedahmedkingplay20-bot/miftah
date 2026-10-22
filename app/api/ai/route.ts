import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readUsers, userIdFromToken } from "../_lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ApiResult = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  error?: {
    code?: string;
    type?: string;
  };
};

function reply(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

function cleanAnswer(text: string, apiKey: string) {
  return text
    .split(apiKey)
    .join("[مفتاح API مخفي]")
    .replace(
      /\bsk-(?:proj-)?[A-Za-z0-9_*.-]{8,}\b/g,
      "[مفتاح API مخفي]"
    )
    .trim();
}

function getAnswer(data: ApiResult): string {
  if (typeof data.output_text === "string") {
    return data.output_text.trim();
  }

  const parts: string[] = [];

  for (const item of data.output ?? []) {
    for (const content of item.content ?? []) {
      if (
        content.type === "output_text" &&
        typeof content.text === "string"
      ) {
        parts.push(content.text);
      }
    }
  }

  return parts.join("\n").trim();
}

// Basic per-process protection against rapid repeated requests.
// A permanent quota requires shared storage or a database.
const requestTimes = new Map<string, number[]>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  const maxRequests = 8;

  const recent = (requestTimes.get(userId) ?? []).filter(
    (time) => now - time < windowMs
  );

  if (recent.length >= maxRequests) {
    requestTimes.set(userId, recent);
    return true;
  }

  recent.push(now);
  requestTimes.set(userId, recent);
  return false;
}

export async function POST(request: Request) {
  try {
    // 1) Verify the signed-in user.
    const cookieStore = await cookies();
    const token = cookieStore.get("miftah_session")?.value;
    const userId = userIdFromToken(token);

    if (!userId) {
      return reply(
        { error: "سجّل الدخول أولًا لاستخدام مِفتاح AI." },
        401
      );
    }

    const users = await readUsers();
    const user = users.find((item) => item.id === userId);

    if (!user) {
      return reply({ error: "الحساب غير موجود." }, 401);
    }

    // Owner can use AI without the basic per-minute throttle.
    const role = String(user.role ?? "").toLowerCase();
    const ownerUsername = String(
      process.env.MIFTAH_OWNER_USERNAME ?? ""
    )
      .trim()
      .toLowerCase();

    const username = String(user.username ?? "")
      .trim()
      .toLowerCase();

    const isOwner =
      ["owner", "site_owner", "admin"].includes(role) ||
      (!!ownerUsername && username === ownerUsername);

    if (!isOwner && isRateLimited(userId)) {
      return reply(
        {
          error:
            "أرسلت أسئلة بسرعة كبيرة. استنى دقيقة وجرب تاني.",
        },
        429
      );
    }

    // 2) Read the secret only on the server.
    const apiKey = process.env.OPENAI_API_KEY?.trim();

    if (!apiKey || /\*{2,}/.test(apiKey)) {
      console.error("MIFTAH AI: API key is not configured.");

      return reply(
        {
          error:
            "الذكاء الاصطناعي مش متجهز على السيرفر. راجع OPENAI_API_KEY في إعدادات البيئة.",
        },
        503
      );
    }

    // 3) Validate the prompt.
    let body: { prompt?: unknown };

    try {
      body = await request.json();
    } catch {
      return reply({ error: "بيانات السؤال غير صحيحة." }, 400);
    }

    if (typeof body.prompt !== "string" || !body.prompt.trim()) {
      return reply({ error: "اكتب سؤالك الأول." }, 400);
    }

    const prompt = body.prompt.trim();

    if (prompt.length > 12_000) {
      return reply(
        { error: "السؤال طويل جدًا. اختصره وجرب تاني." },
        400
      );
    }

    // 4) Call OpenAI from the backend, never from browser code.
    const model =
      process.env.OPENAI_MODEL?.trim() || "gpt-5.4-mini";

    const upstream = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(45_000),
        body: JSON.stringify({
          model,
          instructions:
            "أنت مِفتاح، مساعد تعليمي مفيد وواضح. أجب بلغة سؤال المستخدم، واشرح خطوة بخطوة عند الحاجة. لا تدّعِ معرفة شيء غير مؤكد، ولا تكشف مفاتيح API أو كلمات مرور أو متغيرات البيئة أو الأسرار. اجعل إجاباتك مناسبة للطلاب.",
          input: prompt,
          max_output_tokens: 1200,
          store: false,
        }),
      }
    );

    const data = (await upstream.json().catch(() => null)) as
      | ApiResult
      | null;

    if (!upstream.ok) {
      const code = data?.error?.code ?? "";
      console.error("MIFTAH AI upstream error:", {
        status: upstream.status,
        code,
      });

      if (upstream.status === 401 || code === "invalid_api_key") {
        return reply(
          {
            error:
              "مفتاح OpenAI API مرفوض. راجع المفتاح في إعدادات السيرفر، وتأكد إنه مفتاح حقيقي وصحيح.",
          },
          502
        );
      }

      if (
        upstream.status === 429 &&
        /quota|billing|insufficient_quota/i.test(code)
      ) {
        return reply(
          {
            error:
              "رصيد أو حد الإنفاق الخاص بـ API غير كافٍ. راجع الفوترة وحدود الاستخدام في منصة OpenAI API.",
          },
          429
        );
      }

      if (upstream.status === 429) {
        return reply(
          {
            error:
              "طلبات الذكاء الاصطناعي كثيرة حاليًا. استنى قليلًا وجرب تاني.",
          },
          429
        );
      }

      if (upstream.status === 403) {
        return reply(
          {
            error:
              "المشروع أو المفتاح مش مسموح له باستخدام الخدمة المطلوبة. راجع صلاحيات مشروع API.",
          },
          502
        );
      }

      if (upstream.status === 404) {
        return reply(
          {
            error:
              "الموديل المحدد غير متاح للمفتاح الحالي. راجع OPENAI_MODEL وإمكانية استخدام الموديل في حساب API.",
          },
          502
        );
      }

      return reply(
        {
          error:
            "خدمة الذكاء الاصطناعي رجعت خطأ. راجع سجل السيرفر وإعدادات API.",
        },
        502
      );
    }

    const answer = cleanAnswer(
      getAnswer(data ?? {}),
      apiKey
    );

    if (!answer) {
      return reply(
        {
          error:
            "الخدمة استجابت، لكن ما وصلش نص للإجابة. جرّب السؤال مرة تانية.",
        },
        502
      );
    }

    return reply({ answer });
  } catch (error) {
    // Log only the error type. Never log secrets or request contents.
    console.error(
      "MIFTAH AI request failed:",
      error instanceof Error ? error.name : "UnknownError"
    );

    return reply(
      {
        error:
          "تعذر الاتصال بخدمة الذكاء الاصطناعي. تأكد من اتصال السيرفر وإعدادات API.",
      },
      500
    );
  }
}