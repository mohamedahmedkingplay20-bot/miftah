export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
) {
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;

  if (!scriptUrl) {
    throw new Error(
      "GOOGLE_SCRIPT_URL غير موجود في .env.local"
    );
  }

  const response = await fetch(scriptUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to,
      resetUrl,
    }),
    cache: "no-store",
  });

  const raw = await response.text();

  let data: any = null;

  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(
      "Google Apps Script لم يرجع JSON صحيح."
    );
  }

  if (!response.ok || !data?.ok) {
    throw new Error(
      data?.error || "فشل إرسال الإيميل."
    );
  }

  return true;
}