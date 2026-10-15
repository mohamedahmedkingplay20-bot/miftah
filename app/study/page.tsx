"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Task = {
  title: string;
  question: string;
  options: string[];
  correct: number;
};

export default function StudyPage() {
  const [task, setTask] =
    useState<Task | null>(null);

  const [seconds, setSeconds] =
    useState(900);

  const [running, setRunning] =
    useState(false);

  const [unlocked, setUnlocked] =
    useState(false);

  const [selected, setSelected] =
    useState<number | null>(null);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [completedCount, setCompletedCount] =
    useState(0);

  async function loadSession() {
    try {
      const response = await fetch(
        "/api/study/session",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data?.error ||
            "تعذر تحميل جلسة المذاكرة."
        );
        return;
      }

      if (!data.session && !data.task) {
        await startSession();
        return;
      }

      if (data.task) {
        setTask(data.task);
        setSeconds(
          Number(data.remaining || 0)
        );
        setUnlocked(
          Boolean(data.unlocked)
        );
        setCompletedCount(
          Number(
            data.completedCount || 0
          )
        );
      }
    } catch {
      setMessage(
        "تعذر الاتصال بالسيرفر."
      );
    } finally {
      setLoading(false);
    }
  }

  async function startSession() {
    try {
      const response = await fetch(
        "/api/study/session",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action: "start",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data?.error ||
            "تعذر بدء الجلسة."
        );
        return;
      }

      setTask(data.task);
      setSeconds(
        Number(data.remaining || 900)
      );
      setUnlocked(
        Boolean(data.unlocked)
      );
      setRunning(true);
      setSelected(null);
      setMessage("");
    } catch {
      setMessage(
        "تعذر الاتصال بالسيرفر."
      );
    }
  }

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    if (!running) return;

    const timer = setInterval(() => {
      setSeconds((value) => {
        if (value <= 1) {
          setRunning(false);
          setUnlocked(true);

          if (
            "Notification" in window &&
            Notification.permission ===
              "granted"
          ) {
            new Notification(
              "مِفتاح 📚",
              {
                body:
                  "خلصت جلسة الـ15 دقيقة. تقدر تنجز المهمة الآن.",
              }
            );
          }

          return 0;
        }

        return value - 1;
      });
    }, 1000);

    return () =>
      clearInterval(timer);
  }, [running]);

  async function completeTask() {
    if (!unlocked || selected === null) {
      return;
    }

    setMessage("");

    try {
      const response = await fetch(
        "/api/study/session",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action: "complete",
            answerIndex: selected,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data?.error ||
            "لم يتم إنجاز المهمة."
        );
        return;
      }

      setMessage(
        `✅ ${data.message} | XP: ${data.xp}`
      );

      setTask(
        data.next.task
      );

      setSeconds(
        data.next.remaining
      );

      setUnlocked(false);
      setRunning(false);
      setSelected(null);

      setCompletedCount(
        data.next.completedCount
      );
    } catch {
      setMessage(
        "تعذر الاتصال بالسيرفر."
      );
    }
  }

  async function resetSession() {
    try {
      const response = await fetch(
        "/api/study/session",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action: "reset",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) return;

      setTask(data.task);
      setSeconds(data.remaining);
      setUnlocked(false);
      setRunning(false);
      setSelected(null);
      setMessage("");
    } catch {}
  }

  function enableNotifications() {
    if (
      "Notification" in window &&
      Notification.permission !== "granted"
    ) {
      Notification.requestPermission();
    }
  }

  const minutes = Math.floor(
    seconds / 60
  )
    .toString()
    .padStart(2, "0");

  const secs = (
    seconds % 60
  )
    .toString()
    .padStart(2, "0");

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#020617] text-white flex items-center justify-center"
      >
        <div className="text-4xl font-black animate-pulse">
          🔑 مِفتاح
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#020617] px-5 py-10 text-white"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 font-bold"
          >
            ← الرئيسية
          </Link>

          <div className="text-right">
            <div className="text-xs font-black tracking-[.3em] text-cyan-400">
              MIFTAH
            </div>

            <h1 className="text-4xl font-black">
              قسم الدراسة
            </h1>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-[35px] border border-white/10 bg-[#091221] p-8 text-center shadow-2xl">
            <div className="text-sm text-slate-500">
              ⏱️ جلسة التركيز
            </div>

            <div className="mt-7 text-8xl font-black tracking-widest text-blue-400">
              {minutes}:{secs}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={startSession}
                disabled={running}
                className="rounded-2xl bg-blue-600 px-7 py-4 font-black disabled:opacity-40"
              >
                {running
                  ? "الجلسة شغالة"
                  : "ابدأ 15 دقيقة"}
              </button>

              <button
                onClick={resetSession}
                className="rounded-2xl border border-white/10 px-7 py-4 font-bold"
              >
                إعادة
              </button>

              <button
                onClick={enableNotifications}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-7 py-4 font-bold"
              >
                🔔 الإشعارات
              </button>
            </div>

            <div className="mt-8 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5 text-right">
              <div className="font-black">
                النظام الجديد
              </div>

              <p className="mt-2 text-sm leading-7 text-slate-400">
                لازم تخلص الـ15 دقيقة كاملة قبل ما زر الإنجاز يفتح. وحتى لو حاولت التحايل من المتصفح، السيرفر نفسه هيرفض الإنجاز قبل انتهاء الوقت.
              </p>
            </div>

            <div className="mt-5 text-xs text-slate-600">
              مهام منجزة: {completedCount}
            </div>
          </section>

          <section className="rounded-[35px] border border-white/10 bg-[#091221] p-8 shadow-2xl">
            {task && (
              <>
                <div className="text-5xl">
                  📚
                </div>

                <h2 className="mt-5 text-3xl font-black">
                  {task.title}
                </h2>

                <p className="mt-4 text-xl font-bold leading-9">
                  {task.question}
                </p>

                <div className="mt-7 space-y-3">
                  {task.options.map(
                    (
                      option,
                      index
                    ) => (
                      <button
                        key={option}
                        disabled={!unlocked}
                        onClick={() =>
                          setSelected(index)
                        }
                        className="w-full rounded-2xl border p-4 text-start font-bold transition disabled:cursor-not-allowed disabled:opacity-40"
                        style={{
                          borderColor:
                            selected ===
                            index
                              ? "#06b6d4"
                              : "rgba(255,255,255,.1)",
                          background:
                            selected ===
                            index
                              ? "rgba(6,182,212,.1)"
                              : "rgba(255,255,255,.03)",
                        }}
                      >
                        {index + 1}.{" "}
                        {option}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={completeTask}
                  disabled={
                    !unlocked ||
                    selected === null
                  }
                  className="mt-7 w-full rounded-2xl bg-emerald-600 py-4 font-black disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {unlocked
                    ? "إنجاز المهمة +10 XP"
                    : "🔒 أكمل الـ15 دقيقة أولًا"}
                </button>

                {message && (
                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    {message}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}