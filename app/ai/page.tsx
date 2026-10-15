"use client";

import { useState } from "react";
import Link from "next/link";

export default function AIPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  async function askMiftah(prompt = message) {
    if (!prompt.trim() || loading) return;

    const userMessage = prompt.trim();

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userMessage },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: userMessage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "حدث خطأ.");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: data.answer || "لم يصل رد.",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            error instanceof Error
              ? error.message
              : "حدث خطأ أثناء الاتصال بمِفتاح.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#050816] text-white"
    >
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5">

        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/10 py-5">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 text-xl shadow-lg shadow-blue-600/20">
              🔑
            </div>

            <div>
              <h1 className="text-xl font-black">
                مِفتاح
              </h1>

              <p className="text-[10px] text-slate-500">
                AI Assistant
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            ← الرئيسية
          </Link>

        </header>

        {/* Content */}
        <section className="flex flex-1 flex-col items-center py-10">

          <div className="w-full max-w-3xl">

            {messages.length === 0 && (
              <div className="mb-10 text-center">

                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[25px] border border-blue-400/20 bg-blue-400/5 text-4xl shadow-2xl shadow-blue-500/10">
                  🤖
                </div>

                <div className="mb-3 inline-flex rounded-full border border-blue-400/20 bg-blue-400/5 px-3 py-1 text-[10px] font-bold text-blue-300">
                  MIFTAH AI
                </div>

                <h2 className="text-4xl font-black tracking-tight">
                  أهلًا بيك في مِفتاح
                </h2>

                <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-400">
                  اسأل، اتعلم، خطط، وخلي مِفتاح يساعدك توصل لهدفك.
                </p>

              </div>
            )}

            {/* Messages */}
            {messages.length > 0 && (
              <div className="mb-6 space-y-5">

                {messages.map((item, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      item.role === "user"
                        ? "justify-start"
                        : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-5 py-4 leading-7 shadow-lg ${
                        item.role === "user"
                          ? "rounded-tr-md bg-blue-600 text-white"
                          : "rounded-tl-md border border-white/10 bg-[#101b2d] text-slate-100"
                      }`}
                    >

                      {item.role === "ai" && (
                        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-400">
                          <span>🔑</span>
                          مِفتاح
                        </div>
                      )}

                      <div className="whitespace-pre-wrap">
                        {item.text}
                      </div>

                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-end">
                    <div className="rounded-2xl rounded-tl-md border border-white/10 bg-[#101b2d] px-5 py-4 text-slate-400">
                      مِفتاح بيفكر
                      <span className="mr-2 animate-pulse">
                        •••
                      </span>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Input */}
            <div className="rounded-[28px] border border-white/10 bg-[#0b1423] p-3 shadow-2xl">

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey
                  ) {
                    e.preventDefault();
                    askMiftah();
                  }
                }}
                placeholder="اكتب اللي عايز تسأل مِفتاح عنه..."
                className="min-h-[130px] w-full resize-none bg-transparent px-4 py-3 text-base text-white outline-none placeholder:text-slate-600"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">

                <div className="flex flex-wrap gap-2">

                  <button
                    onClick={() => askMiftah()}
                    disabled={loading}
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    اسأل مِفتاح
                  </button>

                  <button
                    onClick={() =>
                      setMessage(
                        "اشرح لي هذا الموضوع بطريقة مبسطة وسهلة الفهم."
                      )
                    }
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/10"
                  >
                    شرح مبسط
                  </button>

                  <button
                    onClick={() =>
                      setMessage(
                        "اعمل لي خطة عملية خطوة بخطوة لتحقيق هدفي."
                      )
                    }
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/10"
                  >
                    اعمل خطة
                  </button>

                </div>

                <span className="text-xs text-slate-600">
                  Enter للإرسال
                </span>

              </div>

            </div>

            <p className="mt-5 text-center text-xs text-slate-600">
              مِفتاح قد يخطئ أحيانًا، راجع المعلومات المهمة.
            </p>

          </div>
        </section>

      </div>
    </main>
  );
}