import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  publicUser,
  readUsers,
  userIdFromToken,
} from "../../_lib";

export async function GET() {
  const c = await cookies();

  const id = userIdFromToken(
    c.get("miftah_session")?.value
  );

  if (!id) {
    return NextResponse.json({ user: null });
  }

  const users = await readUsers();
  const user = users.find((u) => u.id === id);

  return NextResponse.json({
    user: user ? publicUser(user) : null,
  });
}
