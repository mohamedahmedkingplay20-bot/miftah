"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [category, setCategory] = useState<
    "study" | "gaming" | "calculations"
  >("study");

  const [role, setRole] = useState<
    "student" | "teacher"
  >("student");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function signup() {
    setError("");

    if (
      !name.trim() ||
      !username.trim() ||
      !email.trim() ||
      !password
    ) {
      setError("املأ كل البيانات المطلوبة.");
      return;
    }

    if (password.length < 6) {
      setError("كلمة المرور لازم تكون 6 أحرف على الأقل.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
          language: "ar",
          category,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.error ||
            "حدث خطأ أثناء إنشاء الحساب."
        );
        return;
      }

      window.location.href = "/login";
    } catch {
      setError("تعذر الاتصال بالسيرفر.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#030712] px-5 py-10 text-white"
    >
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[32px] border border-white/10 bg-[#091221] p-8 shadow-2xl md:p-10">
          <div className="text-center">
            <div className="text-5xl">🔑</div>

            <h1 className="mt-5 text-4xl font-black">
              إنشاء حساب
            </h1>

            <p className="mt-3 text-slate-500">
              أنشئ حسابك وابدأ رحلتك مع مِفتاح.
            </p>
          </div>

          {error && (
            <div className="mt-7 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
              {error}
            </div>
          )}

          <div className="mt-8 space-y-5">
            <Field
              label="الاسم"
              value={name}
              onChange={setName}
              placeholder="اسمك"
            />

            <Field
              label="اسم المستخدم"
              value={username}
              onChange={setUsername}
              placeholder="username"
            />

            <Field
              label="البريد الإلكتروني"
              value={email}
              onChange={setEmail}
              placeholder="example@gmail.com"
              type="email"
            />

            <Field
              label="كلمة المرور"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              type="password"
            />

            <div>
              <div className="mb-3 text-sm font-bold">
                اختر القسم الأساسي
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Choice
                  active={category === "study"}
                  onClick={() => setCategory("study")}
                  icon="📚"
                  title="الدراسة"
                />

                <Choice
                  active={category === "gaming"}
                  onClick={() => setCategory("gaming")}
                  icon="🎮"
                  title="Gaming"
                />

                <Choice
                  active={category === "calculations"}
                  onClick={() => setCategory("calculations")}
                  icon="🧮"
                  title="الحسابات"
                />
              </div>
            </div>

            {category === "study" && (
              <div>
                <div className="mb-3 text-sm font-bold">
                  أنت؟
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Choice
                    active={role === "student"}
                    onClick={() => setRole("student")}
                    icon="🎓"
                    title="طالب"
                  />

                  <Choice
                    active={role === "teacher"}
                    onClick={() => setRole("teacher")}
                    icon="👨‍🏫"
                    title="معلم"
                  />
                </div>
              </div>
            )}

            <button
              onClick={signup}
              disabled={loading}
              className="w-full rounded-2xl py-4 font-black transition hover:-translate-y-1 disabled:opacity-50"
              style={{
                background:
                  "linear-gradient(135deg,#2563eb,#06b6d4)",
              }}
            >
              {loading
                ? "جاري إنشاء الحساب..."
                : "إنشاء الحساب"}
            </button>

            <div className="text-center text-sm text-slate-500">
              عندك حساب؟
              <Link
                href="/login"
                className="mr-2 font-bold text-cyan-400"
              >
                تسجيل الدخول
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none transition focus:border-blue-500"
        placeholder={placeholder}
      />
    </label>
  );
}

function Choice({
  active,
  onClick,
  icon,
  title,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border p-4 transition"
      style={{
        borderColor: active
          ? "#22d3ee"
          : "rgba(255,255,255,.1)",
        background: active
          ? "rgba(34,211,238,.08)"
          : "rgba(255,255,255,.03)",
      }}
    >
      <div className="text-3xl">{icon}</div>

      <div className="mt-2 font-black">
        {title}
      </div>
    </button>
  );
}