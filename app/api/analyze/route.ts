import { analyzeBill } from "@/lib/analyze";
import type { BillInput } from "@/lib/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as BillInput;
  const result = await analyzeBill(body);
  return NextResponse.json(result);
}
