import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function validationError(error: ZodError) {
  return NextResponse.json(
    {
      error: {
        code: "INVALID_PAYLOAD",
        message: "Invalid payload",
        details: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
    },
    { status: 400 },
  );
}

export function serverError() {
  return NextResponse.json(
    { error: { code: "INTERNAL_SERVER_ERROR", message: "Internal server error" } },
    { status: 500 },
  );
}

export function rateLimitError() {
  return NextResponse.json(
    { error: { code: "RATE_LIMIT_EXCEEDED", message: "Rate limit exceeded" } },
    { status: 429 },
  );
}
