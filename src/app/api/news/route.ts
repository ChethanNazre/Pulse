import { respond } from "@/lib/serverApi";
export const dynamic = "force-dynamic";
export const GET = (req: Request) => respond("news", req, "NEWS_API_KEY");
