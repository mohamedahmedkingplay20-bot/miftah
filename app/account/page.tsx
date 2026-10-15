"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type User = {
  name: string;
  username: string;
  email: string;
  xp: number;
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          window.location.href = "/login";
          return;
        }

        setUser(data.user);
        setName(data.user.name || "");
        setNickname(
          data.user.profile?.nickname || ""
        );
      })
      .catch(() => {
        window.location.href = "/login";
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function saveProfile() {
    setMessage("");

    const response = await fetch(
      "/api/auth/update-profile",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          nickname,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(
        data?.error || "حدث خطأ."
      );
      return;
    }

    setUser(data.user);

    window.dispatchEvent(
      new Event("miftah-profile-change")
    );

    setMessage("تم حفظ بيانات الحساب ✅");
  }

  async function changePassword() {
    setMessage("");

    const response = await fetch(
      "/api/auth/change-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(
        data?.error ||
          "فشل تغيير كلمة المرور."
      );
      return;
    }

    setCurrentPassword("");
    setNewPassword("");

    setMessage(
      "تم تغيير كلمة المرور ✅"
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#030712] flex items-center justify-center text-white">
        <div className="text-3xl font-black animate-pulse">
          🔑 مِفتاح
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#030712] px-5 py-10 text-white"
    >
      <div className="mx-auto max-w-4xl">
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
              حسابي
            </h1>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-cyan-300">
            {message}
          </div>
        )}

        <div className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-[#091221] p-7">
            <div className="text-xs font-black tracking-widest text-blue-400">
              PROFILE
            </div>

            <h2 className="mt-2 text-3xl font-black">
              بياناتك
            </h2>

            <div className="mt-7 space-y-5">
              <label className="block">
                <span className="mb-2 block font-bold">
                  الاسم
                </span>

                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-2 block font-bold">
                  Nickname
                </span>

                <input
                  value={nickname}
                  onChange={(e) =>
                    setNickname(e.target.value)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-blue-500"
                />
              </label>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs text-slate-500">
                  Username
                </div>

                <div className="mt-1 font-bold">
                  @{user?.username}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs text-slate-500">
                  البريد الإلكتروني
                </div>

                <div className="mt-1 font-bold">
                  {user?.email}
                </div>
              </div>

              <button
                onClick={saveProfile}
                className="rounded-2xl px-7 py-4 font-black"
                style={{
                  background:
                    "linear-gradient(135deg,#2563eb,#06b6d4)",
                }}
              >
                حفظ التغييرات
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#091221] p-7">
            <div className="text-xs font-black tracking-widest text-purple-400">
              SECURITY
            </div>

            <h2 className="mt-2 text-3xl font-black">
              تغيير كلمة المرور
            </h2>

            <div className="mt-7 space-y-5">
              <label className="block">
                <span className="mb-2 block font-bold">
                  كلمة المرور الحالية
                </span>

                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(
                      e.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-2 block font-bold">
                  كلمة المرور الجديدة
                </span>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none"
                />
              </label>

              <button
                onClick={changePassword}
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-7 py-4 font-black hover:bg-white/[0.08]"
              >
                تغيير كلمة المرور
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}