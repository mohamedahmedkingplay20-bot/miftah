import { NextResponse } from "next/server";
import {
  checkPassword,
  hashPassword,
  readUsers,
  userIdFromToken,
  writeUsers,
} from "@/app/api/_lib";

function getSessionToken(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  return cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("miftah_session="))
    ?.split("=")
    .slice(1)
    .join("=");
}

export async function POST(request: Request) {
  try {
    const userId = userIdFromToken(getSessionToken(request));
    if (!userId) {
      return NextResponse.json(
        { error: "انتهت الجلسة أو لم تسجل الدخول. سجّل الدخول من جديد." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const currentPassword = String(body?.currentPassword || "");
    const newPassword = String(body?.newPassword || "");

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "اكتب كلمة المرور الحالية والجديدة." },
        { status: 400 }
      );
    }
    if (newPassword.length < 8 || newPassword.length > 128) {
      return NextResponse.json(
        { error: "كلمة المرور الجديدة يجب أن تكون من 8 إلى 128 حرفًا." },
        { status: 400 }
      );
    }

    const users = await readUsers();
    const user = users.find((item) => item.id === userId);
    if (!user) {
      return NextResponse.json(
        { error: "الحساب غير موجود." },
        { status: 404 }
      );
    }

    const matches = await checkPassword(currentPassword, user.passwordHash);
    if (!matches) {
      return NextResponse.json(
        { error: "كلمة المرور الحالية غير صحيحة." },
        { status: 400 }
      );
    }
    if (await checkPassword(newPassword, user.passwordHash)) {
      return NextResponse.json(
        { error: "اختار كلمة مرور جديدة مختلفة عن الحالية." },
        { status: 400 }
      );
    }

    user.passwordHash = await hashPassword(newPassword);
    await writeUsers(users);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تغيير كلمة المرور." },
      { status: 500 }
    );
  }
}
