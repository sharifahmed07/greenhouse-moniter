import { NextResponse } from "next/server";
import { serverError } from "@/server/responses";
import { getGroupedHistoryData } from "@/server/sensors";

export async function GET() {
  try {
    return NextResponse.json(await getGroupedHistoryData());
  } catch {
    return serverError();
  }
}
