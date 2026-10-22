import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  publicUser,
  readUsers,
  userIdFromToken,
} from "../../_lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("miftah_session")?.value;
    const id = userIdFromToken(token);

    if (!id) {
      return NextResponse.json(
        { user: null },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const users = await readUsers();
    const user = users.find((item) => item.id === id);

    if (!user) {
      return NextResponse.json(
        { user: null },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const username = String(user.username ?? "")
      .trim()
      .toLowerCase();

    const storedRole = String(user.role ?? "")
      .trim()
      .toLowerCase();

    // Set this to the exact username of the site owner
    // in .env.local and in the deployment's environment variables.
    const configuredOwner = String(
      process.env.MIFTAH_OWNER_USERNAME ?? ""
    )
      .trim()
      .toLowerCase();

    const isOwner =
      storedRole === "owner" ||
      storedRole === "site_owner" ||
      (!!configuredOwner && username === configuredOwner);

    const safeUser = publicUser(user) as Record<string, unknown>;

    const isPremium =
      isOwner ||
      safeUser.isPremium === true ||
      safeUser.premium === true;

    return NextResponse.json(
      {
        user: {
          ...safeUser,
          role: isOwner
            ? "owner"
            : String(safeUser.role ?? user.role ?? "user"),
          isOwner,
          isPremium,
          premium: isPremium,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("AUTH ME ERROR:", error);

    return NextResponse.json(
      { error: "تعذر تحميل بيانات الحساب." },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}