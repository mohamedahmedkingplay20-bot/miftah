import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "إضافة XP المباشرة غير مسموحة. XP يتم من خلال المهام والتحديات فقط.",
    },
    { status: 403 }
  );
}