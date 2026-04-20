import { NextResponse } from "next/server";
import { checkRateLimit, rateLimitKey } from "@/server/rate-limit";
import { rateLimitError, serverError, validationError } from "@/server/responses";
import { ingestReading } from "@/server/sensors";
import { ingestSchema } from "@/server/validation";

export async function POST(request: Request) {
  if (!checkRateLimit(rateLimitKey(request)).allowed) {
    return rateLimitError();
  }

  const body = await request.json().catch(() => null);
  const parsed = ingestSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  try {
    await ingestReading(parsed.data);
    return NextResponse.json({ ok: true });
  } catch {
    return serverError();
  }
}
