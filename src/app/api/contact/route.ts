import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validators/contact";
import { enforceRateLimit } from "@/lib/server/api-guard";
import { sanitizePlainText } from "@/lib/server/sanitize";

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, {
    name: "contact",
    limit: 12,
    windowMs: 60_000,
  });
  if (limited) {
    return limited;
  }

  const payload = (await request.json()) as unknown;
  const parsed = contactSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid contact payload." }, { status: 400 });
  }

  const data = parsed.data;
  const sanitized = {
    name: sanitizePlainText(data.name),
    email: sanitizePlainText(data.email),
    message: sanitizePlainText(data.message),
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json(
    {
      ok: true,
      received: sanitized,
    },
    { status: 201 },
  );
}
