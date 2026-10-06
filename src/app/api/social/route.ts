import { respond } from "@/lib/serverApi";
export const dynamic = "force-dynamic";
export const GET = (req: Request) => respond("social", req, null);
