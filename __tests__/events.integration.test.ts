/** @jest-environment node */
import { GET } from "@/app/api/events/route";
import { TextDecoder } from "node:util";

describe("SSE refresh endpoint", () => {
  it("opens a no-cache event stream with a connection event", async () => {
    const response = await GET();
    expect(response.headers.get("content-type")).toContain("text/event-stream");
    expect(response.headers.get("cache-control")).toContain("no-cache");
    const reader = response.body!.getReader();
    const first = await reader.read();
    expect(new TextDecoder().decode(first.value)).toContain("event: connected");
    await reader.cancel();
  });
});
