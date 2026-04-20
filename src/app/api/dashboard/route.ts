import { NextResponse } from "next/server";
import { serverError } from "@/server/responses";
import { getDashboardData } from "@/server/sensors";

export async function GET() {
  try {
    return NextResponse.json(await getDashboardData());
  } catch {
    return serverError();
  }
}
