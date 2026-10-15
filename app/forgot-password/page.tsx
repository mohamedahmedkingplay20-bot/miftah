"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendReset() {
    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("اكتب البريد الإلكتروني.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.error ||
            "تعذر إرسال رسالة الاستعادة."
        );
        return;
      }

      setMessage(
        "تم إرسال رسالة إعادة تعيين كلمة المرور. راجع بريدك الإلكتروني."
      );
    } catch {
      setError(
        "تعذر الاتصال بالسيرفر."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#020617] px-5 py-10 text-white"
    >
      <div className="mx-auto flex min-h-[85vh] max-w-lg items-center">
        <div className="w-full rounded-[35px] border border-white/10 bg-[#091221] p-8 shadow-2xl md:p-10">
          <div className="text-center">
            <div className="text-6xl">📧</div>

            <h1 className="mt-5 text-4xl font-black">
              نسيت كلمة المرور؟
            </h1>

            <p className="mt-3 text-slate-500">
              اكتب الإيميل المرتبط بحسابك.
            </p>
          </div>

          {error && (
            <div className="mt-7 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
              {error}
            </div>
          )}

          {message && (
            <div className="mt-7 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-300">
              {message}
            </div>
          )}

          <div className="mt-8">
            <label className="block">
              <span className="mb-2 block font-black">
                البريد الإلكتروني
              </span>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-blue-500"
                placeholder="example@gmail.com"
              />
            </label>

            <button
              onClick={sendReset}
              disabled={loading}
              className="mt-5 w-full rounded-2xl py-4 font-black disabled:opacity-50"
              style={{
                background:
                  "linear-gradient(135deg,#2563eb,#06b6d4)",
              }}
            >
              {loading
                ? "جاري الإرسال..."
                : "إرسال رابط الاستعادة"}
            </button>

            <Link
              href="/login"
              className="mt-6 block text-center text-sm text-slate-500 hover:text-white"
            >
              ← العودة لتسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}