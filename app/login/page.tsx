"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");

    if (!identifier.trim() || !password) {
      setError(
        "اكتب البريد الإلكتروني أو اسم المستخدم وكلمة المرور."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.error ||
            "بيانات تسجيل الدخول غير صحيحة."
        );
        return;
      }

      /*
        السيرفر هو المسؤول عن حفظ الجلسة في
        miftah_session cookie.
      */

      window.location.replace("/");
    } catch {
      setError(
        "تعذر الاتصال بالسيرفر. حاول مرة أخرى."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-hidden bg-[#020617] px-5 py-10 text-white"
    >
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[150px]" />
        <div className="absolute -right-40 top-[25%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[150px]" />
        <div className="absolute bottom-[-200px] left-[30%] h-[450px] w-[450px] rounded-full bg-purple-600/10 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[90vh] max-w-lg items-center justify-center">
        <div className="w-full rounded-[35px] border border-white/10 bg-[#081120]/95 p-8 shadow-[0_30px_100px_rgba(0,0,0,.45)] backdrop-blur-xl md:p-10">

          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[25px] bg-gradient-to-br from-blue-500 to-cyan-400 text-4xl shadow-[0_0_50px_rgba(37,99,235,.3)]">
              🔑
            </div>

            <div className="mt-6 text-xs font-black tracking-[.35em] text-cyan-400">
              MIFTAH
            </div>

            <h1 className="mt-3 text-4xl font-black">
              أهلاً بعودتك
            </h1>

            <p className="mt-3 text-slate-500">
              سجل دخولك وكمل رحلتك داخل مِفتاح.
            </p>
          </div>

          {error && (
            <div className="mt-7 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
              {error}
            </div>
          )}

          <div className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-black">
                البريد الإلكتروني أو اسم المستخدم
              </span>

              <input
                type="text"
                value={identifier}
                onChange={(e) =>
                  setIdentifier(e.target.value)
                }
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-white outline-none transition focus:border-blue-500 focus:bg-blue-500/[0.04]"
                placeholder="username أو example@gmail.com"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-black">
                كلمة المرور
              </span>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLogin();
                  }
                }}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-white outline-none transition focus:border-blue-500 focus:bg-blue-500/[0.04]"
                placeholder="••••••••"
              />
            </label>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full rounded-2xl py-4 font-black shadow-xl transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background:
                  "linear-gradient(135deg,#2563eb,#06b6d4)",
              }}
            >
              {loading
                ? "جاري تسجيل الدخول..."
                : "دخول إلى مِفتاح"}
            </button>

            <Link
              href="/forgot-password"
              className="block text-center text-sm font-bold text-cyan-400 hover:text-cyan-300"
            >
              نسيت كلمة المرور؟
            </Link>

            <div className="border-t border-white/10 pt-6 text-center text-sm text-slate-500">
              لسه معندكش حساب؟

              <Link
                href="/signup"
                className="mr-2 font-black text-blue-400"
              >
                إنشاء حساب
              </Link>
            </div>

            <Link
              href="/"
              className="block text-center text-sm text-slate-600 hover:text-white"
            >
              ← العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}