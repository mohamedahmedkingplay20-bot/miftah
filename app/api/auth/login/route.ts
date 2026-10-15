import { NextResponse } from "next/server";
import {
  checkPassword,
  publicUser,
  readUsers,
  tokenFor,
} from "../../_lib";

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    const users = await readUsers();

    const user = users.find(
      (u) =>
        u.email.toLowerCase() === String(identifier).toLowerCase() ||
        u.username.toLowerCase() === String(identifier).toLowerCase()
    );

    if (
      !user ||
      !(await checkPassword(password || "", user.passwordHash))
    ) {
      return NextResponse.json(
        { error: "بيانات الدخول غير صحيحة." },
        { status: 401 }
      );
    }

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
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      { error: "تعذر تسجيل الدخول." },
      { status: 500 }
    );
  }
}
