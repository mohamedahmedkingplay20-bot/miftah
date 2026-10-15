"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();

  const token = useMemo(
    () => searchParams.get("token") || "",
    [searchParams]
  );

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function resetPassword() {
    setError("");
    setSuccess("");

    if (!token) {
      setError(
        "رابط إعادة التعيين غير صالح."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "كلمة المرور لازم تكون 6 أحرف على الأقل."
      );
      return;
    }

    if (password !== confirm) {
      setError(
        "كلمتا المرور غير متطابقتين."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.error ||
            "فشل إعادة تعيين كلمة المرور."
        );
        return;
      }

      setSuccess(
        "تم تغيير كلمة المرور بنجاح ✅"
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
            <div className="text-6xl">🔐</div>

            <h1 className="mt-5 text-4xl font-black">
              كلمة مرور جديدة
            </h1>

            <p className="mt-3 text-slate-500">
              اختار كلمة مرور جديدة لحسابك.
            </p>
          </div>

          {error && (
            <div className="mt-7 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-7 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-300">
              {success}
            </div>
          )}

          <div className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block font-black">
                كلمة المرور الجديدة
              </span>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-blue-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block font-black">
                تأكيد كلمة المرور
              </span>

              <input
                type="password"
                value={confirm}
                onChange={(e) =>
                  setConfirm(e.target.value)
                }
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-blue-500"
              />
            </label>

            <button
              onClick={resetPassword}
              disabled={loading || !!success}
              className="w-full rounded-2xl py-4 font-black disabled:opacity-50"
              style={{
                background:
                  "linear-gradient(135deg,#2563eb,#06b6d4)",
              }}
            >
              {loading
                ? "جاري الحفظ..."
                : "تغيير كلمة المرور"}
            </button>

            {success && (
              <Link
                href="/login"
                className="block rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center font-bold hover:bg-white/[0.08]"
              >
                تسجيل الدخول
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}