import { NextResponse } from "next/server";
import {
  readUsers,
  writeUsers,
  userIdFromToken,
} from "@/app/api/_lib";

function getToken(req: Request) {
  const cookie = req.headers.get("cookie") || "";

  return cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) =>
      item.startsWith("miftah_session=")
    )
    ?.split("=")
    .slice(1)
    .join("=");
}

export async function POST(req: Request) {
  try {
    const token = getToken(req);

    const userId =
      userIdFromToken(token);

    if (!userId) {
      return NextResponse.json(
        {
          error:
            "يجب تسجيل الدخول أولًا.",
        },
        { status: 401 }
      );
    }

    const body =
      await req.json();

    const name =
      typeof body?.name === "string"
        ? body.name.trim()
        : "";

    const nickname =
      typeof body?.nickname === "string"
        ? body.nickname.trim()
        : "";

    if (!name) {
      return NextResponse.json(
        {
          error:
            "الاسم لا يمكن أن يكون فارغًا.",
        },
        { status: 400 }
      );
    }

    if (name.length > 60) {
      return NextResponse.json(
        {
          error:
            "الاسم طويل جدًا.",
        },
        { status: 400 }
      );
    }

    if (nickname.length > 40) {
      return NextResponse.json(
        {
          error:
            "الـNickname طويل جدًا.",
        },
        { status: 400 }
      );
    }

    const users =
      await readUsers();

    const user =
      users.find(
        (item) =>
          item.id === userId
      );

    if (!user) {
      return NextResponse.json(
        {
          error:
            "الحساب غير موجود.",
        },
        { status: 404 }
      );
    }

    user.name = name;

    user.profile = {
      ...(user.profile || {}),
      nickname,
    };

    await writeUsers(users);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        category: user.category,
        role: user.role,
        xp: user.xp,
        premiumDiscount:
          user.premiumDiscount,
        discountClaimed:
          user.discountClaimed,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error(
      "UPDATE PROFILE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "حدث خطأ أثناء حفظ بيانات الحساب.",
      },
      { status: 500 }
    );
  }
}