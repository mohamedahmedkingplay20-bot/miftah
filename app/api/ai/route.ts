import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const prompt =
      typeof body?.prompt === "string"
        ? body.prompt.trim()
        : "";

    if (!prompt) {
      return NextResponse.json(
        {
          error:
            "اكتب رسالة للذكاء الاصطناعي.",
        },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY غير موجود في .env.local",
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model:
            process.env.OPENAI_MODEL ||
            "gpt-6-luna",
          input: prompt,
          max_output_tokens: 1200,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            "حدث خطأ من OpenAI.",
        },
        { status: response.status }
      );
    }

    let answer = data?.output_text;

    if (!answer && Array.isArray(data?.output)) {
      answer = data.output
        .flatMap(
          (item: any) =>
            item?.content || []
        )
        .filter(
          (item: any) =>
            item?.type === "output_text"
        )
        .map(
          (item: any) => item?.text
        )
        .filter(Boolean)
        .join("\n");
    }

    return NextResponse.json({
      answer:
        answer ||
        "لم يصل رد.",
    });
  } catch (error) {
    console.error(
      "AI ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "حدث خطأ في خادم الذكاء الاصطناعي.",
      },
      { status: 500 }
    );
  }
}