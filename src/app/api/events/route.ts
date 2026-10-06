import { TextEncoder } from "node:util";
import { ReadableStream } from "node:stream/web";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const encoder = new TextEncoder();
  let interval: ReturnType<typeof setInterval>;
  let heartbeat: ReturnType<typeof setInterval>;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(`event: connected\ndata: ${JSON.stringify({ ok: true })}\n\n`));
      interval = setInterval(() => controller.enqueue(encoder.encode(`event: feed-update\ndata: ${JSON.stringify({ at: Date.now() })}\n\n`)), 30_000);
      heartbeat = setInterval(() => controller.enqueue(encoder.encode(": keep-alive\n\n")), 15_000);
    },
    cancel() { clearInterval(interval); clearInterval(heartbeat); },
  });
  return new NextResponse(stream as unknown as BodyInit, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" } });
}
