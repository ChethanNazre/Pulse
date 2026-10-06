import { respond } from "@/lib/serverApi";
export const dynamic = "force-dynamic";
export const GET = (req: Request) => respond("movie", req, "TMDB_API_KEY");
