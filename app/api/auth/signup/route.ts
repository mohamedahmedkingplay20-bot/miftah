import { NextResponse } from "next/server";
import {
  hashPassword,
  publicUser,
  readUsers,
  tokenFor,
  type User,
  writeUsers,
} from "../../_lib";
import crypto from "node:crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      username,
      email,
      password,
      language,
      category,
      role,
      profile,
    } = body || {};

    if (
      ![name, username, email, password, language, category, role].every(
        (x) => typeof x === "string" && x.trim()
      )
    ) {
      return NextResponse.json(
        { error: "املأ كل البيانات المطلوبة." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل." },
        { status: 400 }
      );
    }

    const users = await readUsers();

    const emailExists = users.some(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    const usernameExists = users.some(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (emailExists || usernameExists) {
      return NextResponse.json(
        { error: "الحساب ده موجود بالفعل، من فضلك سجل الدخول." },
        { status: 409 }
      );
    }

    const user: User = {
      id: crypto.randomUUID(),
      name: name.trim(),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: await hashPassword(password),
      language: language as "ar" | "en",
      category: category.trim(),
      role: role.trim(),
      profile: profile || {},
      xp: 0,
      premiumDiscount: 0,
      discountClaimed: false,
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    await writeUsers(users);

    const res = NextResponse.json({
      user: publicUser(user),
    });

    res.cookies.set("miftah_session", tokenFor(user.id), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("SIGNUP ERROR:", error);

    return NextResponse.json(
      { error: "تعذر إنشاء الحساب." },
      { status: 500 }
    );
  }
}
