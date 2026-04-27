import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const days = Number(searchParams.get("days") ?? "7");
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - days);

  const [avgConfidence, lowConfidenceCount] = await Promise.all([
    prisma.foodEntry.aggregate({
      _avg: { confidence: true },
      where: { createdAt: { gte: start } }
    }),
    prisma.foodEntry.count({
      where: { createdAt: { gte: start }, confidence: { lt: 0.8 } }
    })
  ]);

  return NextResponse.json({
    dateWindowDays: days,
    legacyMetricEventsNote: "MetricEvent model removed — use structured logging or analytics instead.",
    parsingQuality: {
      averageConfidence: Number((avgConfidence._avg.confidence ?? 0).toFixed(2)),
      lowConfidenceEntries: lowConfidenceCount
    }
  });
}
